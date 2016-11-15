/**
 * Created by whyask37 on 2016. 11. 13..
 */

var MongoClient = require('mongodb').MongoClient;

var mainDb = null;


/**
 * Get database
 * @param callback - callback(err, db)
 */
function getDB(callback) {
    "use strict";

    if (!mainDb) {
        mainDb = MongoClient.connect("mongodb://ssomanews:ssomanews1029@104.199.210.143:27017/somanews", {
            server: {
                auto_reconnect: true
            }
        });
    }
    mainDb.then(function (db) {
        return callback(null, db);
    }, function (err) {
        callback(err);
    });
}

exports.getDB = getDB;


/**
 * Get collection
 * @param name - Collection name
 * @param callback - callback(err, collection)
 */
exports.getCollection = function (name, callback) {
    "use strict";
    getDB((err, db) => {
        if (err) return callback(err);
        db.collection(name, callback);
    });
};


