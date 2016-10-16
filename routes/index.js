var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Article = mongoose.model('Article');
var Cluster = mongoose.model('Cluster');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

/* GET login page. */
router.get('/login', function (req, res, next) {
    res.render('login');
});

/* GET articles page. */
router.get('/articles', function (req, res, next) {
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
        var values = [];
        clusters.forEach(function (result) {
            values.push(result.clusters);
        });
        res.render('feed', {clusters: clusters});
        console.log(clusters);
    });
});

/*
 계정이 있으면 로그인을 하고 없으면 새로 생성한다.

 Parameter : {
    email: String,
    password: String
 }
 */

router.post('/login', function (req, res, next) {
    var user = new User(req.body);

    user.save(function (err) {
        // TODO 로그인 API 적용
        res.send('feed');
    });
});

module.exports = router;
