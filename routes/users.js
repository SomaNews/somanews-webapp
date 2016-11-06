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

router.get('/profile',
    login.checkAuth, (req, res) => {
    "use strict";

    Log.getUserLog(req.user._id, 0, 10, function (err, logs) {
        if (err) {
            return res.send(err);
        }

        // Get required categories
        logs = logs.map(function (entry) {
            return {
                cate: entry.article.cate,
                startedAt: utils.formatDate(entry.startedAt),
                article: {
                    title: entry.article.title,
                    url: '/articles/' + encodeURIComponent(entry.article._id)
                }
            };
        });

        // Make graph
        var categoryCounts = {};
        logs.forEach(function (entry) {
            var category = entry.cate;
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        var categoryFrequencyData = utils.makeFrequencyGraphData(categoryCounts);

        res.render('loglist', {
            logs: logs,
            logdataGraph: categoryFrequencyData
        });
    });
});

module.exports = router;
