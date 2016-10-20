var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var passport = require('passport');

var UserSchema = new mongoose.Schema({
    email: {type: String, unique: true, required: true},
    passwordHash: {type: String, required: true}
});

var User = mongoose.model('User', UserSchema);


// Login using passport-local
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    function (email, password, done) {
        'use strict';

        User.findOne({email: email}, function (err, user) {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false, {message: 'Incorrect email.'});
            }

            // Check password
            bcrypt.compare(password, user.passwordHash, function (err, yes) {
                if (err) {
                    return done(err);
                }

                if (yes) {
                    console.log('login as ' + email + ' succeeded');
                    return done(null, user);
                }
                console.log('login as ' + email + ' failed');
                return done(null, false, {message: 'Incorrect password.'});
            });
        });
    }
));

passport.serializeUser(function (user, done) {
    'use strict';
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    'use strict';
    done(null, user);
});

/**
 * Check if email is valid
 * @param email Input
 */
function validateEmail(email) {
    'use strict';

    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

/**
 * Callback for adding two numbers.
 *
 * @callback hasUserCallback
 * @param err - Error
 * @param yes - Has user?
 */

/**
 * @param email - Email
 * @param {hasUserCallback} callback - Callback
 */
function hasUserWithEmail(email, callback) {
    'use strict';
    User.findOne({email: email}, function (err, user) {
        if (err || user === null) {
            return callback(err, false);
        }
        return callback(err, true);
    });
}

exports.hasUserWithEmail = hasUserWithEmail;


/**
 * Add user to database.
 * @param email - Email for user
 * @param password - Plaintext password for user
 * @param callback(err, isUserAdded) - Callback
 */
function createUser(email, password, callback) {
    'use strict';

    var saltRounds = 10;

    if (!validateEmail(email)) {
        return callback(new Error('Invalid email'));
    }

    hasUserWithEmail(email, function (err, yes) {
        if (err) {
            return callback(err, false);
        }
        if (yes) {
            return callback(new Error('User with specified email already exists!'), false);
        }
        // Hash password & append to db
        bcrypt.hash(password, saltRounds, function (err, hash) {
            if (err) {
                return callback(err, false);
            }

            console.log('Creating new user');
            console.log(' - email : ' + email);
            console.log(' - password : ' + password);
            console.log(' - hash : ' + hash);

            var user = new User({email: email, passwordHash: hash});
            user.save(function (err) {
                if (err) {
                    console.log(err.message);
                    return callback(err, false);
                }
                return callback(null, true);
            });
        });
    });
}

exports.createUser = createUser;
