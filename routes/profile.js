var express = require('express');
var router = express.Router();
var vectorious = require('vectorious'),
    Vector = vectorious.Vector;

var Article = require('../models/article');
var Log = require('../models/log');
var login = require('./login');
var utils = require('../utils/utils');

// Profile page
router.get('/profile',
    login.checkAuth, (req, res) => {
    "use strict";

    // List recent 100 user view logs
    Log.getUserLog(req.user._id, 0, 100, function (err, logs) {
        if (err) {
            return res.send(err);
        }

        // Get 'cleaned' categories.
        logs = logs.map(function (entry) {
            return {
                cate: entry.article.cate,
                startedAt: utils.formatDate(entry.startedAt),
                article: {
                    title: entry.article.title,
                    url: '/articles/' + encodeURIComponent(entry.article._id),
                    vector: new Vector(entry.article.vector)
                }
            };
        });

        // Make graph of categories
        var categoryFrequencyData = utils.makePieGraphData(logs, 'cate');

        // Get closest vector
        var vsum = logs
            .map((a) => a.article.vector)
            .reduce((a, b) => {
                if (!b) return a;
                if (!a) return b;
                return a.add(b);
            });

        var userLikes = null;
        if (vsum) {
            Article.findRelatedArticles(vsum, (err, data) => {
                if(!err) userLikes = data;
                render();
            });
        }
        else {
            render();
        }

        function render() {
            res.render('profile', {
                logs: logs,
                userLikes: userLikes,
                logdataGraph: categoryFrequencyData
            });
        }
    });
});

module.exports = router;
