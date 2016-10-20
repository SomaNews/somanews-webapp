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
                    return done(null, user);
                }
                return done(null, false, {message: 'Incorrect password.'});
            });
        });
    }
));


/**
 * Callback for adding two numbers.
 *
 * @callback hasUserCallback
 * @param {Error} err - Error
 * @param {boolean} yes - Has user?
 */

/**
 * @param  {str} email - Email
 * @param  {hasUserCallback} callback - Callback
 */
function hasUserWithEmail(email, callback) {
    'use strict';
    User.findOne({email: email}, function (err, user) {
        if (err || user === null) {
            callback(err, false);
        }
        callback(err, true);
    });
}

exports.hasUserWithEmail = hasUserWithEmail;


/**
 * Add user to database.
 * @param {str} email : Email for user
 * @param {str} password : Plaintext password for user
 * @param {Function} callback(err, isUserAdded) : Callback
 */
function createUser(email, password, callback) {
    'use strict';

    var saltRounds = 10;

    if (hasUserWithEmail(email)) {
        callback(new Error('User with specified email already exists!'), false);
    }

    // Hash password & append to db
    bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) {
            callback(err, false);
        }

        var user = new User({email: email, passwordHash: hash});
        user.save(function (err) {
            if (err) {
                callback(err, false);
            }
            return callback(null, true);
        });
    });
}

exports.createUser = createUser;
