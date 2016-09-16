var mongoose = require('mongoose');
var Article = mongoose.model('Article');
var dateUtils = require('../utils/dateUtils');

/*
    크롤러 실행

    return Promise
 */
module.exports.crawl = function(){
    var targets = JSON.parse(haniRssStr);
    var articles = [];

    for (var i = 0; i < targets.length; i++) {
         var target = targets[i];
         var results = crawlExcuter(target.rss);
         results.forEach(function(result){
             var article = {
                 title: result.title,
                 author: result.author,
                 link: result.link,
                 provider: target.provider,
                 category: target.category,
                 description: result.description,
                 publishedAt: result.publishedAt
             };
             articles.push(new Article(article));
         });
    }
    return Article.insertMany(articles);
};

function crawlExcuter(rss){
    // TODO : 크롤러 결과값 받아오기
    return [{
        title: "Hello",
        author: "정의길",
        link: rss,
        description: "test description",
        publishedAt: new Date()
    }];
};

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
