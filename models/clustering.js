var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClusterSchema = new Schema({
    title: {type: String, default: ''},
    author: {type: String, default: ''},
    link: {type: String, default: ''},
    content: {type: String, default: ''},
    imageUrl: {type: String, default: ''},
    provider: {type: String, default: ''},
    providerNewsID: {type: Number, default: ''},
    category: {type: String, default: ''},
    description: {type: String, default: ''},
    publishedAt: {type: Date, default: null},
    cluster: {type: Number, default: ''},
    vector: {type: Array, default: null}
});

mongoose.model('Cluster', ClusterSchema);
