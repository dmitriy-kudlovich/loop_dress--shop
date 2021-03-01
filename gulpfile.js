const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const watch = require("gulp-watch");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const notify = require("gulp-notify");
const plumber = require("gulp-plumber");
const gcmq = require("gulp-group-css-media-queries");
const sassGlob = require("gulp-sass-glob");
const pug = require("gulp-pug");
const del = require("del");

gulp.task("pug", function (callback) {
  return gulp
    .src("./src/pug/pages/**/*.pug")
    .pipe(
      plumber({
        errorHandler: notify.onError((err) => {
          return {
            title: "Pug",
            sound: false,
            message: err.message,
          };
        }),
      })
    )
    .pipe(
      pug({
        pretty: true,
      })
    )
    .pipe(gulp.dest("./build/"))
    .pipe(browserSync.stream());
  callback();
});

gulp.task("scss", function (callback) {
  return gulp
    .src("./src/scss/main.scss")
    .pipe(
      plumber({
        errorHandler: notify.onError((err) => {
          return {
            title: "Styles",
            sound: false,
            message: err.message,
          };
        }),
      })
    )
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(
      sass({
        indentType: "tab",
        indentWidth: 1,
        outputStyle: "expanded",
      })
    )
    .pipe(gcmq())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 4 versions"],
      })
    )
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./build/css/"))
    .pipe(browserSync.stream());
  callback();
});

gulp.task("copy:img", function (callback) {
  return gulp.src("./src/img/**/*.*").pipe(gulp.dest("./build/img"));
  callback();
});

gulp.task("copy:js", function (callback) {
  return gulp.src("./src/js/**/*.js").pipe(gulp.dest("./build/js"));
  callback();
});

gulp.task("copy:libs", function (callback) {
  return gulp.src("./src/libs/**/*.*").pipe(gulp.dest("./build/libs"));
  callback();
});

gulp.task("watch", function () {
  // Слежение за изменением js, img, libs
  watch(
    ["./build/js/**/*.js", "./build/img/**/*.*", "./build/libs/**/*.*"],
    gulp.parallel(browserSync.reload)
  );

  // Слежение за scss и компиляция в CSS
  watch("./src/scss/**/*.scss", function () {
    setTimeout(gulp.parallel("scss"), 1000);
  });

  // Слежение за pug и сборка страниц
  watch("./src/pug/**/*.pug", gulp.parallel("pug"));
});

// Задача для старта сервера из папки app
gulp.task("browser-sync", function () {
  browserSync.init({
    server: {
      baseDir: "./build/",
    },
  });

  watch("./src/img/**/*.*", gulp.parallel("copy:img"));
  watch("./src/js/**/*.js", gulp.parallel("copy:js"));
  watch("./src/libs/**/*.*", gulp.parallel("copy:libs"));
});

gulp.task("clean:build", function (callback) {
  return del("./build");
  callback();
});

gulp.task(
  "default",
  gulp.series(
    "clean:build",
    gulp.parallel("scss", "pug", "copy:img", "copy:js", "copy:libs"),
    gulp.parallel("browser-sync", "watch")
  )
);
