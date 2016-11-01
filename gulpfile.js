// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync');

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
        .pipe(gulp.dest('public/stylesheets/'))
        .pipe(browserSync.stream());
});

gulp.task('reload', function () {
    browserSync.reload();
});


// Watch Files For Changes
gulp.task('watch', function () {
    gulp.watch('public/**/*.scss', ['sass']);
    gulp.watch('views/**/*.jade', ['reload']);
});


var BROWSER_SYNC_RELOAD_DELAY = 2000;

// Nodemon
gulp.task('nodemon', function (cb) {
    // Serve files from the root of this project

    browserSync.init({
        proxy: "http://localhost:3000",
        files: ["views/**/*.*, public/**/*.*"],
        port: 7000,
        notify: false,
    });

    var started = false;
    return nodemon({
        script: 'bin/www'
    }).on('start', function () {
        // to avoid nodemon being started multiple times
        if (!started) {
            cb();
            started = true;
        }
    }).on('restart', function onRestart() {
            // reload connected browsers after a slight delay
            setTimeout(function reload() {
                browserSync.reload({
                    stream: false,
                });
            }, BROWSER_SYNC_RELOAD_DELAY);
        });
});

// Default Task
gulp.task('default', ['lint', 'sass', 'watch', 'nodemon']);