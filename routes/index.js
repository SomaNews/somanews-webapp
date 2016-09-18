var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = mongoose.model('User');

var crawler = require('../utils/crawler');

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

router.get('/init', function (req, res, next) {
    crawler.init()
    .then(function(articles) {
         console.log("crawler initialized.");
         res.send('success');
    })
    .catch(function(err) {
        /* Error handling */
        console.error(err);
        res.send(err);
    });
});

/* Crawler TEST */
router.get('/crawl', function (req, res, next) {
    crawler.crawl()
    .then(function(articles) {
         console.log("Complete save articles.");
         res.send('success');
    })
    .catch(function(err) {
        /* Error handling */
        console.error(err);
        res.send(err);
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

    user.save(function(err) {
        // TODO 로그인 API 적용
        res.send('feed');
    });
});

router.get('/feed/1', function (req, res, next) {
    res.render('news');
});

module.exports = router;
