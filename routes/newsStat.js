var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');

function addDays(date, days) {
    'use strict';

    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// by graph
router.get('/', function (req, res) {
    'use strict';
    var minimumDate = addDays(new Date(), -49);
    minimumDate.setHours(0);
    minimumDate.setMinutes(0);
    req.colls.db.collection('crawledArticles', (err, col) => {
        if (err) {
            return res.send(err);
        }
        console.log('got collection');
        col.aggregate([
            {$match: {publishedAt: {$gte: minimumDate}}},
            {$project: {ymd: {$dateToString: {format: "%Y-%m-%d", date: "$publishedAt"}}}},
            {$group: {'_id': "$ymd", count: {$sum: 1}}},
            {$sort: {"_id": 1}}
        ], function (err, result) {
            if (err) {
                return res.send(err);
            }
            console.log(result);
            var labels = result.map(e => e._id);
            var counts = result.map(e => e.count);
            res.render('admin/newsGraph', {
                labels: labels,
                counts: counts
            });
        });
    });
});


module.exports = router;

