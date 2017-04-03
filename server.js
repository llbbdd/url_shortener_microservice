var express = require('express');
var mongo = require('mongodb');
var urlValid = require('url-valid');
var crypto = require('crypto');

var port = 8080;
var mongoDatabase = "mongodb://localhost:27017/shorturl";
var mongoCollection = "docs";

var app = express();
mongo.MongoClient;

app.get('/:shortUrl', function(req, res) {
    var shortUrl = req.params.shortUrl;

    retrieveOriginalUrl(shortUrl, function(originalUrl){
        res.redirect(originalUrl);
    });
});

app.get('/new/:url', function(req, res) {
    var originalUrl = req.params.url;
    
    res.setHeader('Content-Type', 'application/json');
    
    urlValid(originalUrl, function (err, shortUrl) {
        if (err){
            res.send(JSON.stringify({ "original_url": "error", "short_url": "error"}));
        }
        else{
            generateShort(function(shortUrl){
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

function generateShort(callback){
    crypto.randomBytes(4, function(err, buffer) {
        if(err){
            basicError("Short URL generation error - Can't create random bytes", err);
        }
        else{
            
            var identifier = buffer.toString('hex');

            shortIsUnique(identifier, function(isUnique){
                if(isUnique){
                    callback(identifier);
                }
                else{
                    generateShort(callback);
                }
            });
        }
    });
}

function basicError(message, error){
    console.log(message);
    console.log(error);
}

/*
    Project specific database functions
*/

function shortIsUnique(uniqueIdentifier, callback){
    databaseAccess(dbFind, {"short": uniqueIdentifier}, function(results){
        if(results.length === 0){
            callback(true);
        }
        else{
            callback(false);
        }
    });
}

function retrieveOriginalUrl(shortUrl, callback){
    databaseAccess(dbFind, {"short": shortUrl}, function(result){
        if(result.length === 1){
            callback(result[0].original);
        }
        else{
            callback("");
        }
    });
}

function addSite(originalUrl, shortUrl, callback){
    databaseAccess(dbInsert, {original: "//" + originalUrl, short: shortUrl}, function(data){
        callback(originalUrl, shortUrl);
    });
}

/*
    Generic database functions
    
    databaseAccess use examples:
    
    find all records
    databaseAccess(dbFind, null, function(results){
        console.log(results);
    });
    
    find record where short = '2cf2370e'
    databaseAccess(dbFind, {"short": "2cf2370e"}, function(results){
        console.log(results);
    });
*/

function databaseAccess(operationFunction, data, callback){
    mongo.connect(mongoDatabase, function(err, db) {
        if(err){
            basicError("Database error - Can't connect to database", err);
        }
        else{
            operationFunction(db, data, function(resultsArray){
                callback(resultsArray);
            });
        }
        
        db.close();
    });
}

function dbFind(db, data, callback){
    db.collection(mongoCollection).find(data).toArray(function(err, sites) {
        if(err){
            basicError("Database error - Can't find records", err);
        }
        else{
            callback(sites);
        }
    });
}

function dbInsert(db, data, callback){
    db.collection(mongoCollection).insert(data, function(err, data) {
        if(err){
            basicError("Database error - Can't insert site", err);
        }
    });
    
    callback(data);
}