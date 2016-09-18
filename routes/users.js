var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Log = mongoose.model('Log');
var Article = mongoose.model('Article');
var dateUtils = require('../utils/dateUtils');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

/* GET feed page. */
router.get('/:id/feed', function (req, res, next) {
    res.render('feed');
});

/*
    뉴스 목록 가져오기
 */
router.get('/:id/articles', function (req, res, next) {
    Article.aggregate([
        //  { $match : { publishedAt : { $gt: dateUtils.getYesterday() } } },
         { $group : { _id : "$category", articles: { $push: "$$ROOT" } } }
    ],
    function (err, result) {
        if (err) {
            res.send(err);
            return;
        }
        res.send(result);
    });
});

/*
    뉴스를 처음 클릭 했을 때, 뉴스를 보기 시작했다는 로그 수집
 */
router.post('/:id/articles/:articleId/start', function (req, res, next) {
    var startLog = new Log({
        user: req.params.id,
        article: req.params.articleId
    });

    startLog.save(function(err) {
        res.send('success');
    });
});

/*
    뉴스를 다보고 다음 뉴스로 넘어가거나, 종료할 떄, 뉴스를 다보았다는 로그 수집
 */
router.post('/:id/articles/:articleId/end', function (req, res, next) {
    var endLog = new Log({
        user: req.params.id,
        article: req.params.articleId,
        endedAt: new Date()
    });

    endLog.save(function(err) {
        res.send('success');
    });
});


module.exports = router;
