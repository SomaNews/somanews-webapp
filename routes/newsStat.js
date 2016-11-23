var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var utils = require('../utils/utils');

function addDays(date, days) {
    'use strict';

    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// by graph
router.get('/', function (req, res) {
    'use strict';
    // 49
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
            {$project: {
                ymd: {$dateToString: {format: "%Y-%m-%d", date: "$publishedAt"}},
                provider: '$provider'
            }},
            {$group: {
                '_id': {
                    ymd: "$ymd",
                    provider: "$provider"
                },
                count: {$sum: 1}
            }},
            {$sort: {"_id": 1}}
        ], function (err, result) {
            if (err) {
                return res.send(err);
            }

            function onlyUnique(value, index, self) {
                return self.indexOf(value) === index;
            }

            var labels = result.map(e => e._id.ymd).filter(onlyUnique);
            var labelCounts = [];

            var allCountData = new Array(labels.length).fill(0);
            labels.forEach(ymd => {
                allCountData[labels.indexOf(ymd)] = utils.sum(result.filter(e => e._id.ymd == ymd).map(e => e.count));
            });
            labelCounts[0] = allCountData;

            ['chosun', 'donga', 'khan', 'hani'].forEach(provider => {
                var countData = new Array(labels.length).fill(0);
                result.filter(e => e._id.provider == provider).forEach(e => {
                    countData[labels.indexOf(e._id.ymd)] = e.count;
                });
                labelCounts[labelCounts.length] = countData;
            });
            res.render('admin/newsGraph', {
                labels: labels,
                counts: labelCounts
            });
        });
    });
});


module.exports = router;

