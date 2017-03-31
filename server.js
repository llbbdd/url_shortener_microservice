var express = require('express');

var port = 8080;

var app = express();

app.get('/', function(req, res) {
    var originalUrl;
    var shortUrl;
    
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ "original_url": originalUrl, "short_url": shortUrl}));
});

app.listen(port, function () {
    console.log('URL Shortener Microservice app listening on port ' + port);
});