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

        var categoryFrequencyData;
        async.waterfall([
            function (callback) {
                Log.getUserLog(req.colls, req.user._id, 0, 100, callback);
            },
            function (logs, callback) {
                logs.forEach((e) => { e.cate = e.article.cate; });
                categoryFrequencyData = utils.makePieGraphData(logs, 'cate');

                res.render('profile', {
                    logs: logs,
                    logdataGraph: categoryFrequencyData
                });
                callback(null);
            }
        ], (err) => {
            if (err) {
                res.render('error', {error: err});
            }
        });
    });

module.exports = router;
