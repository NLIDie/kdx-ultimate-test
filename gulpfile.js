"use strict";

const gulp = require("gulp");
const sass = require("gulp-sass");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const mqpacker = require("css-mqpacker");
const minify = require("gulp-csso");
const imagemin = require("gulp-imagemin");
const svgmin = require("gulp-svgmin");
const svgstore = require("gulp-svgstore");
const rename = require("gulp-rename");
const del = require("del");
const runSeq = require("run-sequence");
const cheerio = require("gulp-cheerio");
const server = require("browser-sync").create();
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const templatePolyfill = require('template-polyfill');

gulp.task("copy", () => {
  gulp.src([
    "fonts/**/*.{woff,woff2}",
    "img/**",
    "*.html"
  ], {
    base: "."
  })
    .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("style", function () {
  gulp.src("sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 3 versions"
      ]}),
      mqpacker({
        sort: true
      })
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task('scripts', function () {
  gulp.src('js/*.js')
    .pipe(sourcemaps.init())
      .pipe(babel({
        presets: ['es2015']
      }))
      .pipe(concat('script.js'))
      .pipe(gulp.dest('build/js'))
      .pipe(uglify())
      .pipe(rename("script.min.js"))
      .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/js'))
});

gulp.task("images", function () {
  return gulp.src("build/img/**/*.{png,jpg,gif}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest("build/img"));
});

gulp.task("symbols", function () {
  return gulp.src("build/img/icons/*.svg")
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(cheerio({
      run: function ($) {
        $('svg').attr('style',  'display:none');
        $('[fill]').removeAttr('fill');
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("html:copy", function () {
  return gulp.src("*.html")
    .pipe(gulp.dest("build"))
});

gulp.task("html:update", ["html:copy"], function (done) {
  server.reload();
  done();
});

gulp.task("server", function () {
  server.init({
    server: "build/"
  });

  gulp.watch("sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("js/*.js", ["scripts"]);
  gulp.watch("*.html", ["html:update"]);
});

gulp.task("build", function (fn) {
  runSeq (
    "clean",
    "copy",
    "style",
    "scripts",
    "images",
    "symbols",
    fn
  );
});
