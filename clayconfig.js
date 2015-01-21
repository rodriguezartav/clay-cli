var fs      = require("fs");
var config  = require("r2-config").setup("package.json");


if(!config.raw.name)	            error( "package.json should have a name value")
if(!config.raw.version)	          error( "package.json should have a version value")

config.set( "DIST_FOLDER", config.get("dist", "./dist") );
config.set( "ZIP_NAME"      ,  config.get("name") );
config.set( "ZIP_FOLDER"    ,  config.localize( "./"));


try{
	fs.existsSync( config.localize( config.get("DIST_FOLDER")  ) )
}catch(e){ throw config.localize( config.get("DIST_FOLDER") ) + " was not found."}	


module.exports = config;