var express = require('express');
var router = express.Router();
var passport = require('passport');
var Article = require('../models/article');
var Log = require('../models/log');
var login = require('./login');
var utils = require('../utils/utils');
var async = require('async');

router.get('/', (req, res) => { res.redirect('/articles/feed');});

// 뉴스 리스트
router.get('/feed',
    login.checkAuth,

    function (req, res) {
        'use strict';

        // 각 클러스터마다 해당 클러스터에 포함된 뉴스들과 뉴스 갯수를 얻는다.
        Article.listNewestNewsPerCluster(function (err, clusters) {
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

// 각 뉴스마다
router.get('/:id',
    login.checkAuth,

    function (req, res) {
        'use strict';

        var articleID = req.params.id;
        var article, articleList;

        async.waterfall([
            (callback) => {
                Article.getArticle(articleID, callback);
            },
            (ret, callback) => {
                if (!ret) callback(new Error('Unknown news'));
                article = {
                    _id: articleID,
                    title: ret.title,
                    author: ret.author,
                    imageURL: ret.imageURL,
                    publishedAt: ret.publishedAt,
                    sourceURL: ret.link,
                    content: ret.content,
                    vector: ret.vector
                };
                Article.findRelatedArticles(article, callback);
            },
            (related, callback) => {
                articleList = {
                    title: 'Related',
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
                res.send(err);
            }});
    });


// 뉴스를 다보고 다음 뉴스로 넘어가거나, 종료할 떄, 뉴스를 다보았다는 로그 수집
router.post('/articleLeave',
    function (req, res) {
        'use strict';

        if (!req.body.viewToken) {
            console.log('Invalid request : ' + req.body);
            return res.status(500).send(new Error("Invalid parameters"));
        }

        Log.logArticleLeave(req.body.viewToken, function (err) {
            if (err) {
                console.log(err.messsage);
                return res.status(500).send(err);
            }
            return res.json({success: 1});
        });
    });


module.exports = router;
