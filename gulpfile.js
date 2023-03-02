const { src, dest, watch, series } = require('gulp');
const fileinclude = require('gulp-file-include');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const terser = require('gulp-terser');
const imagemin = require('gulp-imagemin');
const browsersync = require('browser-sync').create();

// HTML Include task
function htmlTask(){
  return src('app/**/*.html')
    .pipe(fileinclude())
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist'));
}

// Sass Task
function scssTask(){
  return src('app/scss/style.scss', { sourcemaps: true })
      .pipe(sass())
      .pipe($.autoprefixer('last 2 version'))
      .pipe(postcss([cssnano()]))
      .pipe(dest('dist/styles', { sourcemaps: '.' }));
}

// JavaScript Task
function jsTask(){
  return src('app/scripts/**/*.js', { sourcemaps: true })
    .pipe(terser())
    .pipe(dest('dist', { sourcemaps: '.' }));
}

// Image Minification Task
function imagesTask(){
  return src('app/images/**/*.{png,gif,jpg,jpeg,svg}')
    .pipe(imagemin())
    .pipe(dest('dist/images'));
}

// Browser Serve
function browsersyncServe(cb){
  browsersync.init({
    server: {
      baseDir: '.'
    }    
  });
  cb();
}

// Browser Reload
function browsersyncReload(cb){
  browsersync.reload();
  cb();
}

// Watch Task
function watchTask(){
  watch('*.html', series(htmlTask, browsersyncReload));
  watch(['app/**/*.scss', 'app/**/*.js'], series(scssTask, jsTask, browsersyncReload));
}

// Fix Paths for Production URL.
function pathFixes(){
  const ghPages = '$1http://extremelawnservice.com/';
  return src('dist/**/*.html')
    .pipe($.replace(/("|'?)\/?styles\//g,  ghPages + '/styles/'))
    .pipe($.replace(/("|'?)\/?scripts\//g, ghPages + '/scripts/'))
    .pipe(gulp.dest('dist'));
}

function sharedTasks(){
  htmlTask,
  scssTask,
  jsTask,
  imagesTask,
  browsersyncServe,
  watchTask
}

if (process.env.NODE_ENV === 'production') {
  exports.build = series(sharedTasks, pathFixes);
} else {
  exports.build = series(sharedTasks);
}

exports.default = series(sharedTasks);