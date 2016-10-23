var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var Article = mongoose.model('Article');
var Log = require('../models/log');
var login = require('./login');

// 뉴스 리스트
router.get('/',
    login.checkAuth,
    function (req, res, next) {
        'use strict';
        // 각 클러스터마다 해당 클러스터에 포함된 뉴스들과 뉴스 갯수를 얻는다.
        Article.aggregate([
            { $sort : { "publishedAt": -1 } },
            { $group : {
                '_id': "$cluster",
                count: {$sum: 1},
                clusters: {$push: "$$ROOT"}
            }},
            { $project : {
                count: 1,
                clusters: { $slice: ["$clusters", 0, 1] }
            } }
        ], function (err, articles) {
            if (err) {
                return res.send(err);
            }
            res.render('feed', {articles: articles});
        });
    }
);


// 각 뉴스마다
router.get('/:id',
    login.checkAuth,
    function (req, res) {
        'use strict';

        var articleID = req.params.id;
        Article.findOne({'_id': articleID}, function (err, ret) {
            if (err) {
                return res.send(err);
            }

            if (!ret) {
                return res.send(new Error('Unknown news'));
            }
            var article = {
                id: ret._id,
                title: ret.title,
                author: ret.author,
                imageURL: ret.imageURL,
                publishedAt: ret.publishedAt,
                content: ret.content.replace(/\n/g, "<br>")
            };

            Log.logArticleEnter(req.user._id, articleID, function (err, viewToken) {
                if (err) {
                    throw err;
                }

                // Render article to html
                res.render('article', {article: article, viewToken: viewToken});
            });
        });
    }
);


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
