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

module.exports = router;
