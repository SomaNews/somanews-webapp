var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var articles = require('../models/article');

function addDays(date, days) {
    'use strict';

    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// by graph
router.get('/', function (req, res) {
    'use strict';
    var minimumDate = addDays(new Date(), -100);
    req.colls.articleDB.aggregate([
        {$match: {publishedAt: {$gte: minimumDate}}},
        {$project: {ymd: {$dateToString: {format: "%Y-%m-%d", date: "$publishedAt"}}}},
        {$group: {'_id': "$ymd", count: {$sum: 1}}},
        {$sort: {"_id": 1}}
    ], function (err, result) {
        if (err) {
            return res.send(err);
        }
        console.log(result);
        res.render('newsGraph', {'countList': result});
    });
});


module.exports = router;
