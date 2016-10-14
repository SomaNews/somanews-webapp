var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Article = mongoose.model('Article');

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
    Article.find({}, function (err, articles) {
        if (err) throw err;
        res.render('feed', {articles: articles});
    });
});

// Article.aggregate({
//     $group: {_id: "$cluster", count: {$sum: 1}}
// })

// Article.aggregate([
//     {
//         $group: {
//             _id: "$cluster"
//         }
//     },
//     {
//         $sort: {
//             "publishedAt": -1
//         }
//     }
// ])

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
