var gulp = require('gulp'),
    sass = require('gulp-sass'),
    postcss = require("gulp-postcss"),
    autoprefixer = require("autoprefixer"),
    cssnano = require("cssnano"),
    sourcemaps = require("gulp-sourcemaps"),
    browserSync = require('browser-sync'),
    npmDist = require('gulp-npm-dist'),
    rename = require('gulp-rename'),
    imageResize = require('gulp-image-resize'),
    markdown = require('gulp-markdown');

var paths = {
  styles: {
    src: "sass/styles.scss",
    dest: "css"
  },
  scripts: {
    src: "js/**/*.js",
    dest: "js/**/"
  }
};

function style() {
  return (
    gulp
    .src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on("error", sass.logError)
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream())
  );
};
exports.style = style;

function reload() {
  browserSync.reload();
}

function watch(done) {

  browserSync.init({
    notify: false,
    ghostMode: false,
    server: {
      baseDir: "./"
    }
  });
  dist();
  style();
  gulp.watch(paths.styles.src, style)
  gulp.watch(["index.html", "js/main.js", "js/components/functions.js", "js/components/storymap-rewrite.js"], function(done) {
    reload();
    done();
  });
};
exports.watch = watch;



async function dist() {
  gulp.src('data/content/src/*.md')
    .pipe(markdown())
    .pipe(gulp.dest('data/content/dist'))
    
  crop();

  gulp.src(npmDist({
    excludes: ['/**/node_modules/', '/**/*.html']
  }), {
    base: './node_modules'
  })
  // .pipe(rename(function(path) {
  //     path.dirname = path.dirname.replace(/\/dist/, '').replace(/\\dist/, '');
  // }))
  .pipe(gulp.dest('./public/libs'));

}
exports.dist = dist;

async function crop() {
  gulp.src('data/content/images/*.png')
  .pipe(imageResize({
    width : 150,
    height : 150,
    crop : true,
    upscale : false
  }))
  .pipe(gulp.dest('data/content/images/mini'));
}
exports.crop = crop;
