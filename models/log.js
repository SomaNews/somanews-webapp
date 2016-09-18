var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LogSchema = new Schema({
    user: { type : Schema.ObjectId, ref : 'User' },
    article: { type : Schema.ObjectId, ref : 'Article' },
    startedAt  : { type : Date, default : Date.now },
    endedAt  : { type : Date, default : null }
});

mongoose.model('Log', LogSchema);
