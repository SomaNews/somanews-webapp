var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Article = mongoose.model('Article');
var Log = require('../models/log');
var login = require('./login');
var utils = require('../utils/utils');

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

router.get('/profile', (req, res) => {
    "use strict";

    Log.getUserLog(req.user._id, 0, 10, function (err, logs) {
        if (err) {
            return res.send(err);
        }

        logs = logs.map(function (entry) {
            return {
                startedAt: utils.formatDate(entry.startedAt),
                article: {
                    title: entry.article.title,
                    url: '/articles/' + utils.encodeArticleId(entry.article._id)
                }
            }
        });
        res.render('loglist', {logs: logs});
    });
});

module.exports = router;
