var express = require('express');
var mongo = require('mongodb');
var validUrl = require('valid-url');

var port = 8080;
var mongoDatabase = "mongodb://localhost:27017/shorturl";
var mongoCollection = "docs";

var app = express();
mongo.MongoClient;

app.get('/new/:url', function(req, res) {
    var originalUrl = req.params.url;
    
    res.setHeader('Content-Type', 'application/json');
    
    if (typeof validUrl.isUri(originalUrl) === 'undefined'){
        console.log("not adding");
        res.send(JSON.stringify({ "original_url": "error", "short_url": "error"}));
    }
    else{
        var shortUrl;
    
        addSite(originalUrl, "shorturl");
        
        res.send(JSON.stringify({ "original_url": originalUrl, "short_url": shortUrl}));
        
        showDB();
    }
});

app.listen(port, function () {
    console.log('URL Shortener Microservice app listening on port ' + port);
});

function addSite(originalUrl, shortUrl){
    var site = {original: originalUrl, short: shortUrl};
    
    mongo.connect(mongoDatabase, function(err, db) {
        if(err){
            console.log(err);
        }
        
        var collection = db.collection(mongoCollection);
        
        collection.insert(site, function(err, data) {
            if(err){
                console.log(err);
            }
        });
        
        console.log(JSON.stringify(site));
        
        db.close();
    });
}

function showDB(){
    mongo.connect(mongoDatabase, function(err, db) {
    if(err){
        console.log(err);
    }
    
    var collection = db.collection(mongoCollection);
    
    collection.find().toArray(function(err, sites) {
        if(err){
            console.log(err);
        }
        
        console.log(sites);
    })
    
    db.close();
});
}