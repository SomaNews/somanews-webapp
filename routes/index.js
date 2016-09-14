var express = require('express');
var router = express.Router();

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

module.exports = router;