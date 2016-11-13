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

        coll.insertOne({
            user: userID,
            article: articleID,
            startedAt: new Date()
        }, function (err, startLog) {
            if (err) {
                return callback(err, null);
            }
            callback(null, startLog.insertedId);
        });
    });
};

/**
 * Log that viewToken has expired.
 * @param viewToken - Token from {@link logArticleEnter}
 * @param callback - callback(err)
 */

exports.logArticleLeave = function (viewToken, callback) {
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
            { $sort: { startedAt: -1 } },
            { $skip: start },
            { $limit: count },
            { $lookup: {
                from: colls.articleDBName,
                localField: 'article',
                foreignField: '_id',
                as: 'article'
            }},
            { $unwind: '$article' }
        ], function (err, ret) {
            if (err) {
                return callback(err);
            }
            return callback(null, ret);
        });
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
            {$match: {user: new mongodb.ObjectId(userID)}},
            {$sort: {startedAt: -1}},
            {$limit: 100},  // Count only up to 100 articles
            {
                $lookup: {
                    from: colls.articleDBName,
                    localField: 'article',
                    foreignField: '_id',
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
        ], callback);
    });
};
