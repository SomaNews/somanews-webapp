var express = require('express');
var router = express.Router();

var Log = require('../models/log');
var login = require('./login');
var utils = require('../utils/utils');
var async = require('async');

// Profile page
router.get('/profile',
    login.checkAuth, (req, res) => {
        "use strict";

        async.waterfall([
            function (callback) {
                Log.getUserLog(req.colls, req.user._id, 0, 100, callback);
            },
            function (logs, callback) {
                logs = logs.filter(l => l.article.cluster != -1);
                logs.forEach((e) => {
                    e.cate = e.article.cate;
                    e.cluster = e.article.cluster;
                });

                var categoryFrequencyData = utils.makePieGraphData(logs, 'cate');
                var clusterFrequencyData = utils.makePieGraphData(logs, 'cluster');

                res.render('profile', {
                    logs: logs,
                    categoryFrequencyData: categoryFrequencyData,
                    clusterFrequencyData: clusterFrequencyData
                });
                callback(null);
            }
        ], (err) => {
            if (err) {
                res.render('site/error', {error: err});
            }
        });
    });

module.exports = router;
