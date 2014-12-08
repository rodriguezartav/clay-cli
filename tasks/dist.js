var gulp       =   require( 'gulp' );
var path       =   require( 'path' );
var chalk      =   require( 'chalk');
var request    =   require( 'superagent' );
var gutil      =   require( 'gulp-util' );
var source     =   require( 'vinyl-source-stream' );
var replace    =   require( 'gulp-replace' );
var changed    =   require( 'gulp-changed' );
var awspublish =   require( 'gulp-awspublish' );
var rename     =   require( 'gulp-rename' );
var zip        =   require( 'gulp-zip' );
var revall     =   require('gulp-rev-all');
var config     =   require( '../config' );
var Request    =   require("superagent");
var localize   =   config.localize;


gulp.task('CLAY_GET_KEY', function(cb) {
  Request.get( "https://unzipper.herokuapp.com/login" )
  .set('Accept', 'application/json')
  .type('application/json')
  .query("action=GET_VERSION")
  .query("dev_code="+ config.get("USER").key)
  .end(function(res){
    if( res.status > 200 ) return cb( res.text );
    config.set( "AWS_ACCESS_KEY", res.body.Aws_Keys.Credentials.AccessKeyId);
    config.set( "AWS_ACCESS_TOKEN", res.body.Aws_Keys.Credentials.SecretAccessKey);
    config.set( "AWS_BUCKET", res.body.Aws_Keys.Bucket );
    config.set( "PREFIX", "http://" +res.body.Aws_Keys.Bucket + "/" + res.body.Org__r.Name + "/" + config.get("ZIP_NAME") );
    config.set("CLAY_USER",res.body );
    cb();  
  });
});


gulp.task( 'CLAY_COPY', [ config.get("BUILD_PROCESS") || "CLAY_BUILD", "CLAY_GET_KEY" ] , function () {
  var regexps = config.get( "TRANSFORM_REGEXP", [] );

  return gulp.src([ config.get("build.folder") + "/**" ], { cwd: process.cwd() })
  .pipe(revall({
    ignore: [/^\/favicon.ico$/g, /^\/index.html/g ].concat(regexps),
    prefix: config.get( "PREFIX")
  }))
  .pipe( gulp.dest( config.get("dist.folder") ) );
});


gulp.task( 'CLAY_ZIP', [ "CLAY_COPY" ] , function () {
  return gulp.src([ config.get("dist.folder") + "/**" ], { base: config.get("build.folder") , cwd: process.cwd() })
  .pipe(zip( config.get("ZIP_NAME") + ".zip" ))
  .pipe( gulp.dest( config.get("dist.folder") ) );
});


gulp.task('CLAY_UPLOAD', [ 'CLAY_ZIP', 'CLAY_GET_KEY' ], function() {
  var headers = { 'Cache-Control': 'max-age=315360000, no-transform, public' };

  var publisher = awspublish.create({ 
    key: "AKIAJWK5QQU6VPU2VNTQ",
    secret: "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",
    bucket: config.get("AWS_BUCKET")
  });

  return gulp.src( config.get("ZIP_PATH") )
  .pipe(rename(function (path) {
    path.dirname = '/' + config.get("CLAY_USER").Org__r.Name + "/" + config.get("ZIP_NAME")
  }))
  .pipe(publisher.publish(headers))
  .pipe(awspublish.reporter());
});


gulp.task('CLAY_DIST', ['CLAY_UPLOAD'], function(cb){
  request.get("http://unzipper.herokuapp.com/unzip")
  //request.get("http://localhost:3000/unzip")
  .query({ bucket: config.get("AWS_BUCKET") })
  .query({ key:  config.get("CLAY_USER").Org__r.Name + '/' + config.get("ZIP_NAME") + "/" + config.get("ZIP_NAME") +'.zip' })
  .end(function(res){
    if(res.status > 200){
      console.dir(res.error)
      console.error(res.status)
      console.dir(res.body || res.test)
      throw res.body || res.text || res.error || res.status
    }
    console.log("Operation Complete")
    return cb();
  })
});


/*
gulp.task("CLAY_STAGE", ['clay-stage-1', 'clay-stage-2', ])

gulp.task("clay-stage-1", ['CLAY_GET_KEY'],  function(){
  config.get("BUILD_PROCESS", process.env['BUILD_PROCESS']);
  config.set("PREVIEW", process.env["CLAY_URL"] + "/" + config.get("USER").user_name + "/" + p.name  + "_" + p.version )
})


gulp.task('3vot-stage-2', ['3vot-stage-1', 'CLAY_COPY'], function() {
  
  var publisher = awspublish.create({ 
    key: config.get("AWS_ACCESS_KEY"),  
    secret: config.get("AWS_ACCESS_TOKEN"), 
    bucket: config.get("AWS_BUCKET")
  });

  // define custom headers
  var headers = { 'Cache-Control': 'max-age=100, no-transform, public' };

  return gulp.src( config.get("dist.folder") + "/**" )
    .pipe(rename(function (path) {
      path.dirname = '/' + config.get("USER").user_name + "/"  + config.get("ZIP_NAME") + "/" + path.dirname
    }))
    .pipe(publisher.publish(headers, { force: true }))
    .pipe(awspublish.reporter());  
});


//CLAY API RESPONSE


{
  "Org__r" : {
    "Name" : "clay",
    "Id" : "a0I5000000fe4MkEAI"
  },
  "Name" : "newclayuser",
  "Org__c" : "a0I5000000fe4MkEAI",
  "Email__c" : "newclayuser@mycorp.com",
  "Id" : "a0H50000009QJj3EAG"
  "Aws_Keys": {}
}

*/
