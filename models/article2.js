var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    _id: {type: String, default: null},
    title: {type: String, default: ''},
    author: {type: String, default: ''},
    link: {type: String, default: ''},
    content: {type: String, default: ''},
    imageURL: {type: String, default: ''},
    provider: {type: String, default: ''},
    providerNewsID: {type: Number, default: ''},
    category: {type: String, default: ''},
    description: {type: String, default: ''},
    publishedAt: {type: Date, default: null},
    cluster: {type: Number, default: ''}
});

var Article2 = mongoose.model('Article2', ArticleSchema);



/**
 * Find most recent news per cluster
 * @param callback - callback(err, articles)
 */
exports.listNewestNewsPerCluster = function (callback) {
    'use strict';

    Article2.aggregate([
        { $sort : { "publishedAt": -1 } },
        { $match : { "imageURL": {$ne: ""} } },
        { $group : {
            '_id': "$cluster",
            count: {$sum: 1},
            clusters: {$push: "$$ROOT"}
        }},
        { $project : {
            count: 1,
            clusters: { $slice: ["$clusters", 0, 1] }
        } }
    ], callback);
};


/**
 * Get article from article id
 * @param id - Article ID
 * @param callback - callback (err, article)
 */
exports.getArticle = function (id, callback) {
    'use strict';
    Article2.findOne({_id: id}, function (err, ret) {
        return callback(err, ret);
    });
};


/**
 * Find up to 9 articles related to specific article
 * @param seedArticle - Article to search from
 * @param callback - callback (err, articles)
 */
exports.findRelatedArticles = function (seedArticle, callback) {
    'use strict';
    Article2.find({
        _id: {$ne: seedArticle._id},
        cluster: seedArticle.cluster
    }, callback).limit(9);
};
