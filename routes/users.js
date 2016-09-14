var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

/* GET feed page. */
router.get('/:id/feed', function (req, res, next) {
    res.render('feed');
});

module.exports = router;
