var mongoose = require('mongoose');
var Article = mongoose.model('Article');
var Crawler = mongoose.model('Crawler');
var dateUtils = require('../utils/dateUtils');
var defer = require('../utils/promiseUtils').defer;
var PythonShell = require('python-shell');

/*
    크롤링 할 대상 추가
*/
module.exports.init = function() {
    var providerNames = ["chosun"];

    var crawlers = providerNames.map(function(name){
        return new Crawler({
            name: name,
            last: new Date()
        });
    });

    return Crawler.insertMany(crawlers);
};

/*
     크롤러 실행

     return Promise
*/
module.exports.crawl = function(){
    var deferred = defer();

    Crawler.find(function(err, crawlers){
        if (err) throw err;
        var crawlerPromises = crawlers.map(function(crawler){
            return crawlExcuter(crawler);
        });

        Promise.all(crawlerPromises).then(function(results) {
            var articles = [];
            results.forEach(function(result){
                var article = {
                    title: result.title,
                    author: result.author,
                    link: result.link,
                    provider: result.provider,
                    category: result.category,
                    description: result.description,
                    publishedAt: result.publishedAt
                };
                articles.push(new Article(article));
            });

            Article.insertMany(articles).then(function(r){
                deferred.resolve(r);
            }).catch(function(err){
                deferred.reject(err);
            })

        });
    })

    return deferred.promise;
};

function crawlExcuter(crawler){
    var deferred = defer();

    PythonShell.run('crawler.py', {
        args: [crawler.name, crawler.last]
    }, function (err, results) {
        if (err) throw err;
        deferred.resolve(results);
    });

    return deferred.promise;
};

/*
function crawlHaniRss() {
    var body = document.getElementsByClassName("rss-service-tbl");
    var trs = body[0].getElementsByTagName("tr");
    var haniRss = []
    for(var i = 0; i < trs.length; i++) {
        var tr = trs[i];
        var category = tr.getElementsByTagName("th")[0].innerHTML;
        var rss = tr.getElementsByTagName("td")[0].getElementsByTagName("a")[0].href;
        haniRss.push({
            provider: "한겨레",
            category: category,
            rss: rss
        });
    }
    var haniRssStr = JSON.stringify(haniRss);
    return haniRssStr;
}

var haniRssStr = '[{"provider":"한겨레","category":"전체기사","rss":"http://www.hani.co.kr/rss/"},{"provider":"한겨레","category":"정치","rss":"http://www.hani.co.kr/rss/politics/"},{"provider":"한겨레","category":"경제","rss":"http://www.hani.co.kr/rss/economy/"},{"provider":"한겨레","category":"사회","rss":"http://www.hani.co.kr/rss/society/"},{"provider":"한겨레","category":"국제","rss":"http://www.hani.co.kr/rss/international/"},{"provider":"한겨레","category":"대중문화","rss":"http://www.hani.co.kr/rss/culture/"},{"provider":"한겨레","category":"스포츠","rss":"http://www.hani.co.kr/rss/sports/"},{"provider":"한겨레","category":"과학","rss":"http://www.hani.co.kr/rss/science/"},{"provider":"한겨레","category":"사설·칼럼","rss":"http://www.hani.co.kr/rss/opinion/"},{"provider":"한겨레","category":"만화만평","rss":"http://www.hani.co.kr/rss/cartoon/"},{"provider":"한겨레","category":"English Edition","rss":"http://www.hani.co.kr/rss/english_edition/"},{"provider":"한겨레","category":"한겨레섹션","rss":"http://www.hani.co.kr/rss/specialsection/"},{"provider":"한겨레","category":"함께하는 교육","rss":"http://www.hani.co.kr/rss/education/"},{"provider":"한겨레","category":"토요판","rss":"http://www.hani.co.kr/rss/saturday/"},{"provider":"한겨레","category":"하니온리","rss":"http://www.hani.co.kr/rss/hanionly/"},{"provider":"한겨레","category":"한겨레온리","rss":"http://www.hani.co.kr/rss/hkronly/"},{"provider":"한겨레","category":"멀티하니 (사진뉴스)","rss":"http://www.hani.co.kr/rss/multihani/"},{"provider":"한겨레","category":"주요기사","rss":"http://www.hani.co.kr/rss/lead/"},{"provider":"한겨레","category":"인기기사","rss":"http://www.hani.co.kr/rss/newsrank/"}]'
*/
