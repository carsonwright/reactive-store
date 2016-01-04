var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var qunit = require('gulp-qunit');

gulp.task('script', function() {
  return gulp.src(['./node_modules/blueimp-md5/js/md5.js','./src/observable/*.js', './src/*.js'])
    .pipe(concat('reactive_store.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('uglify', ['script'], function(){
  return gulp.src('./dist/reactive_store.js')
  .pipe(uglify())
  .pipe(rename({
      extname: '.min.js'
  }))
  .pipe(gulp.dest('dist'));
})
 
gulp.task('test', ["build"], function() {
    return gulp.src('./tests/test-runner.html')
        .pipe(qunit());
});

gulp.task('build', ['uglify'])

gulp.task("default", ["test"])