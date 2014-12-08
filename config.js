var path = require("path")
var fs = require("fs")
var gutil       = require('gulp-util');
var PluginError = gutil.PluginError;

var config;

function setup(jsonPath, validateFunction){
	try{
		config = require( localize(jsonPath).toString() );
		if(validateFunction) validateFunction()
			return {
				localize: localize,
				config: config,
				get: get,
				set: set,
				validateConfig: validateConfig
			}
	}catch(e){ error( "clay.json must be present in " + localize( jsonPath ) + ", please check current folder or setup new project. If it's present it may not be valid.") }
}

function get(value, nullValue){
	if(!config) error( "config is not defined, please run setup() first")
	function index(obj,i) { return obj[i] }

	if( config[value] && config[value] != "undefined" && config[value] != undefined ) return config[value]

	var resp = value.split('.').reduce(index, config)
	if( ( resp == null || resp == undefined || resp == "undefined" ) && nullValue ) return nullValue;
	if( ( resp == null || resp == undefined || resp == "undefined" ) && nullValue == null ) error( value + " was not found in clay.json")

	return resp;
}

function set(key, value){
	config[key] = value;
}

var localize = function( ){
  var args = Array.prototype.slice.call(arguments);
  args = args.reverse();
  args.push( process.cwd() )
  args = args.reverse();

  for (var i = args.length - 1; i >= 0; i--) {
  	args[i] = args[i].replace("./","")
  };

  return path.join.apply(this, args );
}

//MOVE ME

function validateConfig(){
	if(!config.app)	error( "clay.json should have and app object")
	if(!config.app.name)	error( "clay.json should have and app.name value")
	if(!config.app.version)	error( "clay.json should have and app.vesrion value")

	if(!config.build)	error( "clay.json should have a build object")
	if(!config.build.src)	error( "clay.json should have a build.src value")
	if(!config.build.folder)	error( "clay.json should have a build.folder value")
	


	if(!config.dist)	error( "clay.json should have a dist object")

	if(!config.dist.folder)	error( "clay.json should have a dist.folder value")

	if(!config.build.pathsToExclude)	error("clay.json should have a build.pathsToExclude value")

	try{
		fs.existsSync( localize( get("build.src") ) )
	}catch(e){ error( localize( get("build.src") ) + " was not found. Check build.src path in clay.json") }	

}

function error(err){
	console.log(new Error().stack);
	throw new PluginError({
    plugin: 'R2-CONFIG',
    message: err
  });
}



module.exports =  {
	localize: localize,
	config: config,
	get: get,
	set: set,
	setup: setup,
	validateConfig: validateConfig
};
