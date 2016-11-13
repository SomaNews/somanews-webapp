var knearest = require('../utils/knearest');

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
    cluster: {type: Number, default: ''},
    vector: {type: Array}
});

var Article = mongoose.model('Article', ArticleSchema);



/**
 * Find most recent news per cluster
 * @param callback - callback(err, articles)
 */
exports.listNewestNewsPerCluster = function (callback) {
    'use strict';

    Article.aggregate([
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
    ], function (err, groups) {
        if (err) {
            return callback(err, null);
        }

        var clusters = [];
        for(var i = 0 ; i < groups.length ; i++) {
            var group = groups[i];
            clusters[i] = {
                leading: group.clusters[0],
                count: group.count,
            };
        }
        return callback(null, clusters);
    });
};


/**
 * Get article from article id
 * @param id - Article ID
 * @param callback - callback (err, article)
 */
exports.getArticle = function (id, callback) {
    'use strict';
    Article.findOne({_id: id}, function (err, ret) {
        return callback(err, ret);
    });
};


/**
 * Find up to 9 articles related to specific article
 * @param seedArticle - Article to search from, or Vector
 * @param callback - callback (err, articles)
 */
exports.findRelatedArticles = function (seedArticle, callback) {
    'use strict';

    if(!knearest.isVectorLoaded()) {
        // Retry after vector load
        console.log('Loading vectors...');
        Article.find({}, {vector: 1}, function (err, articles) {
            if (err) {
                return callback(new Error('Vector loading failed'));
            }
            console.log('Number of articles : ' + articles.length);
            var labels = [], vectors = [];
            for(var i = 0 ; i < articles.length ; i++) {
                labels.push(articles[i]._id);
                vectors.push(articles[i].vector);
            }

            knearest.loadVectors(labels, vectors);
            // Retry!
            exports.findRelatedArticles(seedArticle, callback);
        });
        return;
    }

    var seedVector = seedArticle.vector || seedArticle;
    var labels = knearest.findSimilarVectorIndexes(seedVector, 10);
    Article.find({
            _id: {
                $ne: (seedArticle instanceof Article) ? seedArticle._id : undefined,
                $in: labels
            },
    }, callback).limit(9);
};


exports.getVector = function (articleID, callback) {
    exports.getArticle(articleID, function (err, article) {
        if (err) {
            return callback(err, null);
        }
        return callback(null, article.vector);
    });
};
