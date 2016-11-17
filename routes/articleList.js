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

        var articles;

        async.waterfall([
            // Get articles
            (cb) => {
                Article.listArticles(req.colls, 0, 100, cb);
            },

            // Get clustern ntc
            (articles_, cb) => {
                articles = articles_;
                Log.getUserFavoriteClusters(req.colls, req.user._id, cb);
            },


            // Get category percentage
            (clusters, cb) => {
                var clusterRatios = {};
                var totalClusterSum = utils.sum(clusters.map((cluster) => cluster.count));
                clusters.forEach((cluster) => {
                    clusterRatios[cluster._id] = cluster.count / totalClusterSum;
                });

                var totalCategoryRatios = utils.normalizeAttributeCounts(utils.countAttributes(articles, 'cate'));
                var totalClusterRatios = utils.normalizeAttributeCounts(utils.countAttributes(articles, 'cluster'));


                function getClusterScore(clusterID) {
                    var logClusterRatio = (clusterRatios[clusterID] || 0);
                    var totalClusterRatio = (totalClusterRatios[clusterID] || 0);
                    return (1 + 4 * logClusterRatio) / (1 + 1.5 * totalClusterRatio);
                }

                articles.forEach((article) => {
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
                    article.clusterScore = getClusterScore(article.cluster);
                });
                articles.sort((a, b) => -(a.clusterScore - b.clusterScore));

                res.render('admin/articleList', {
                    articles: articles
                });
                cb(null);
            }
        ]);
    }
);

module.exports = router;

