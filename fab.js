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


// Creating an instance of the scrapper
var parser = xray();

parser("http://www.fabfurnish.com/", '.nav-left > ul > li', [{
    url: "a[href]@href"

            }])(function (err, output) {
    //console.log(output);
    if (err) console.log(err);
    if (output !== 'undefined') {
        console.log("Scrapping done.");
        output.forEach(function (obj, num) {
            if (!obj.url.indexOf('void') > -1) {

                console.log({
                    "url": obj.url,
                    "category": 33,
                    "scrapper": "fabfurnish"
                })
                console.log(',');
            }
        });
    }
})
