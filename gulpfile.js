// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var nodemon = require('gulp-nodemon');

// Lint Task
gulp.task('lint', function () {
    return gulp.src(['app.js', 'routes/**/*.js', 'models/**/*.js', 'config/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Compile Our Sass
gulp.task('sass', function () {
    return gulp.src('public/stylesheets/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('public/stylesheets/'));
});

// Watch Files For Changes
gulp.task('watch', function () {
    return gulp.watch('public/**/*.scss', ['sass']);
});

// Nodemon
gulp.task('nodemon', function (cb) {
    var started = false;
    return nodemon({
        script: 'bin/www'
    }).on('start', function () {
        // to avoid nodemon being started multiple times
        if (!started) {
            cb();
            started = true;
        }
    });
});

// Default Task
gulp.task('default', ['lint', 'sass', 'watch', 'nodemon']);