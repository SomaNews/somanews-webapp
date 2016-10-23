var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Article = mongoose.model('Article');
var dateUtils = require('../utils/dateUtils');
var login = require('./login');

/* GET users listing. */
router.get('/', function (req, res) {
    'use strict';
    res.send('respond with a resource');
});

/* GET feed page. */
router.get('/:id/feed', function (req, res) {
    'use strict';
    res.render('feed');
});



module.exports = router;
