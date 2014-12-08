var fs            =  require("fs");
var gulp          =  require('gulp');
var path          =  require("path");
var chalk         =  require('chalk');
var replace       =  require('gulp-replace');
var revall        =  require('gulp-rev-all');
var concatCss     =  require('gulp-concat-css');
var gutil         =  require('gulp-util');
var rename        =  require('gulp-rename');
var del           =  require("del");
var autoprefixer  =  require('gulp-autoprefixer');
var config        =  require("../config");
var source        =  require('vinyl-source-stream');
var watchify      =  require('watchify');
var browserify    =  require('browserify');
var browserSync   =  require('browser-sync');
var localize      =  config.localize;
var users         =  require("./users")
var r2            =  require("../plugins/gulp-r2")

var runSequence = require('run-sequence').use(gulp);

gulp.task('CLAY_HTML', function () { 
  gulp.src([ config.get("build.src") + '/*.html'], { cwd: process.cwd() })      
  .pipe( r2.transform( { prefix: config.get("PREFIX", false) } ) )
  .pipe( gulp.dest( config.get("build.folder") ));
});

gulp.task("CLAY_ASSETS_i", function(){
  return gulp.src( config.get("ASSETS_GLOBS")  , { cwd: process.cwd() } )
  .pipe(gulp.dest( config.get("build.folder") ));
})

gulp.task("CLAY_ASSETS", [ "CLAY_HTML", "CLAY_CSS"], function(){
  return gulp.src( config.get("ASSETS_GLOBS")  , { cwd: process.cwd() } )
  .pipe(gulp.dest( config.get("build.folder") ));
})

gulp.task('CLAY_CSS', function (cb) {   
    var exists = fs.existsSync( config.localize( config.get("build.src"),"index.css" ) );  
    if(!exists) return cb();

  	gulp.src([ config.get("build.src") + '/css/*.css'], { cwd: process.cwd() })
    .pipe(concatCss('index.css'))
    .pipe(autoprefixer({browsers: ['last 2 version']}))
  	.pipe( gulp.dest( config.get("build.folder") + "/css" ) );
    return cb();
});

gulp.task('CLAY_BROWSERIFY', function(cb) {
  var filePath = config.localize( config.get("build.src") , "/index.js" );

  if(fs.existsSync( filePath ) == false) throw " js file not found in build.src folder " + filePath;

  var bundler;
  if( config.get("IS_WATCHING", false) == true) bundler = watchify( browserify( filePath , watchify.args));
  else bundler = browserify( filePath ); 
  
  bundler.extensions = config.get("browserify.extensions");

  var transforms = config.get("browserify.transforms");
  for (var i = 0; i < transforms.length; i++) bundler.transform( transforms[i] );

  if( config.get("IS_WATCHING", false) == true) bundler.on('update', rebundle);
  
  function rebundle() { 
    bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('index.js'))
    .pipe(gulp.dest( config.get("build.folder") ));
    if( config.get( "IS_WATCHING", false ) == true ) browserSync.reload();
  }

  rebundle();
  return cb();
});


gulp.task("CLAY_PLACEHOLDER",['CLAY_BROWSERIFY'], function(){
  return gulp.src( [ config.get("build.folder") + '/*.js' ] , { cwd: process.cwd() } )
  .pipe(replace( /{3vot}\//g, config.get("PREFIX","")))
  .pipe(replace( /{ROOT}/g, config.get("PREFIX","")))
  .pipe(gulp.dest( config.get("build.folder") ));
})


gulp.task('CLAY_BUILD_CLEAN', function (cb) {
  del( [ config.get("build.folder") ], cb)
});

gulp.task('CLAY_BUILD', function(callback) {
  runSequence('CLAY_BUILD_CLEAN', ['CLAY_BROWSERIFY', 'CLAY_ASSETS'], callback);
});

