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
var mongoose = require('mongoose');
var passport = require('passport');
var join = require('path').join;
var models = join(__dirname, 'models');

fs.readdirSync(models)
    .filter(file => ~file.search(/^[^\.].*\.js$/))
    .forEach(file => require(join(models, file)));

var routes = require('./routes/index');
var users = require('./routes/profile');
var articles = require('./routes/articles');
var clusters = require('./routes/clusters');
var newsStat = require('./routes/newsStat');
var login = require('./routes/login');

var port = process.env.PORT || 3000;
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

app.use('/', routes);
app.use('/', users);
app.use('/articles', articles);
app.use('/clusters', clusters);
app.use('/newsStat', newsStat);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

connect()
.on('error', console.log)
.on('disconnected', connect)
.once('open', listen);

function listen () {
    console.log("Connected to mongod server");
    if (app.get('env') === 'test') return;
    console.log('Express app started on port ' + port);
}

function connect () {
    var options = { server: { socketOptions: { keepAlive: 1 } } };
    return mongoose.connect('mongodb://ssomanews:ssomanews1029@104.199.210.143:27017/somanews', options).connection;
}

module.exports = app;
