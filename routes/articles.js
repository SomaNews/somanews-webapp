var express = require('express');
var router = express.Router();
var passport = require('passport');
var Article = require('../models/article');
var Log = require('../models/log');
var login = require('./login');
var utils = require('../utils/utils');

function encodeArticleId(id) {
    "use strict";
    return id.replace(/\//g, '$');
}

function decodeArticleId(id) {
    "use strict";
    return id.replace(/\$/g, '/');
}

// 뉴스 리스트
router.get('/',
    login.checkAuth,
    function (req, res) {
        'use strict';
        // 각 클러스터마다 해당 클러스터에 포함된 뉴스들과 뉴스 갯수를 얻는다.
        Article.listNewestNewsPerCluster(function (err, articles) {
            if (err) {
                return res.send(err);
            }
            res.render('feed', {articles: articles, encodeArticleId: encodeArticleId});
        });
    });



// 각 뉴스마다
router.get('/:id',
    login.checkAuth,
    function (req, res) {
        'use strict';

        var articleID = decodeArticleId(req.params.id);

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
                    res.render('article', {article: article, viewToken: viewToken});
                });
            });
        });
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
