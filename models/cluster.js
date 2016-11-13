var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClusterSchema = new Schema({
    _id: {type: String, default: null},
    cluster: {type: Number, default: ''},
    cohesion: {type: Number, default: ''},
    count: {type: Number, default: ''},
    leading: {type: Object, default: ''},
    articles: {type: Array, default: ''},
    clusteredAt: {type: Date, default: null}
});

var Cluster = mongoose.model('Cluster', ClusterSchema);


/**
 * Get article from article id
 * @param id - Article ID
 * @param callback - callback (err, article)
 */
exports.getArticle = function (id, callback) {
    "use strict";
    Cluster.findOne({"articles._id": id}, {"articles.$": 1}, (err, cluster) => {
        if (err) return callback(err);
        if (!cluster) return callback(new Error('Unknown news ' + id));
        return callback(null, cluster.articles[0]);
    });
};


/**
 * Find up to 9 articles related to specific article
 * @param seedArticle - Article to search from, or Vector
 * @param callback - callback (err, articles)
 */
exports.findRelatedArticles = function (seedArticle, callback) {
    "use strict";

    // Vector input is not yet implemented
    if(seedArticle._id === undefined) {
        return callback(new Error('Not implemented'));
    }

    // Find cluster and return articles there
    exports.findClusterContainingArticle(seedArticle._id, (err, cluster) => {
        if (err) {
            return callback(err);
        }

        if (!cluster) {
            return callback(new Error('Unknown news ' + seedArticle._id));
        }

        return callback(null, cluster.articles.slice(0, 9));
    });
};

/**
 * Get most recent cluster containing article
 * @param articleID - Article ID
 * @param callback - callback(err, cluster)
 */
exports.findClusterContainingArticle = function (articleID, callback) {
    Cluster.findOne({
        $query: {"articles._id": articleID},
        $orderBy: {'clusteredAt': -1}
    }, callback);
};

/**
 * Find most recent news per cluster
 * @param callback - callback(err, articles)
 */
exports.listNewestNewsPerCluster = function (callback) {
    'use strict';

    Cluster.find({}, {leading: 1})
        .sort({ "clusteredAt": 'desc', "cohesion": 'desc' })
        .limit(12).exec(callback);
};


/**
 * Find cluster
 * @param cluster - 클러스터의 ID
 * @param callback - callback(err, articles)
 */
exports.findCluster = function (cluster, callback) {
    'use strict';

    Cluster.findOne({"cluster": cluster}).exec(callback);
};
