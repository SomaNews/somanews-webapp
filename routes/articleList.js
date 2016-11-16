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
                var categoryCounts = utils.countAttributes(articles, 'cate');
                var clusterCounts = utils.countAttributes(articles, 'cluster');

                articles.forEach((article) => {
                    if(article.title.length > 25) {
                        article.title = article.title.substring(0, 25) + '...';
                    }
                    article.categoryPercentage = (categoryCounts[article.cate] / articles.length * 100).toFixed(2);
                    article.clusterPercentage = (clusterCounts[article.cluster] / articles.length * 100).toFixed(2);
                });
                res.render('admin/articleList', {
                    articles: articles
                });
                cb(null);
            }
        ]);
    }
);

module.exports = router;

