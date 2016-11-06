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
 * Find most recent news per cluster
 * @param callback - callback(err, articles)
 */
exports.listNewestNewsPerCluster = function (callback) {
    'use strict';

    Cluster.find().sort({ "clusteredAt": 'desc', "cohesion": 'desc' }).limit(12).exec(callback);
};

/**
 * Find cluster
 * @param callback - callback(err, articles)
 */
exports.findCluster = function (cluster, callback) {
    'use strict';

    Cluster.findOne({"cluster": cluster}).exec(callback);
};