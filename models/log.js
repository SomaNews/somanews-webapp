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
            function (err, r) {
                if (err) {
                    return callback(err);
                }
                return callback(null);
            }
        );
    });
};

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Get user view log
 * @param userID
 * @param start - Number to skip. Useful for paging.
 * @param count - Number to get.
 * @param callback
 * @returns {*}
 */
exports.getUserLog = function (userID, start, count, callback) {
    "use strict";

    if (count < 0) {
        return callback(new Error('Negative count'));
    }

    // Skip if app requests too much arguments.
    if (count >= 100) {
        count = 100;
    }

    Log.aggregate([
        { $match: {user: new mongoose.Types.ObjectId(userID)} },
        { $sort: { startedAt: -1 } },
        { $skip: start },
        { $limit: count },
        { $lookup: {
            from: 'articles',
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
};
