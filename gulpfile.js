const { src, dest, watch, series, parallel } = require('gulp');
const fileinclude = require('gulp-file-include');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const terser = require('gulp-terser');
const autoprefixer = require('autoprefixer');
// const imagemin = require('gulp-imagemin');
const browsersync = require('browser-sync').create();
const replace = require('gulp-replace');
const ghpages = require('gh-pages');

// HTML Include task
function htmlTask(){
  return src('app/**/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest('dist'));
}

// Sass Task
function scssTask(){
  return src('app/assets/styles/application.scss', { sourcemaps: true })
      .pipe(sass())
      .pipe(postcss([ autoprefixer('last 2 version'), cssnano() ]))
      .pipe(dest('dist/styles', { sourcemaps: '.' }));
}

// JavaScript Task
function jsTask(){
  return src('app/assets/scripts/**/*.js', { sourcemaps: true })
    .pipe(terser())
    .pipe(dest('dist/scripts', { sourcemaps: '.' }));
}

// Image Minification Task
// function imagesTask(){
//   return src('app/images/**/*.{png,gif,jpg,jpeg,svg}')
//     .pipe(imagemin())
//     .pipe(dest('dist/images'));
// }

// Copy Specific Directories
function copyVendorFiles(){
  return src('app/assets/vendor/**/*').pipe(dest('dist/vendor'));
}

function copyImageFiles(){
  return src('app/assets/images/**/*').pipe(dest('dist/images'));
}

function copyFontFiles(){
  return src('app/assets/fonts/**/*').pipe(dest('dist/fonts'));
}

// Browser Serve
function browsersyncServe(cb){
  browsersync.init({
    server: {
      baseDir: 'dist',
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
  watch('app/**/*.html', series(htmlTask, browsersyncReload));
  watch(['app/assets/**/*.scss', 'app/assets/**/*.js'], series(scssTask, jsTask, browsersyncReload));
}

// Fix Paths for Production URL.
function pathFixes(){
  const ghPages = '$1https://els.evanmwillhite.com/';
  return src('dist/**/*.html')
    .pipe(replace(/("|'?)\/?styles\//g,  ghPages + '/styles/'))
    .pipe(replace(/("|'?)\/?scripts\//g, ghPages + '/scripts/'))
    .pipe(replace(/("|'?)\/?vendor\//g, ghPages + '/vendor/'))
    .pipe(replace(/("|'?)\/?images\//g, ghPages + '/images/'))
    .pipe(dest('dist'));
}

// Publish to Github
function publishProject(){
  return ghpages.publish('dist');
};

exports.build = parallel(
  htmlTask,
  scssTask,
  jsTask,
  copyVendorFiles,
  copyImageFiles,
  copyFontFiles,
);

exports.watch = parallel(browsersyncServe, watchTask);

exports.deploy = series(pathFixes, publishProject);

// if (process.env.NODE_ENV === 'production') {
//   exports.build = series(sharedTasks, pathFixes, publishProject);
// } else {
//   exports.build = series(sharedTasks);
// }

// exports.default = series(
//   build,
//   browsersyncServe,
//   watchTask
// );