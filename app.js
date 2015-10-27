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

    console.log("Scrapping: " + source.url);

    if (scrapper.isJson) {
        request(source.url.replace('{{page}}', 1), function (err, response, data) {
            if (!err) {
                var js = JSON.parse(data);
                var total = js.list.products_total;
                console.log("Total products found: " + total);
                for (var i = 0; i < total / 30; i++) {
                    scrapeJson(source.url, (i + 1), scrapper.baseurl, category, logo, brand);
                }
                callback(null);
            }
        });


    } else {
        parser(source.url, scrapper.list, [{
            name: scrapper.name,
            image: scrapper.image,
            price: scrapper.price,
            link: scrapper.link
            }])(function (err, output) {
            if (err) console.log(err);
            if (typeof output !== 'undefined') {
                insert(output, category, logo, brand);
                console.log("Scrapping done: " + output.length + " records found");
                callback(null)
            } else {
                console.log("Could not scrape webpage. Webpage might be unvailable or taking too long to respond.");
            }
        })
    }

});

function scrapeJson(url, page, baseurl, category, logo, brand) {
    var targetUrl = url.replace('{{page}}', page);
    request(targetUrl, function (err, response, data) {
        console.log("Scrapping: " + targetUrl)
        if (!err) {
            var js = JSON.parse(data);
            var products = js.list.products;
            var output = []

            products.forEach(function (product, index) {
                var item = {
                    name: product.name,
                    image: "http:" + product.image,
                    price: product.final_price,
                    link: baseurl + product.url
                }

                output.push(item)

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


function insert(records, category, logo, brand) {
    var values = [];
    try {
        records.forEach(function (element, index) {
            values.push([1, logo, util.clean(element.name), '', category, brand, util.extractNumber(element.price), util.clean(element.image), util.clean(element.link), '', '']);
        });

        if (values.length > 0) {
            pool.getConnection(function (err, connection) {
                var sql = "INSERT INTO products (m_id, m_logo, name, description, category, brand, price, image, url, size, color) VALUES ? ON DUPLICATE KEY UPDATE m_id=m_id, m_logo=m_logo, name=name, description=description, category=category, brand=brand, price=price, image=image, size=size, color=color ";
                connection.query(sql, [values], function (err) {
                    if (err);
                    connection.release();
                });
            });
        }
    } catch (e) {

    }

}
