var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var Article = mongoose.model('Article');

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
    function (req, res, next) {
        'use strict';

        Article.findById(req.params.id, function (err, ret) {
            if (err) throw err;

            Article.find({
                cluster: ret.cluster
            },
            function (err, results) {
                if (err) throw err;

                var related = results.filter((result) => result._id != req.params.id).map((result) => {
                    result.content = result.content.replace(/\n/g, "<br>").substr(0, 20);
                    return result
                });

                var article = {
                    title: ret.title,
                    author: ret.author,
                    imageURL: ret.imageURL,
                    publishedAt: ret.publishedAt,
                    content: ret.content.replace(/\n/g, "<br>"),
                    related: related
                };

                // Render article to html
                res.render('article', {article: article});
                // res.send(article)
            });
        });
    }
);

module.exports = router;
