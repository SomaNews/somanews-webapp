var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = mongoose.model('User');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

/* GET login page. */
router.get('/users', function (req, res, next) {
    res.render('login');
});

router.get('/feed', function (req, res, next) {
    res.render('feed');
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

    user.save(function(err) {
        // TODO 로그인 API 적용
        res.send('feed');
    });
});

router.get('/feed/1', function (req, res, next) {
    res.render('news');
});

module.exports = router;
