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
var config     =   require( 'r2-config' );
var Request    =   require('superagent');
var open       =   require('open');
var localize   =   config.localize;


gulp.task('CLAY_GET_KEY', function(cb) {

  Request.get( 'https://unzipper.herokuapp.com/login' )
  .set( 'Accept', 'application/json' )
  .type( 'application/json' )
  .query( 'dev_code='+ config.get( 'USER' ) )
  .end( function( res ){
    if( res.status > 200 ) return cb( res.text );
    config.set( 'AWS_ACCESS_KEY', res.body.Aws_Keys.Credentials.AccessKeyId);
    config.set( 'AWS_ACCESS_TOKEN', res.body.Aws_Keys.Credentials.SecretAccessKey);
    config.set( 'AWS_BUCKET', '3votzips' ); //res.body.Aws_Keys.Bucket );
    config.set( 'CLAY_USER', res.body );
    cb();  
  });
});

gulp.task( 'CLAY_ZIP', [ 'CLAY_GET_KEY' ] , function () {
  return gulp.src( [ config.get('DIST_FOLDER') + '/**' ], { base: config.get( 'DIST_FOLDER' ) , cwd: process.cwd() })
  .pipe(zip( config.get( 'ZIP_NAME' ) + '.zip' ))
  .pipe( gulp.dest( config.get( 'ZIP_FOLDER' ) ));
});


gulp.task('CLAY_UPLOAD', [ 'CLAY_ZIP', 'CLAY_GET_KEY' ], function() {
  var headers = { 'Cache-Control': 'max-age=1, no-transform, public' };

  var publisher = awspublish.create({ 
    key: config.get( 'AWS_ACCESS_KEY' ),
    secret: config.get( 'AWS_ACCESS_TOKEN' ),
    bucket: config.get( 'AWS_BUCKET' )
  });


  return gulp.src( config.get( 'ZIP_PATH' ) )
  .pipe(rename(function ( path ) {
    path.dirname = '/' + config.get( 'ZIP_NAME' )
    path.basename = config.get( 'name' )
  }))
  .pipe(publisher.publish(headers))
  .pipe(awspublish.reporter());
});


gulp.task( 'CLAY_DIST', [ 'CLAY_UPLOAD' ], function(cb){
  //request.get('http://localhost:3000/unzip')

  request.get('http://unzipper.herokuapp.com/unzip')
  .query({ bucket: config.get( 'AWS_BUCKET' ) })
  .query({ key:  config.get( 'ZIP_NAME' ) + '/' + config.get( 'name' )  +'.zip' })
  .end( function( res ){
    if(res.status > 200){
      console.dir( res.error )
      console.error( res.status )
      console.dir( res.body || res.test )
      throw res.body || res.text || res.error || res.status
    }
    gutil.log( gutil.colors.green( 'Publication Complete' ) );
    
    open( "http://" + config.get("ZIP_NAME") + ".3votapp.com/index.html" );
    return cb();
  })
});
