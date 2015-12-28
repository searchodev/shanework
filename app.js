/*
    File Name: app.js
    Purpose: Scrapping the web.
    Author: Shane Ramiah (shane@wirebytes.com)
*/


// Module dependencies
var fs = require('fs');
var path = require('path');
var xray = require('x-ray');
var mysql = require('mysql');
var async = require("async");
var request = require("request");
var jselect = require("JSONSelect");
var cheerio = require('cheerio')

// Custom Module dependency
var util = require('./lib/util.js');

// Setting configuration folder
var configDir = path.join(__dirname, 'config');

var args = process.argv.slice(2);

var sourceName = args[0] || 'fabfurnish';

// Getting config from file
var db = JSON.parse(fs.readFileSync(configDir + '/db.json', 'utf8'));
var sources = JSON.parse(fs.readFileSync(configDir + '/sources/' + sourceName + '.json', 'utf8'));
var scrappers = JSON.parse(fs.readFileSync(configDir + '/scrappers.json', 'utf8'));

// MySQL connection
var connection = mysql.createConnection(db);

var mysql = require('mysql');
var pool = mysql.createPool(db);

// Creating an instance of the scrapper
var parser = xray()
    .timeout(300000);

async.eachSeries(sources, function (source, callback) {
    scrapper = scrappers[source.scrapper];

    var category = source.category;
    var logo = scrapper.logo;
    var brand = scrapper.brand;
    var isMobile = scrapper.isMobile || false;
    var totalSelector = scrapper.total;
    var totalPerPage = scrapper.totalPerPage;

    var selectors = {
        list: scrapper.list,
        name: scrapper.name,
        image: scrapper.image,
        price: scrapper.price,
        priceAlt: scrapper.priceAlt || '',
        link: scrapper.link
    };

    if (scrapper.isDynamic) {
        if (scrapper.isJSON) {
            request(source.url.replace('{{page}}', 1), function (err, response, data) {
                if (!err) {
                    var js = JSON.parse(data);
                    var total = jselect.match(totalSelector, js);
                    //var total = js.list.products_total;
                    console.log("Scrapping: " + source.url);
                    console.log("Total products found: " + total);
                    for (var i = 0; i < total / totalPerPage; i++) {
                        scrapeJson(source.url, (i + 1), scrapper.baseurl, category, logo, brand, selectors);
                    }
                    callback(null);
                }
            });
        } else if (scrapper.isHTML) {
          parser(source.url.replace('{{page}}', 1), totalSelector)( function (err, data) {
              if (!err) {
                  var total = 0;
                  if (scrapper.extractTotal)
                  {
                    total = util.extractTotal(data);
                  }
                  else {
                    total = util.extractNumber(data);
                  }

                  console.log("Scrapping: " + source.url);
                  console.log("Total products found: " + total);
                  scrapeHTML(source.url, 1, total, totalPerPage, scrapper.baseurl, category, logo, brand, selectors, true);
                  callback(null);
              }
              else {
                console.log(err)
              }
          });
        } else if (scrapper.isHybrid) {
          parser(source.urlPage, totalSelector)( function (err, data) {
              if (!err) {
                  var total = util.extractNumber(data);
                    console.log("Scrapping: " + source.url);
                    console.log("Total products found: " + total);
                    scrapeHybrid(source.url, 1, scrapper.baseurl, category, logo, brand, selectors);
                    callback(null);
              }
          });
        }

    } else {
        var paginate = scrapper.paginate;
        parser(source.url, scrapper.list, [{
            name: scrapper.name,
            image: scrapper.image,
            price: scrapper.price,
            link: scrapper.link
            }]).paginate(paginate)(function (err, output) {
            if (err) console.log(err);
            if (typeof output !== 'undefined') {
                console.log("Scrapping: " + source.url);
                insert(output, category, logo, brand, isMobile);
                console.log("Scrapping done: " + output.length + " records found");
                callback(null)
            } else {
                console.log("Could not scrape webpage. Webpage might be unvailable or taking too long to respond.");
            }
        })
    }

});

