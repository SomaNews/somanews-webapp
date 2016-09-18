var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
  title: { type: String, default: '' },
  author: { type: String, default: '' },
  link: { type: String, default: '' },
  provider: { type: String, default: '' },
  category: { type: String, default: '' },
  description: { type: String, default: '' },
  publishedAt: { type: Date, default: null }
});

mongoose.model('Article', ArticleSchema);
