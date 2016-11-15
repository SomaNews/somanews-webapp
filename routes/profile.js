var express = require('express');
var router = express.Router();
var vectorious = require('vectorious'),
    Vector = vectorious.Vector;

var Article = require('../models/article');
var Log = require('../models/log');
var login = require('./login');
var utils = require('../utils/utils');
var async = require('async');

// Profile page
router.get('/profile',
    login.checkAuth, (req, res) => {
        "use strict";

        var categoryFrequencyData;
        var logs;
        async.waterfall([
            function (callback) {
                Log.getUserLog(req.colls, req.user._id, 0, 100, callback);
            },
            function (rawlogs, callback) {
                // Get 'cleaned' categories.
                logs = rawlogs.map(function (entry) {
                    return {
                        cate: entry.article.cate,
                        startedAt: entry.startedAt,
                        article: {
                            title: entry.article.title,
                            cate: entry.article.cate,
                            cluster: entry.article.cluster,
                            url: '/articles/' + encodeURIComponent(entry.article._id),
                            vector: new Vector(entry.article.vector)
                        }
                    };
                });

                categoryFrequencyData = utils.makePieGraphData(logs, 'cate');

                res.render('profile', {
                    logs: logs,
                    logdataGraph: categoryFrequencyData
                });
                callback(null);
            }
        ], (err) => {
            Log.getUserFavoriteClusters(req.colls, req.user._id, (err, ret) => {console.log(ret);});

            if (err) {
                res.render('error', {error: err});
            }
        });
    });

module.exports = router;
