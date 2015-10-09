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

// Custom Module dependency
var util = require('./lib/util.js');

// Setting configuration folder
var configDir = path.join(__dirname, 'config');

// Getting config from file
var db = JSON.parse(fs.readFileSync(configDir + '/db.json', 'utf8'));
var sources = JSON.parse(fs.readFileSync(configDir + '/sources.json', 'utf8'));
var scrappers = JSON.parse(fs.readFileSync(configDir + '/scrappers.json', 'utf8'));


// MySQL connection
var connection = mysql.createConnection(db);


var mysql = require('mysql');
var pool = mysql.createPool(db);

// Creating an instance of the scrapper
var parser = xray();


sources.forEach(function (source, index) {
    scrapper = scrappers[source.scrapper]
    var category = source.category;
    var logo = scrapper.logo;
    var brand = scrapper.brand;
    console.log("Scrapping: " + source.url);
    parser(source.url, scrapper.list, [{
        name: scrapper.name,
        image: scrapper.image,
        price: scrapper.price,
        link: scrapper.link
            }])(function (err, output) {
        if (err) console.log(err);
        if (output !== 'undefined') {
            insert(output, category, logo, brand);
            console.log("Scrapping done.");
        }
    })


});

function insert(records, category, logo, brand) {
    var values = [];
    records.forEach(function (element, index) {
        values.push([1, logo, util.clean(element.name), '', category, brand, util.extractNumber(element.price), util.clean(element.image), util.clean(element.link), '', '']);
    });


    pool.getConnection(function (err, connection) {
        var sql = "INSERT INTO products (m_id, m_logo, name, description, category, brand, price, image, url, size, color) VALUES ?";
        connection.query(sql, [values], function (err) {
            if (err) console.log(err);
            connection.release();
        });
    });
}
