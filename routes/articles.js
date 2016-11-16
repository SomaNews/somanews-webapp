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
    res.redirect('/articles');
});

router.get('/modeB', (req, res) => {
    "use strict";
    req.session.clusterType = 'B';
    res.redirect('/articles');
});



// 뉴스 리스트
router.get('/feed',
    login.checkAuth,

    function (req, res) {
        'use strict';

        // 각 클러스터마다 해당 클러스터에 포함된 뉴스들과 뉴스 갯수를 얻는다.
        Article.listNewestNewsPerCluster(req.colls, 24, function (err, clusters) {
            if (err) {
                return res.send(err);
            }

            var articleList = {
                title: '관심있어하실만한 뉴스',
                articles: clusters.map((cluster) => cluster.leading)
            };
            res.render('feed', {articleList: articleList});
        });
    });


router.get('/list',
    login.checkAuth,
    (req, res) => {
        "use strict";
        async.waterfall([
            (cb) => {
                Article.listArticles(req.colls, 0, 100, cb);
            },
            (articles, cb) => {
                res.render('articleList', {
                    articles: articles
                });
                cb(null);
            }
        ]);
    }
);

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
                res.render('error', { error: err });
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
