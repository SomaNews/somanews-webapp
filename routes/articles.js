var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Article = mongoose.model('Article');
var Cluster = mongoose.model('Cluster');

// 뉴스 리스트
router.get('/', function (req, res, next) {
    // 각 클러스터마다 해당 클러스터에 포함된 뉴스들과 뉴스 갯수를 얻는다.
    Cluster.aggregate([
        { $sort : { "publishedAt": -1 } },
        { $group : {
            _id : "$cluster",
            count: { $sum: 1 },
            clusters: { $push: "$$ROOT" } }
        },
        { $project : {
            count: 1,
            clusters: { $slice: ["$clusters", 0, 1] }
        } }
    ],

    function (err, clusters) {
        if (err) res.send(err);
        res.render('feed', {clusters: clusters});
    });
});


// 각 뉴스마다
router.get('/:id', function (req, res, next) {
        if (err) throw err;
        res.render('article', {article: article});
    });
});

module.exports = router;
