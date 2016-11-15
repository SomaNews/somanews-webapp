var knearest = require('../utils/knearest');

var mongodb = require('mongodb');
var dbconn = require('../utils/dbConnector');
var async = require('async');

/**
 * Select article collection based on clusterType
 *
 * @param clusterType - clusterType. 'A' or 'B'
 * @param callback - callback(err, {articleDB: ~, clusterDB: ~})
 */
exports.selectCollection = function (clusterType, callback) {
    "use strict";

    var articleDB, clusterDB;

    dbconn.getDB((err, db) => {
        if (err) return callback(err);

        var articleDBname, clusterDBname;


        if(clusterType == 'A') {
            articleDBname = 'aarticles';
            clusterDBname = 'aclusters';
        }
        else {
            articleDBname = 'barticles';
            clusterDBname = 'bclusters';
        }

        articleDB = db.collection(articleDBname);
        clusterDB = db.collection(clusterDBname);

        Promise.all([articleDB, clusterDB]).then((values) => {
            callback(null, {
                articleDB: values[0],
                articleDBName: articleDBname,
                clusterDB: values[1],
                clusterDBName: clusterDBname
            });
        }, (err) => {
            callback(err);
        });
    });
};


/**
 * Get article from article id
 * @param colls - Collection being used
 * @param id - Article ID
 * @param callback - callback (err, article)
 */
exports.getArticle = function (colls, id, callback) {
    'use strict';
    colls.articleDB.find({_id: id}).next(callback);
};


/**
 * Find up to 9 articles related to specific article
 * @param colls - Collection being used
 * @param seedArticle - Article to search from, or Vector
 * @param callback - callback (err, articles)
 */
exports.findRelatedArticles = function (colls, seedArticle, callback) {
    'use strict';

    if(!knearest.isVectorLoaded()) {
        // Retry after vector load
        console.log('Loading vectors...');
        colls.articleDB.find({}, {'vector': 1}).toArray(function (err, articles) {
            if (err) {
                return callback(new Error('Vector loading failed'));
            }

            var labels = [], vectors = [];
            for(var i = 0 ; i < articles.length ; i++) {
                labels.push(articles[i]._id);
                vectors.push(articles[i].vector);
            }
            console.log('Number of articles : ' + labels.length);
            knearest.loadVectors(labels, vectors);

            // Retry!
            exports.findRelatedArticles(colls, seedArticle, callback);
        });
        return;
    }

    var seedVector = seedArticle.vector || seedArticle;
    var labels = knearest.findSimilarVectorIndexes(seedVector, 10);
    colls.articleDB.find(
        {
            '_id': {
                $ne: seedArticle._id || undefined,
                $in: labels
            }
        }
    ).limit(9).toArray(callback);
};


/**
 * Find most recent news per cluster
 *
 * @param colls - Collection being used
 * @param callback - callback(err, articles)
 */
exports.listNewestNewsPerCluster = function (colls, callback) {
    'use strict';

    // Get nearset cluster
    async.waterfall([
        (cb) => {
            colls.clusterDB.find().sort({clusteredAt: -1}).limit(1).next(cb);
        },
        (ret, cb) => {
            if (!ret) {
                return callback(new Error('No cluster data!'));
            }
            colls.clusterDB.find({clusteredAt: {$gte: ret.clusteredAt}}, {leading: 1})
                .sort({ntc: -1}).limit(24).toArray(cb);
        },
        (data, cb) => {
            callback(null, data);
            cb(null);
        }
    ], (err) => {
        if (err) callback(err);
    });
};

