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

    var articleDBname, clusterDBname;
    var articleDB, clusterDB;

    async.waterfall([
        // Get main DB
        (cb) => {
            dbconn.getDB(cb);
        },

        // Get articleDB and clusterDB
        (db, cb) => {
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

            Promise.all([articleDB, clusterDB]).then(
                (values) => cb(null, values),
                (err) => cb(err)
            );
        },

        // Get last clustered time
        (values, cb) => {
            articleDB = values[0];
            clusterDB = values[1];

            clusterDB.findOne({$query: {}, $orderBy: {clusteredAt: -1}}, {clusteredAt: 1}, cb);
        },
        (lastCluster, cb) => {
            callback(null, {
                clusterType: clusterType,
                clusteredAt: lastCluster.clusteredAt,
                articleDB: articleDB,
                articleDBName: articleDBname,
                clusterDB: clusterDB,
                clusterDBName: clusterDBname
            });
            cb(null);
        }
    ], (err) => {
        if (err) callback(err);
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
    colls.articleDB.find({
        clusteredAt: colls.clusteredAt,
        article_id: id
    }).next(callback);
};


/**
 * List articles in time order
 * @param colls - Collections being used
 * @param start - (Paging) How many to skip
 * @param count - (Paging) How many to fetch
 * @param callback - callback (err, articles)
 */
exports.listArticles = function (colls, start, count, callback) {
    "use strict";
    colls.articleDB.find({clusteredAt: colls.clusteredAt}, {content: 0})
        .sort({'publishedAt': -1, '_id': -1})
        .skip(start).limit(count).toArray(callback);
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
    if(seedArticle.article_id === undefined) {
        return callback(new Error('Not implemented'));
    }

    // This article itself is not related!
    // var excludes = (colls.readArticles || []).slice(0);
    // excludes.push(seedArticle.article_id);
    var excludes = [];

    // Find cluster and return articles there
    colls.articleDB
        .find({
            clusteredAt: colls.clusteredAt,
            _id: {$nin: excludes},
            cluster: seedArticle.cluster
        }, {content: 0})  // 같은 클러스터의 뉴스들. 컨텐츠는 제거한다.
        .sort({publishedAt: -1})  // 최신 뉴스부
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
exports.listClusters = function (colls, clusterCount, callback) {
    'use strict';

    async.waterfall([
        // Find when clustering had happened most recently
        (cb) => {
            // Get clusters
            colls.clusterDB.find({clusteredAt: colls.clusteredAt}, {'articles.content': 0})
                .sort({rank: -1}).limit(clusterCount).toArray(cb);
        },
        (data, cb) => {
            callback(null, data);
            cb(null);
        }
    ], (err) => {
        if (err) callback(err);
    });
};
