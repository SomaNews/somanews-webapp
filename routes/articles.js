var express = require('express');
var router = express.Router();
var passport = require('passport');
var Log = require('../models/log');
var login = require('./login');
var utils = require('../utils/utils');
var async = require('async');
var Article = require('../models/article');

// Index to feed
router.get('/', (req, res) => { res.redirect('/articles/feed');});

router.get('/modeA', (req, res) => {
    "use strict";
    req.session.clusterType = 'A';
    res.json({success: 1});
});

router.get('/modeB', (req, res) => {
    "use strict";
    req.session.clusterType = 'B';
    res.json({success: 1});
});


/**
 * Calculate cluster ratio per log.
 * @param clusters
 * @param userLogs
 */
function calculateClusterLCR(clusters, userLogs) {
    "use strict";
    // Calculate lCR
    var logCounts = {};
    userLogs.forEach(log => {
        var cluster = log.article.cluster;
        logCounts[cluster] = (logCounts[cluster] || 0) + 1;
            // Math.min((log.endedAt.getTime() - log.startedAt.getTime()) / (1000 / 30) + 1, 5);
    });
    var logClusterRatioTable = utils.normalizeAttributeCounts(logCounts);

    clusters.forEach((cluster) => {
        cluster.lCR = logClusterRatioTable[cluster.cluster] || 0;
    });
}


/**
 * Calculate lCR2 for clusters
 * @param clusters - Clusters with lCR data
 */
function calculateClusterLCR2(clusters) {
    // Adjust lCR with adjacent clusters's lCR
    clusters.forEach((cluster) => {
        var lCR2 = cluster.lCR * (2.5 - 1);
        lCR2 += utils.sum(clusters.map(
            cluster2 => cluster2.lCR * utils.dictCosineSimilarity(cluster2.cate, cluster.cate)
        ));
        cluster.lCR2 = lCR2;
    });
}


/**
 * Calculate cluster scores
 * @param clusters
 * @param userLogs
 */
function calculateClusterScore(clusters, userLogs) {
    "use strict";
    calculateClusterLCR(clusters, userLogs);
    calculateClusterLCR2(clusters);

    let minRank = 99999, maxRank = -99999;

    // max~min -> 1~2 로 재배열
    clusters.forEach(cluster => {
        minRank = Math.min(cluster.rank, minRank);
        maxRank = Math.max(cluster.rank, maxRank);
    });
    clusters.forEach((cluster) => {
        cluster.score = ((maxRank - cluster.rank) / (maxRank - minRank) + 5) *
            (1 + 0.3 * Math.max(Math.sqrt(10 * userLogs.length) - 1.3, 0) * cluster.lCR2) *
            (0.4 * Math.random() + 0.8);
    });
}


// 뉴스 리스트
router.get('/feed',
    login.checkAuth,

    function (req, res) {
        'use strict';
        var clusters, userLogs;

        async.waterfall([
            // Get required data
            (cb) => {
                async.parallel([
                    (cb) => Article.listClusters(req.colls, 9999, cb),
                    (cb) => Log.getUserLog(req.colls, req.user._id, 0, 100, cb)
                    ], (err, results) => {
                        if(err) return cb(err);
                        cb(null, results[0], results[1]);
                    }
                );
            },

            // Calculate personalized scores
            (clusters_, logs_, cb) => {
                clusters = clusters_;
                var currentClusters = new Set(clusters.map((c) => c.cluster));
                userLogs = logs_.filter((log) => currentClusters.has(log.article.cluster)); // Filter only valid logs
                calculateClusterScore(clusters, userLogs);
                clusters.forEach(cluster => {
                    var title = cluster.leading.title;
                    cluster.leading.title = '[' + cluster.score.toFixed(2) + '] ' + title;
                });
                cb(null);
            },

            // Get non-personalized feeds
            (cb) => {
                // Get carousel clusters
                clusters.sort((a, b) => b.score - a.score);
                var carouselFeeds = clusters.slice(0, 3).map((cluster) => cluster.leading);

                // Get non-personalized feeds
                clusters.sort((a, b) => a.rank - b.rank);
                var nonPersonalizedFeeds = clusters.slice(0, 4).map(cluster => cluster.leading);
                clusters = clusters.slice(4);

                // Get personalized feeds
                clusters.sort((a, b) => b.score - a.score);
                var personalizedFeeds = clusters.slice(0, 8).map(cluster => cluster.leading);

                res.render('feed', {
                    carouselFeeds : carouselFeeds,
                    nonPersonalizedFeeds: nonPersonalizedFeeds,
                    personalizedFeeds: personalizedFeeds
                });
                cb(null);
            }
        ], (err) => {
            if (err) {
                res.render('error', {error: err});
            }
        });
    });

// 각 뉴스마다
router.get('/:id',
    login.checkAuth,

    function (req, res) {
        'use strict';

        var articleID = req.params.id;
        var article, articleList;

        async.waterfall([
            (callback) => {
                Article.getArticle(req.colls, articleID, callback);
            },
            (ret, callback) => {
                if (!ret) return callback(new Error('Unknown news ' + articleID));
                article = ret;
                Article.findRelatedArticles(req.colls, article, 15, callback);
            },
            (related, callback) => {
                articleList = {
                    title: '관련 기사들',
                    articles: related
                };
                Log.logArticleEnter(req.user._id, articleID, callback);
            },
            (viewToken, callback) => {
                res.render('article', {
                    article: article,
                    viewToken: viewToken,
                    articleList: articleList
                });
                callback(null);
            }
        ], (err) => {
            if (err) {
                res.render('site/error', { error: err });
            }});
    });



// 뉴스를 다보고 다음 뉴스로 넘어가거나, 종료할 떄, 뉴스를 다보았다는 로그 수집
router.post('/articlePing',
    function (req, res) {
        'use strict';

        if (!req.body.viewToken) {
            console.log('Invalid request : ' + req.body);
            return res.status(500).send(new Error("Invalid parameters"));
        }

        Log.logArticlePing(req.body.viewToken, function (err) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.json({success: 1});
        });
    });


module.exports = router;
