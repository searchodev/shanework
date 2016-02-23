var phantom = require('x-ray-phantom');
var Xray = require('x-ray');

var x = Xray()
    .driver(phantom());

x('http://www.google.com', 'title')(function (err, str) {
    if (err) return done(err);
    console.log(str);
})