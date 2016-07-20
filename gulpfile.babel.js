const gulp = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

//  ____    _    ____ ____
// / ___|  / \  / ___/ ___|
// \___ \ / _ \ \___ \___ \
// ___) / ___ \ ___) |__) |
// |____/_/   \_\____/____/

// Compile the sass stylesheet
// Send the CSS file to the views folder
gulp.task('sass', () =>
  gulp.src('./assets/sass/login.scss')
    .pipe(sass({

      // This tells sass to look in the partials folder when
      // you import a file in the login.scss file.
      // You can write `@import "reset"` rather than `@import "partials/_reset"`
      includePaths: ['./assets/sass/partials'],
    }).on('error', sass.logError))
    .pipe(gulp.dest('./views'))
);

//  ____   ___  ____ _____ ____ ____ ____
// |  _ \ / _ \/ ___|_   _/ ___/ ___/ ___|
// | |_) | | | \___ \ | || |   \___ \___ \
// |  __/| |_| |___) || || |___ ___) |__) |
// |_|    \___/|____/ |_| \____|____/____/

// Autoprefix and minify the CSS in the views folder
gulp.task('postcss', ['sass'], () =>
  gulp.src('./views/login.css')
    .pipe(postcss([

      // Autoprefix the CSS
      autoprefixer({
        browsers: ['last 2 versions'],
        cascade: true,
      }),

      // Minify
      cssnano(),
    ]))
    .pipe(gulp.dest('./views/'))
);

// Default task. Can be run with 'gulp'
gulp.task('default', ['sass', 'postcss']);

// Watch task
gulp.task('watch', () => {
    gulp.watch('assets/sass/**/*.scss', ['default']);
});
