var bower = require('bower');

var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var jshint = require('gulp-jshint');
var babel = require('gulp-babel');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var jade = require('gulp-jade');

var sh = require('shelljs');

var paths = {
    sass: ['./src/scss/**/*.scss'],
    jade: ['./src/jade/**/*.jade'],
    js:   ['./src/js/**/*.js']
};

var lib = [
    './www/lib/ionic/js/ionic.bundle.js',
    './www/lib/ngCordova/dist/ng-cordova.js'
];

gulp.task('default', ['sass', 'lib', 'html', 'build', 'watch']);

gulp.task('sass', function(done) {
    gulp.src('./scss/ionic.app.scss')
        .pipe(sass())
        .pipe(gulp.dest('./www/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest('./www/css/'))
        .on('end', done);
});

gulp.task('watch', function() {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.jade, ['html']);
    gulp.watch(paths.js, ['style', 'build']);
});

gulp.task('lib', function() {
    gulp.src(lib)
        .pipe(concat('lib.js'))
        .pipe(gulp.dest('./www/js'));
});

gulp.task('html', function() {
    gulp.src(paths.jade)
        .pipe(jade())
        .pipe(concat('index.html'))
        .pipe(gulp.dest('./www/'));
});

gulp.task('build', function() {
    gulp.src(paths.js)
        .pipe(babel())
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./www/js'));
});

gulp.task('style', function() {
    gulp.src(paths.js)
        .pipe(jshint({esnext: true}))
        .pipe(jshint.reporter('default'));
});

gulp.task('install', ['git-check'], function() {
    return bower.commands.install()
        .on('log', function(data) {
            gutil.log('bower', gutil.colors.cyan(data.id), data.message);
        });
});

gulp.task('git-check', function(done) {
    if (!sh.which('git')) {
        console.log(
            '  ' + gutil.colors.red('Git is not installed.'),
            '\n  Git, the version control system, is required to download Ionic.',
            '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
            '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
        );
        process.exit(1);
    }
    done();
});
