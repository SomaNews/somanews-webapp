var dbconn = require('../utils/dbConnector');
var mongodb = require('mongodb');

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Log that user has started reading article.
 *
 * @param userID - User ID viewing article
 * @param articleID - Article ID being viewed
 * @param callback - callback(err, viewToken)
 */
exports.logArticleEnter = function (userID, articleID, callback) {
    'use strict';

    dbconn.getCollection('logs', (err, coll) => {
        if (err) return callback(err);

        var currentTime = new Date();

        // Log shouldn't be updated by refreshing.
        // If last log also directs to current article, then re-use last log.
        var cursor = coll.find({user: userID})
            .sort({startedAt: -1})
            .limit(1);

        // First check if we have at least one user log.
        cursor.hasNext((err, yes) => {
            if (err) return callback(err);
            if (yes) {
                // Check if last log's article is equal to articleID
                return cursor.next((err, doc) => {
                    if (doc.article == articleID) {
                        console.log('re-updating ' + doc._id);
                        // update that article and return it again.
                        return coll.update(
                            {_id: new mongodb.ObjectID(doc._id)},
                            { $set: {endedAt: currentTime} },
                            (err, _) => {
                                if (err) return callback(err);
                                callback(null, doc._id);
                            }
                        );
                    }
                    inserter();
                });
            }
            inserter();
        });

        function inserter() {
            coll.insertOne({
                user: userID,
                article: articleID,
                startedAt: currentTime,
                endedAt: currentTime
            }, function (err, startLog) {
                if (err) {
                    return callback(err, null);
                }
                callback(null, startLog.insertedId);
            });
        }
    });
};

/**
 * Log that viewToken has expired.
 * @param viewToken - Token from {@link logArticleEnter}
 * @param callback - callback(err)
 */

exports.logArticlePing = function (viewToken, callback) {
    'use strict';

    dbconn.getCollection('logs', (err, coll) => {
        if (err) return callback(err);

        coll.findOneAndUpdate(
            {_id: new mongodb.ObjectID(viewToken)},
            {$set: {endedAt: new Date()}},
            callback
        );
    });
};

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Get user view log
 * @param colls - Article collections
 * @param userID
 * @param start - Number to skip. Useful for paging.
 * @param count - Number to get.
 * @param callback
 * @returns {*}
 */
exports.getUserLog = function (colls, userID, start, count, callback) {
    "use strict";

    if (count < 0) {
        return callback(new Error('Negative count'));
    }

    // Skip if app requests too much arguments.
    if (count >= 100) {
        count = 100;
    }

    dbconn.getCollection('logs', (err, coll) => {
        if (err) return callback(err);
        coll.aggregate([
            {$match: {user: userID}},
            { $sort: { startedAt: -1 } },
            { $skip: start },
            { $limit: count },
            { $lookup: {
                from: colls.articleDBName,
                localField: 'article',
                foreignField: 'article_id',
                as: 'article'
            }},
            { $unwind: '$article' },
            { $match: {
                'article.clusteredAt': colls.clusteredAt,
            }}
        ], function (err, ret) {
            if (err) {
                return callback(err);
            }
            return callback(null, ret);
        });
    });
};


/**
 * Get articles user have read
 * @param colls - Article collections
 * @param userID - 유저 아이디
 * @param callback - callback(err, articleIDs)
 */
exports.getUserReadArticles = function (colls, userID, callback) {
    "use strict";

    dbconn.getCollection('logs', (err, coll) => {
        if (err) return callback(err);
        coll.distinct('article', {user: userID}, callback);
    });
};

/**
 * 사용자가 많이 본 클러스터를 찾습니다
 * @param colls - Article collections
 * @param userID - 유저 아이디
 * @param callback - callback(err, clusters)
 */
exports.getUserFavoriteClusters = function (colls, userID, callback) {
    "use strict";

    dbconn.getCollection('logs', (err, coll) => {
        if (err) return callback(err);
        coll.aggregate([
            {$match: {user: userID}},
            {$sort: {startedAt: -1}},
            {$limit: 100},  // Count only up to 100 articles
            {
                $lookup: {
                    from: colls.articleDBName,
                    localField: 'article',
                    foreignField: 'article_id',
                    as: 'article'
                }
            },
            {$unwind: '$article'},
            {
                $group: {
                    '_id': "$article.cluster",
                    count: {$sum: 1},
                }
            },
            { $match: {
                'article.clusteredAt': colls.clusteredAt,
            }},
            {$sort: {count: -1}}
        ], callback);
    });
};
