/**
 * Created by whyask37 on 2016. 10. 20..
 */

var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var Log = require('../models/log');

exports = module.exports = function (router) {
    'use strict';

    // Login page
    router.post('/login', function (req, res, next) {
        passport.authenticate('local', function(err, user) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.json({error: '로그인에 실패했습니다. '});
            }
            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }
                return res.json({error: 0});
            });
        })(req, res, next);
    });

    router.get('/logout', function (req, res) {
        if (!req.user) {  // Not logged in -> FAiled
            return res.send(new Error('Not logon'));
        }
        req.logout();
        return res.redirect('/articles/feed');
    });


    // Join page
    router.get('/join', function (req, res) {
        res.render('admin/join');
    });

    router.post('/join', function (req, res) {
        var email = req.body.email,
            password = req.body.password;

        if (!email || !password) {
            res.status(500).send({error: 'Invalid parameter!' + email + password});
        }

        User.createUser(email, password, function (err, accepted) {
            if (accepted) {
                res.redirect('/articles');
            } else {
                res.redirect('/join');
            }
        });
    });
};


exports.checkAuth = function (req, res, next) {
    'use strict';
    if (req.user) {
        return Log.getUserReadArticles(req.colls, req.user._id, (err, readArticles) => {
            if (err) return next(err);
            req.colls.readArticles = readArticles;
            return next();
        });
    }

    // Render login page instead
    return res.render('site/login');
};