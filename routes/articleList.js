/**
 * Created by whyask37 on 2016. 11. 16..
 */

var express = require('express');
var router = express.Router();
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
        var allClustersMap;
        var allClusters;

        async.waterfall([
            // Get articles
            (cb) => {
                async.parallel([
                    (cb) => Article.listArticles(req.colls, 0, 1000, cb),
                    (cb) => Article.listClusters(req.colls, 99999, cb),
                    (cb) => Log.getUserLog(req.colls, req.user._id, 0, 10000, cb)
                ], (err, results) => {
                    if (err) return cb(err);
                    allArticles = results[0];
                    allArticles = allArticles.filter((a) => a.cluster != -1);
                    allClusters = results[1];
                    allClustersMap = {};
                    results[1].forEach((cluster) => {
                        allClustersMap[cluster.cluster] = cluster;
                    });

                    // Remove log with invalid clusters
                    cb(null, results[2]);
                });
            },

            // Get category percentage
            (userLog, cb) => {
                var clusterRatios = {};
                var articleViewed = {};
                userLog.forEach((log) => {
                    clusterRatios[log.article.cluster] = (clusterRatios[log.cluster] || 0) + 1;
                    articleViewed[log.article.article_id] = true;
                });

                var totalCategoryRatios = utils.normalizeAttributeCounts(utils.countAttributes(allArticles, 'cate'));
                var totalClusterRatios = utils.normalizeAttributeCounts(utils.countAttributes(allArticles, 'cluster'));

                function getClusterScore(clusterID) {
                    var logClusterRatio = (clusterRatios[clusterID] || 0);
                    var totalClusterRatio = (totalClusterRatios[clusterID] || 0);
                    return (1 + 4 * logClusterRatio) / (1 + 1.5 * totalClusterRatio);
                }

                var currentTime = new Date();

                allClusters.forEach((cluster) => {
                    var leading = cluster.leading;
                    if(leading.title.length > 20) {
                        leading.shortTitle = leading.title.substring(0, 20) + '...';
                    }
                    else {
                        leading.shortTitle = leading.title;
                    }
                });

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
                    article.rank = (allClustersMap[article.cluster] || {}).rank || 0;
                    article.viewed = !!articleViewed[article.article_id];
                    article.clusterScore = getClusterScore(article.cluster);
                    article.dateSince = (currentTime.getTime() - article.publishedAt.getTime()) / (1000 * 3600 * 24);
                });
                allArticles.sort((a, b) => -(a.clusterScore - b.clusterScore));

                res.render('admin/articleList', {
                    articles: allArticles,
                    clusters: allClusters
                });
                cb(null);
            }
        ], (err) => {
            if (err) {
                res.render('error', {error: err});
            }
        });
    }
);

module.exports = router;

