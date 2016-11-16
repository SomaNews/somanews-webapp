/*jslint node: true */

'use strict';

var express = require('express');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var passport = require('passport');
var join = require('path').join;
var models = join(__dirname, 'models');

fs.readdirSync(models)
    .filter(file => ~file.search(/^[^\.].*\.js$/))
    .forEach(file => require(join(models, file)));

var routes = require('./routes/index');
var users = require('./routes/profile');
var articleModel = require('./models/article');
var articles = require('./routes/articles');
var newsStat = require('./routes/newsStat');
var login = require('./routes/login');

var app = express();

// view engine setup
var utils = require('./utils/utils');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.locals.sprintf = require('sprintf-js').sprintf;
app.locals.formatDate = utils.formatDate;
app.locals.htmlEscapeMultilineText = utils.htmlEscapeMultilineText;

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));

app.use(session({ store: new RedisStore({
    host: '127.0.0.1',
    port: 6379
}), secret: 'asjkdfhsdjkghiuerhv' }));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, '/bower_components')));

// Add req to jade local variable
app.use(function (req, res, next) {
    res.locals.request = req;
    next();
});

// ClusterType 세션 세팅

app.use((req, res, next) => {
    // Set cluster type
    if(req.session.clusterType === undefined) {
        req.session.clusterType = 'A';
    }

    articleModel.selectCollection(req.session.clusterType, (err, colls) => {
        if(err) {
            return next(err);
        }
        req.colls = colls;
        next();
    });
});


app.use('/', routes);
app.use('/', users);
app.use('/articles', articles);
app.use('/newsStat', newsStat);

// catch 404 and forward to error handler
app.use(function (req, res) {
    var err = new Error('Not Found');
    err.status = 404;
    res.render('site/error', {error: err});
});

module.exports = app;
