var config = require("./config").setup("clay.json");

config.validateConfig();

config.set("ZIP_NAME"      ,  config.get("app.name") + "_" + config.get("app.version"))
config.set("ZIP_FOLDER"    ,  config.localize( "./dist"));
config.set("CSS_FOLDER"    ,  config.get( "build.css", true ) || "./app/css" );
config.set("ZIP_PATH"      ,  config.get( "ZIP_FOLDER" ) + "/" + config.get("ZIP_NAME") + ".zip" );
config.set("SRC_RELATIVE"  ,  config.get( "build.src" ).replace(".","").replace("/","") );
config.set("BUILD_PROCESS" ,  "CLAY_BUILD");

var src = config.get("SRC_RELATIVE")
if(src == "") src = ".";

var paths = [  config.get("build.src") + "/**" ];
var pathsToExclude = config.get("build.pathsToExclude");
for (var i = pathsToExclude.length - 1; i >= 0; i--) {
	paths.push( "!./" + src + "/" + pathsToExclude[i] );	
	if( pathsToExclude[i].indexOf("*.") == -1 || pathsToExclude[i].indexOf("**") == -1 ) paths.push( "!./" + src + "/" + pathsToExclude[i] + "/**");
};

config.set("ASSETS_GLOBS", paths );

if( !config.get("BUILD_PROCESS",false) ) config.set("BUILD_PROCESS", "CLAY_BUILD");


module.exports = config;