function scrapeHTML(url, page, total, totalPerPage, baseurl, category, logo, brand, selectors, last) {


    if (isNaN(total))
    {
      total = 0;
    }

    if ((page < total / totalPerPage) || last){

      var targetUrl = url.replace('{{page}}', page);
      console.log(targetUrl);

      if (selectors.priceAlt == '')
      {
        selectors.priceAlt = selectors.price;
      }
      parser(targetUrl, selectors.list, [{
          name: selectors.name,
          image: selectors.image,
          price: selectors.price,
          priceAlt: selectors.priceAlt,
          link: selectors.link
          }])(function (err, output) {
          if (err) console.log(err);
          if (typeof output !== 'undefined') {
              console.log("Scrapping: " + url);
              insert(output, category, logo, brand);
              console.log("Scrapping done: " + output.length + " records found");
              if (output.length > 0)
              {
                  scrapeHTML(url, (page + 1), total, totalPerPage, baseurl, category, logo, brand, selectors, true);
              }
              else {
                  scrapeHTML(url, (page + 1), total, totalPerPage, baseurl, category, logo, brand, selectors, false);
              }

          } else {
              console.log("Could not scrape webpage. Webpage might be unvailable or taking too long to respond.");
          }
        });

    }
    else {
        callback(null);
    }

}



function scrapeJson(url, page, baseurl, category, logo, brand, selectors) {
    var targetUrl = url.replace('{{page}}', page);
    request(targetUrl, function (err, response, data) {
        console.log("Scrapping: " + targetUrl)
        if (!err) {
            var js = JSON.parse(data);
            var products = jselect.match(selectors.list, js);
            var output = [];

            products[0].forEach(function (product, index) {
                var item = {
                    name: product[selectors.name],
                    image: "http:" + product[selectors.image],
                    price: product[selectors.price],
                    link: baseurl + product[selectors.link]
                };
                output.push(item);
            })
            if (typeof output !== 'undefined') {
                insert(output, category, logo, brand);
                console.log("Scrapping done: " + output.length + " records found");
            } else {
                console.log("Could not scrape webpage. Webpage might be unvailable or taking too long to respond.");
            }
        }
    })
}


function scrapeHybrid(url, page, baseurl, category, logo, brand, selectors) {
    var targetUrl = url.replace('{{page}}', page);
    request(targetUrl, function (err, response, data) {
        console.log("Scrapping: " + targetUrl)
        var output = [];
        if (!err) {
            var js = JSON.parse(data);

            var html = js.html;

            $ = cheerio.load(html);

            var products = $('.grid-view');

            products.each(function (index, product) {

                var item = {
                    name: $(product).find(".card-body-title").text(),
                    image: $(product).find(".card-header-img").find("a").find("img").attr('src'),
                    price: $(product).find(".card-body-title").text(),
                    link: baseurl + $(product).find(".card-header-img > img").attr('src')
                };
                output.push(item);


            })


            if (typeof output !== 'undefined') {
                insert(output, category, logo, brand);
                console.log("Scrapping done: " + output.length + " records found");
            } else {
                console.log("Could not scrape webpage. Webpage might be unvailable or taking too long to respond.");
            }
        }
    })
}


function insert(records, category, logo, brand, isMobile) {

    var values = [];
    try {
        records.forEach(function (element, index) {
            var link = util.clean(element.link)
            if (isMobile) {
                link = link.replace('m.', 'www.');
            }
            var price = 0;
            if (typeof element.priceAlt != 'undefined')
            {
              price = util.extractPrice(element.priceAlt);
            }
            else {
              price = util.extractPrice(element.price);
            }


            if (typeof price != 'undefined')
            {
                values.push([1, logo, util.clean(element.name), '', category, brand, price, util.clean(element.image), link, '', '']);
            }
        });
        if (values.length > 0) {
            console.log("Inserting: " + values.length + " Records");
            console.log(values);
            pool.getConnection(function (err, connection) {
                var sql = "INSERT INTO products (m_id, m_logo, name, description, category, brand, price, image, url, size, color) VALUES ? ON DUPLICATE KEY UPDATE m_id=m_id, m_logo=m_logo, name=name, description=description, category=category, brand=brand, price=price, image=image, size=size, color=color ";
                if (typeof connection != 'undefined') {
                    connection.query(sql, [values], function (err) {
                        if (err);
                        connection.release();
                    });
                }
            });
        }
    } catch (e) {

    }

}
