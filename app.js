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
// Creating an instance of the scrapper
var parser = xray();


sources.forEach(function (source, index) {
    scrapper = scrappers[source.scrapper]
    var category = source.category;
    console.log("Scrapping: " + source.url);
    parser(source.url, scrapper.list, [{
        name: scrapper.name,
        image: scrapper.image,
        price: scrapper.price,
        link: scrapper.link
            }])(function (err, output) {
        console.log(output);
        output.forEach(function (element, index) {
            console.log({
                name: util.clean(element.name),
                image: util.clean(element.image),
                price: util.extractNumber(element.price),
                link: util.clean(element.link),
                category: category
            });

        }).limit(3);

    })


});