var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');

module.exports = router;
return;

function addDays(date, days) {
    'use strict';

    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// 뉴스 리스트
router.get('/:year/:mon/:date', function (req, res) {
    'use strict';

    var queryDate = new Date();
    queryDate.setHours(0, 0, 0, 0);
    queryDate.setFullYear(parseInt(req.params.year, 10));
    queryDate.setMonth(parseInt(req.params.mon, 10) - 1);  // 0=january
    queryDate.setDate(parseInt(req.params.date, 10));

    var minimumDate = queryDate,
        maximumDate = addDays(queryDate, 1);
    Article.count({
        publishedAt: {
            $gte: minimumDate,
            $lt: maximumDate
        }
    }, function (err, count) {
        console.log('count : ' + count);
        res.render('newsStat', {
            'date': queryDate,
            'count': count
        });
    });
});

// by graph
router.get('/', function (req, res) {
    'use strict';
    var minimumDate = addDays(new Date(), -100);
    Article.aggregate([
        { $match: { publishedAt: { $gte: minimumDate} } },
        { $project: { ymd: { $dateToString: { format: "%Y-%m-%d", date: "$publishedAt" } } } },
        { $group: { '_id': "$ymd", count: {$sum: 1} } },
        { $sort : { "_id": 1 } }
    ], function (err, result) {
        if (err) {
            return res.send(err);
        }
        console.log(result);
        res.render('newsGraph', {'countList': result});
    });
});


module.exports = router;
