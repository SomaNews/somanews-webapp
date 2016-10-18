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
    /// TODO: 원래 여기서는 Article 모델을 이용해서 렌더링을 해야 합니다.
    /// feed에서 쓰는 Cluster에서의 _id랑 Article에서 쓰는 _id랑 달라서
    /// 일단 임시로 Cluster에서 article을 참고하도록 해두곤 있는데, 원래
    /// 이러면 안됩니다. 수정해주세요.
    Cluster.findOne({_id: req.params.id}, function (err, ret) {
        if (err) throw err;

        article = {
            title: ret.title,
            author: ret.author,
            publishedAt: ret.publishedAt,
            content: ret.content.replace(/\n/g, "<br>")
        }

        // Render article to html
        res.render('article', {article: article});
    });
});

module.exports = router;
