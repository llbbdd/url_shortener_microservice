var express = require('express');
var mongo = require('mongodb');
var urlValid = require('url-valid');
var crypto = require('crypto');

var port = 8080;
var mongoDatabase = "mongodb://localhost:27017/shorturl";
var mongoCollection = "docs";

var app = express();
mongo.MongoClient;

app.get('/new/:url', function(req, res) {
    var originalUrl = req.params.url;
    
    res.setHeader('Content-Type', 'application/json');
    
    urlValid(originalUrl, function (err, shortUrl) {
        if (err){
            res.send(JSON.stringify({ "original_url": "error", "short_url": "error"}));
        }
        else{
            generateUniqueIdentifier(function(shortUrl){
                addSite(originalUrl, shortUrl, function(originalUrl, shortUrl){
                    res.send(JSON.stringify({ "original_url": originalUrl, "short_url": shortUrl}));
                });
            });
        }
    });
});

app.listen(port, function () {
    console.log('URL Shortener Microservice app listening on port ' + port);
});

function generateUniqueIdentifier(callback){
    crypto.randomBytes(4, function(err, buffer) {
        if(err){
            console.log("Short URL generation error - Can't create random bytes");
            console.log(err);
        }
        else{
            
            var identifier = buffer.toString('hex');

            identifierIsUnique(identifier, function(isUnique){
                if(isUnique){
                    callback(identifier);
                }
                else{
                    generateUniqueIdentifier(callback);
                }
            });
        }
    });
}

function identifierIsUnique(uniqueIdentifier, callback){
    var isUnique = false;
    mongo.connect(mongoDatabase, function(err, db) {
        if(err){
            console.log("Database error - Can't connect to database");
            console.log(err);
        }
        else{
            var collection = db.collection(mongoCollection);
            
            collection.find({
                "short": uniqueIdentifier
            }).toArray(function(err, sites) {
                if(err){
                    console.log("Database error - Can't get records");
                    console.log(err);
                }
                else{
                    db.close();
                    
                    if(sites.length === 0){
                        callback(true);
                    }
                    else{
                        callback(false);
                    }
                }
            });
        }
    });
}

function addSite(originalUrl, shortUrl, callback){
    var site = {original: originalUrl, short: shortUrl};
    
    mongo.connect(mongoDatabase, function(err, db) {
        if(err){
            console.log("Database error - Can't connect to database");
            console.log(err);
        }
        else{
            var collection = db.collection(mongoCollection);
            
            collection.insert(site, function(err, data) {
                if(err){
                    console.log("Database error - Can't insert site");
                    console.log(err);
                }
            });
            
            callback(originalUrl, shortUrl);
        }
        
        db.close();
    });
}

function showDB(){
    mongo.connect(mongoDatabase, function(err, db) {
        if(err){
            console.log("Database error - Can't connect to database");
            console.log(err);
        }
        else{
            var collection = db.collection(mongoCollection);
            
            collection.find().toArray(function(err, sites) {
                if(err){
                    console.log("Database error - Can't get records");
                    console.log(err);
                }
                else{
                    console.log(sites);
                }
            })
        }
        
        db.close();
    });
}