var express = require('express');
var router = express.Router();
var passport = require('passport');
var Article = require('../models/article');
var Cluster = require('../models/cluster');
var Log = require('../models/log');
var login = require('./login');
var utils = require('../utils/utils');

// 뉴스 리스트
router.get('/',
    login.checkAuth,

    function (req, res) {
        'use strict';

        // 각 클러스터마다 해당 클러스터에 포함된 뉴스들과 뉴스 갯수를 얻는다.
        if (req.originalUrl=='/articles2') {
            Cluster.listNewestNewsPerCluster(function (err, clusters) {
                if (err) {
                    return res.send(err);
                }
                res.render('feed', {clusters: clusters, isCluster: true});
            });
        } else {
            Article.listNewestNewsPerCluster(function (err, articles) {
                if (err) {
                    return res.send(err);
                }
                res.render('feed', {articles: articles, isCluster: false});
            });
        }
    });

// 각 뉴스마다
router.get('/:id',
    login.checkAuth,
    function (req, res) {
        'use strict';

        var articleID = req.params.id;

        if (req.originalUrl.startsWith('/articles2')) {
            Cluster.findCluster(req.query.cluster ,function (err, cluster) {
                if (err) {
                    res.send(err);
                }

                var rawArticle = cluster.articles.filter((a) => a._id == articleID)[0]

                var article = {
                    id: articleID,
                    title: rawArticle.title,
                    author: rawArticle.author,
                    imageURL: rawArticle.imageURL,
                    publishedAt: rawArticle.publishedAt,
                    cluster: rawArticle.cluster,
                    content: utils.htmlEscapeMultilineText(rawArticle.content)
                };

                article.related = cluster.articles.map(function (result) {
                    result.content = utils.htmlEscapeMultilineText(result.content);
                    return result;
                });

                Log.logArticleEnter(req.user._id, articleID, function (err, viewToken) {
                    if (err) {
                        return res.send(err);
                    }

                    // Render article to html
                    res.render('article', {article: article, viewToken: viewToken, isCluster: true});
                });

            });
        } else {
            Article.getArticle(articleID, function (err, ret) {
                if (err) {
                    return res.send(err);
                }

                if (!ret) {
                    return res.send(new Error('Unknown news'));
                }

                var article = {
                    id: articleID,
                    title: ret.title,
                    author: ret.author,
                    imageURL: ret.imageURL,
                    publishedAt: ret.publishedAt,
                    content: utils.htmlEscapeMultilineText(ret.content)
                };

                // 클러스터가 같은 Article들을 related로 해준다
                Article.findRelatedArticles(ret, function (err, results) {
                    if (err) {
                        return res.send(err);
                    }

                    article.related = results.map(function (result) {
                        result.content = utils.htmlEscapeMultilineText(result.content);
                        return result;
                    });

                    Log.logArticleEnter(req.user._id, articleID, function (err, viewToken) {
                        if (err) {
                            return res.send(err);
                        }

                        // Render article to html
                        res.render('article', {article: article, viewToken: viewToken, isCluster: false});
                    });
                });
            });
        }
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
