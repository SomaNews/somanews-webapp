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


// 뉴스 리스트
router.get('/feed',
    login.checkAuth,

    function (req, res) {
        'use strict';

        // 각 클러스터마다 해당 클러스터에 포함된 뉴스들과 뉴스 갯수를 얻는다.
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

            (clusters_, logs_, cb) => {
                clusters = clusters_;
                var currentClusters = new Set(clusters.map((c) => c.cluster));
                var logs = logs_.filter((log) => currentClusters.has(log.article.cluster)); // Filter only valid logs
                userLogs = logs;

                // Calculate logClusterRatio
                var logCounts = {};
                logs.forEach(log => {
                    var cluster = log.article.cluster;
                    var time = Math.min((log.endedAt.getTime() - log.startedAt.getTime()) / (1000 * 30) + 1, 5);
                    logCounts[cluster] = (logCounts[cluster] || 0) + time;
                });
                // var logCounts = utils.countAttributes(logs.map(l => l.article), 'cluster');
                var logClusterRatioTable = utils.normalizeAttributeCounts(logCounts);

                console.log('lCR Table', logClusterRatioTable);

                clusters.forEach((cluster) => {
                    cluster.lCR = logClusterRatioTable[cluster.cluster] || 0;
                });

                // Calculate category-adjusted logClusterRatio
                clusters.forEach((cluster) => {
                    var lCR2 = cluster.lCR * (2.5 - 1);
                    lCR2 += utils.sum(clusters.map(
                        cluster2 =>cluster2.lCR * utils.dictCosineSimilarity(cluster2.cate, cluster.cate)
                    ));
                    cluster.lCR2 = lCR2;
                });

                // Calculate score
                // row['score'] = rank * 0.1 * (1 + 0.3 * max(sqrt(logCount) - 1.3, 0) * lctScore)
                clusters.forEach((cluster) => {
                    cluster.score = cluster.rank *
                        (1 + 0.3 * Math.max(Math.sqrt(userLogs.length) - 1.3, 0) * cluster.lCR2) *
                        (0.4 * Math.random() + 0.8);  // Add some randomty
                });
                clusters.sort((a, b) => b.score - a.score);

                var articleList = {
                    title: '관심있어하실만한 뉴스',
                    articles: clusters.slice(0, 12).map((cluster) => {
                        var article = cluster.leading;
                        article.title = '[' + cluster.score.toFixed(2) + '] ' + article.title;
                        return article;
                    })
                };

                res.render('feed', {articleList: articleList});
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
