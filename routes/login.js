/**
 * Created by whyask37 on 2016. 10. 20..
 */

var express = require('express');
var passport = require('passport');
var User = require('../models/user');

module.exports = function (router) {
    'use strict';

    // Login page
    router.get('/login', function (req, res) {
        res.render('login');
    });

    router.post('/login', passport.authenticate('local', {
        successRedirect: '/articles',
        failureRedirect: '/login'
    }));


    // Join page
    router.get('/join', function (req, res) {
        res.render('join');
    });

    router.post('/join', function (req, res) {
        var email = req.body.email,
            password = req.body.password;

        if (!email || !password) {
            res.status(500).send({error: 'Invalid parameter!' + email + password});
        }

        User.createUser(email, password, function (err, accepted) {
            if (accepted) {
                res.redirect('/login');
            } else {
                res.redirect('/join');
            }
        });
    });
};


module.exports.checkAuth = function (req, res, next) {
    'use strict';
    if (req.user) {
        return next();
    }
    return res.redirect('/login');
};