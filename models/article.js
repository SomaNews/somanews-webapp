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
                clusterType: clusterType,
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
 * @param count - Number of articles to get
 * @param callback - callback (err, articles)
 */
exports.findRelatedArticles = function (colls, seedArticle, count, callback) {
    "use strict";

    // Vector input is not yet implemented
    if(seedArticle._id === undefined) {
        return callback(new Error('Not implemented'));
    }

    // Find cluster and return articles there
    colls.articleDB
        .find({cluster: seedArticle.cluster}, {content: 0})  // 같은 클러스터의 뉴스들. 컨텐츠는 제거한다.
        .sort({publishedAt: -1})  // publsh
        .limit(count)
        .toArray(callback);
};



/**
 * Find most recent news per cluster
 *
 * @param colls - Collection being used
 * @param clusterCount - Number of clusters to get
 * @param callback - callback(err, articles)
 */
exports.listNewestNewsPerCluster = function (colls, clusterCount, callback) {
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
                .sort({ntc: -1}).limit(clusterCount).toArray(cb);
        },
        (data, cb) => {
            callback(null, data);
            cb(null);
        }
    ], (err) => {
        if (err) callback(err);
    });
};

