var gulp = require('gulp');
var gutil = require('gulp-util');
var webpack = require('webpack');
var jasmine = require('gulp-jasmine');

gulp.task('build', function(done) {
    webpack(require('./webpack.config.js'),function(err, stats) {
        
        if (err) {
            throw new gutil.PluginError('webpack',err);
        }
        
        gutil.log("Webpacked...");        
        done();        
    });
});

gulp.task('test', ['build'], function() {
    return gulp.src('spec/**/*.js')
        .pipe(jasmine()); 
});

