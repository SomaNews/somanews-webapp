var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CrawlerSchema = new Schema({
    name: {type: String, unique: true, default: ''},
    last: {type: Date, default: null}
});

mongoose.model('Crawler', CrawlerSchema);
