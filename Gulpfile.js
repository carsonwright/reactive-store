var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');

gulp.task('script', function() {
  return gulp.src(['./src/observable/*.js', './src/*.js'])
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
gulp.task('build', ['uglify'])
gulp.task('test', function() {
  console.log("testing")
});

gulp.task("default", ["build", "test"])