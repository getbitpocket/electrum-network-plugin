var gulp        = require('gulp'),
    source      = require('vinyl-source-stream'),
    buffer      = require('vinyl-buffer'),
    browserify  = require('browserify'),
    tsify       = require('tsify'),
    KarmaServer = require('karma').Server;


gulp.task('build', function(done) {
    var b = browserify('./lib/index.ts', { standalone: 'electrum' }).plugin(tsify);

    return b.bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(gulp.dest('./build/'));
});


gulp.task('test', ['build'], function(done) {
  var server = new KarmaServer({
    configFile: __dirname + '/karma.conf.js'
  });
  
  server.on('run_complete', function (browsers, results){
    if (results.failed) {
      throw new Error('Karma: Tests Failed');
    }
        
    done();
  });
  
  server.start();  
});

