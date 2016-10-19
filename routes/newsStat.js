var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Article = mongoose.model('Article');

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// 뉴스 리스트
router.get('/:year/:mon/:date', function (req, res, next) {
    var queryDate = new Date();
    queryDate.setHours(0,0,0,0);
    queryDate.setFullYear(parseInt(req.params.year));
    queryDate.setMonth(parseInt(req.params.mon) - 1);  // 0=january
    queryDate.setDate(parseInt(req.params.date));

    var minimumDate = queryDate;
    var maximumDate = addDays(queryDate, 1);
    Article.count({
        publishedAt: {
            $gte: minimumDate,
            $lt: maximumDate
        }
    }, function(err, count) {
        console.log('count : ' + count);
        res.render('newsStat', {
            'date': queryDate,
            'count': count
        });
    });
});

// by graph
router.get('/', function (req, res, next) {
    var minimumDate = addDays(new Date(), -50);
    Article.aggregate([
        { $match: { publishedAt: { $gte: minimumDate} } },
        { $project: { ymd: { $dateToString: { format: "%Y-%m-%d", date: "$publishedAt" } } } },
        { $group: { _id: "$ymd", count: {$sum: 1} } },
        { $sort : { "_id": 1 } },
    ],
    function (err, result) {
        if (err) {
            res.send(err);
            return;
        }
        console.log(result);
        res.render('newsGraph', {'countList': result});
    });
});


module.exports = router;
