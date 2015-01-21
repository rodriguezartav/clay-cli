#!/usr/bin/env node

var glog         = require('gulp-api-log');
var config       = require("r2-config");
var User         = require("../tasks/users");
var App          = require("../tasks/app");
var gutil        = require('gulp-util');
var PluginError  = gutil.PluginError;
var gulp         = require("gulp")
var argv         = require('yargs').argv;
var SfLogin      = require("../plugins/login");
require("../index");

var showStack = false;
if(argv._.indexOf("-d") > -1 )showStack = true;
glog(gulp);

//
// Preview
//
if( argv._[0] == "preview" ){
	config.set("ZIP_NAME", config.get("name") + "_stage" );
	config.set( "ZIP_PATH", config.get( "ZIP_FOLDER" ) + "/" + config.get("ZIP_NAME") + ".zip" );

	getUser()
	.then( function(){ 
		return App.check( config.get("name") )
		.then( preview )
		.fail( doError ).done();
	})
	.fail( doError ).done();

	function preview(){
		
		gulp.start("CLAY_DIST");
		return false;
	}
}


//
// Publish
//
else if( argv._[0] == "publish" ){
	config.set("ZIP_NAME", config.get("name") );
	config.set( "ZIP_PATH", config.get( "ZIP_FOLDER" ) + "/" + config.get("ZIP_NAME") + ".zip" );

	getUser()
	.then( function(){ 
		App.check(config.get("name"))
		.then(publish)
		.fail( doError )
	})
	.fail( doError ).done();
	
	function publish(){
		gulp.start("CLAY_DIST")
		
		return false;
	}
}

//
// Salesforce
//
else if( argv._[0] == "salesforce" ){
	config.set( "ZIP_NAME", config.get("name") );
	config.set( "ZIP_PATH", config.get( "ZIP_FOLDER" ) + "/" + config.get("ZIP_NAME") + ".zip" );

	getUser(true)
	.then( function(){ 
		App.check( config.get("name") )
		.then( SfLogin )
		.then( salesforce )
		.fail( doError )
	})
	.fail( doError ).done();
	
	function salesforce(){

		//gulp.start("CLAY_DIST")
		
		return false;
	}
}


//
// Login
//

else if( argv._[0] == "login" ){
	if( argv._.length < 2 || !argv._[1] ) return doError( "Tip: Type developer key after login. ie: clay login KEY_GOES_HERE"  );
	User.set( argv._[1] )
	.then( function(){ gutil.log( gutil.colors.green( 'Login Complete' ) ); } )
	.fail( function(err){ doError(err); } ).done()
}

//
// Logout
//

else if( argv._[0] == "logout"){
	User.reset( null )
	.then( function(){ gutil.log( gutil.colors.green( 'Logout Complete' ) ); } )
	.fail( function(err){ doError(err); } ).done();
}

//
// Create
//

else if( argv._[0] == "create"  ){
	if( argv._.length < 2 || !argv._[1] ) return doError( "Tip: Type the app name after create, ie: clay create APP_NAME_GOES_HERE"  );

	getUser()
	.then( function(){
		App.create( argv._[1] )
		.then( function(){ 
			gutil.log( gutil.colors.green( 'Creation Complete' ) );
			return false;
		})
		.fail( doError ).done();
	})
	.fail( doError ).done();
}

return false

//
// Utils
//

function getUser( full ){
	return User.get()
	.then(
		function(userKey){
			var parts = userKey.split( "," );
			config.set( "USER" , parts[0] );
			parts = parts.splice(1,0);
			config.set( "USER_PARTS" , parts );
			return false;
		}
	);
}

function doError(err){
	gutil.log( gutil.colors.red( 'Sorry we encountered an error' ) );

 	if( typeof err == "string" ) gutil.log( gutil.colors.red( err ) );
 	else{
		throw new PluginError(
	    'r2',
	    err,
	    { showStack: showStack }
	  );
	}
}