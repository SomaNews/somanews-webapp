/**
 * Created by Junyoung on 2016-09-14.
 */

var express = require('express');
var router = express.Router();

/* GET feed listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

module.exports = router;