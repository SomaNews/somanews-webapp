var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Article = mongoose.model('Article');

/* GET home page. */
router.get('/:id', function (req, res, next) {
    Article.findOne({_id: req.params.id}, function (err, article) {
        if (err) throw err;
        res.render('article', {article: article});
    });
});

module.exports = router;
