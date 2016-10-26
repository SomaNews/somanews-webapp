var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LogSchema = new Schema({
    user: {type: Schema.ObjectId, ref: 'User'},
    article: {type: Schema.ObjectId, ref: 'Article'},
    startedAt: {type: Date, default: Date.now},
    endedAt: {type: Date, default: null}
});

var Log = mongoose.model('Log', LogSchema);

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

    var startLog = new Log({
        user: userID,
        article: articleID,
        startedAt: new Date()
    });

    startLog.save(function (err, startLog) {
        if (err) {
            return callback(err, null);
        }
        callback(null, startLog._id);
    });
};

/**
 * Log that viewToken has expired.
 * @param viewToken - Token from {@link logArticleEnter}
 * @param callback - callback(err)
 */

exports.logArticleLeave = function (viewToken, callback) {
    'use strict';

    Log.findById(viewToken, function (err, logEntry) {
        if (err) {
            return callback(err);
        }
        if (logEntry === null) {
            return callback(new Error('Invalid viewToken'));
        }
        if (logEntry.endedAt !== null) {
            return callback(new Error('Token has already expired'));
        }
        logEntry.endedAt = new Date();
        logEntry.save(function (err) {
            if (err) {
                return callback(err);
            }
            return callback(null);
        });
    });
};
