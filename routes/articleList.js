/**
 * Created by whyask37 on 2016. 11. 16..
 */

var express = require('express');
var router = express.Router();
var passport = require('passport');
var Log = require('../models/log');
var login = require('./login');
var utils = require('../utils/utils');
var async = require('async');
var Article = require('../models/article');

router.get('/articleList',
    login.checkAuth,
    (req, res) => {
        "use strict";

        var allArticles;
        var allClusters;

        async.waterfall([
            // Get articles
            (cb) => {
                async.parallel([
                    (cb) => Article.listArticles(req.colls, 0, 1000, cb),
                    (cb) => Article.listClusters(req.colls, 99999, cb),
                    (cb) => Log.getUserFavoriteClusters(req.colls, req.user._id, cb)
                ], (err, results) => {
                    if (err) return cb(err);
                    allArticles = results[0];
                    allClusters = {};
                    results[1].forEach((cluster) => {
                        allClusters[cluster.cluster] = cluster;
                    });
                    cb(null, results[2]);
                });
            },

            // Get category percentage
            (clusters_, cb) => {
                var clusterRatios = {};
                var totalClusterSum = utils.sum(clusters_.map((cluster) => cluster.count));
                clusters_.forEach((cluster) => {
                    clusterRatios[cluster._id] = cluster.count / totalClusterSum;
                });

                var totalCategoryRatios = utils.normalizeAttributeCounts(utils.countAttributes(allArticles, 'cate'));
                var totalClusterRatios = utils.normalizeAttributeCounts(utils.countAttributes(allArticles, 'cluster'));


                function getClusterScore(clusterID) {
                    var logClusterRatio = (clusterRatios[clusterID] || 0);
                    var totalClusterRatio = (totalClusterRatios[clusterID] || 0);
                    return (1 + 4 * logClusterRatio) / (1 + 1.5 * totalClusterRatio);
                }

                allArticles.forEach((article) => {
                    if(article.title.length > 20) {
                        article.shortTitle = article.title.substring(0, 20) + '...';
                    }
                    else {
                        article.shortTitle = article.title;
                    }

                    article.categoryPercentage = (totalCategoryRatios[article.cate] * 100).toFixed(1);
                    article.clusterPercentage = (totalClusterRatios[article.cluster] * 100).toFixed(1);
                    article.logClusterRatio = (clusterRatios[article.cluster] || 0).toFixed(2);
                    article.totalClusterRatio = (totalClusterRatios[article.cluster] || 0).toFixed(2);
                    article.lcr = (clusterRatios[article.cluster] || 0);
                    article.tcr = (totalClusterRatios[article.cluster] || 0);
                    article.rank = (allClusters[article.cluster] || {}).rank || 0;
                    article.clusterScore = getClusterScore(article.cluster);
                });
                allArticles.sort((a, b) => -(a.clusterScore - b.clusterScore));

                res.render('admin/articleList', {
                    articles: allArticles
                });
                cb(null);
            }
        ]);
    }
);

module.exports = router;

