less = require('gulp-sass');
concat = require 'gulp-concat'

gulp.task 'sass', (done) ->
  gulp.src 'src-public/styles/*.sass'
  .pipe less()
  .pipe concat 'app.css'
  .pipe gulp.dest 'public/css'
  .on 'end', done
  return
