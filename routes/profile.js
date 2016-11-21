var express = require('express');
var router = express.Router();

var Article = require('../models/article');
var Log = require('../models/log');
var login = require('./login');
var utils = require('../utils/utils');
var async = require('async');

// Profile page
router.get('/profile',
    login.checkAuth, (req, res) => {
        "use strict";

        async.waterfall([
            // Get required data
            function (callback) {
                async.parallel([
                    cb => Log.getUserLog(req.colls, req.user._id, 0, 100, cb),
                    cb => Article.listClusters(req.colls, 99999, cb)
                ], (err, results) => {
                    if (err) return callback(err);
                    return callback(null, results[0], results[1]);
                });
            },
            function (logs, clusters, callback) {
                var clusterDict = {};
                clusters.forEach(cluster => {
                    clusterDict[cluster.cluster] = cluster;
                });

                logs = logs.filter(l => l.article.cluster != -1);
                logs.forEach((e) => {
                    e.cate = e.article.cate;
                    e.cluster = '(' + e.article.cluster + ') ' +
                        utils.shortenString(clusterDict[e.article.cluster].leading.title, 20);
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
