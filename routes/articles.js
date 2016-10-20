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

        Article.findOne({'_id': req.params.id}, function (err, ret) {
            if (err) {
                throw err;
            }

            var article = {
                title: ret.title,
                author: ret.author,
                imageURL: ret.imageURL,
                publishedAt: ret.publishedAt,
                content: ret.content.replace(/\n/g, "<br>")
            };

            // Render article to html
            res.render('article', {article: article});
        });
    }
);

module.exports = router;
