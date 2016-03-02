
const gulp = require('gulp');
const sh = require('shelljs');

const constants = require('./_constants');
const paths = constants.paths;

gulp.task('watch', () => {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.jade, ['html']);
    gulp.watch(paths.js, ['build:dev']);
});

gulp.task('ionic:start', (done) => {
    sh.exec('ionic serve -c -l -r --address=retro', { async: true });
    done();
});