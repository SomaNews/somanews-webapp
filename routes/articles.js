var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Article = mongoose.model('Article');

/* GET home page. */
router.get('/:id', function (req, res, next) {
    var article = Article.findOne({ _id: req.params.id}, function(err, data){
        if(err) throw err;
        res.send(data);
    });
});

module.exports = router;
