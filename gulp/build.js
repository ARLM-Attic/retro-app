
const gulp = require('gulp');

const sass = require('gulp-sass');
const jade = require('gulp-jade');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const eslint = require('gulp-eslint');
const rename = require('gulp-rename');
const minifyCss = require('gulp-cssnano');
const preprocess = require('gulp-preprocess');
const ngAnnotate = require('gulp-ng-annotate');

const sh = require('shelljs');

const constants = require('./_constants');
const paths = constants.paths;
const lib = constants.lib;

gulp.task('eslint', () => {
    return gulp.src(paths.js)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('sass', (done) => {
    gulp.src('./src/scss/ionic.app.scss')
        .pipe(sass())
        .pipe(gulp.dest('./www/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest('./www/css/'))
        .on('end', done);
});

gulp.task('lib', () => {
    gulp.src(lib)
        .pipe(concat('lib.js'))
        .pipe(gulp.dest('./www/js'));
});

gulp.task('html', () => {
    gulp.src(paths.jade)
        .pipe(jade())
        .pipe(concat('index.html'))
        .pipe(gulp.dest('./www/'));
});

gulp.task('build:dev', ['eslint'], () => {
    return gulp.src(paths.jsB)
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(preprocess({ context: { ENV: 'DEV' }}))
        .pipe(ngAnnotate())
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./www/js'));
});

gulp.task('build:production:compile', () => {
    return gulp.src(paths.jsB)
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(preprocess({ context: { ENV: 'PROD' }}))
        .pipe(ngAnnotate())
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./www/js'));
});

gulp.task('build:production:apk', ['build:production:compile'], (done) => {
    sh.exec('sh publish.sh');
    done();
});