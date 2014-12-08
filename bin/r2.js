#!/usr/bin/env node

var glog = require('gulp-api-log');
var config = require("../config");

var gulp = require("gulp")
require("../index");

var argv = require('yargs').argv;

if(argv._.indexOf("t") > -1 ) glog(gulp);

config.set("buildFolder", "dist");


if( argv._[0] == "sf:server" ){
	config.set("PREFIX", "https://localhost:3000/");
	config.set("IS_WATCHING",false);
	config.set("ZIP_NAME", config.get("app.name") + "_" + config.get("app.version") )
	gulp.start("CLAY_ENTRY_SERVER")
}

else if( argv._[0] == "server" ){
	config.set("PREFIX", "http://localhost:3000/");
	config.set("IS_WATCHING", true);
	gulp.start("CLAY_SERVER")
}

else if( argv._[0] == "preview" ){
	config.set("IS_WATCHING",false);
	config.set("ZIP_NAME", config.get("app.name") )
	gulp.start("CLAY_DIST")
}

else if( argv._[0] == "publish" ){
	config.set("IS_WATCHING",false);
	config.set("ZIP_NAME", config.get("app.name") + "_" + config.get("app.version") )
	gulp.start("3VOT_ENTRY_UPLOAD")
}

return false

