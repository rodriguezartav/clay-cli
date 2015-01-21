
var Path    = require("path")
var fs      = require("fs");
var Q       = require("q");
var crypto  = require('crypto');
var request = require("superagent");

var replace = require('gulp-replace');
var revall  = require('gulp-rev-all');

var gulp    = require("gulp");
var jsforce = require("jsforce");
var config  = require("r2-config");
var es      = require("event-stream");

gulp.task( "CLAY_SF_LOGIN", function( cb ){

  Login()
  .then( cb ).done();

});

function Login(){
  var deferred = Q.defer();
  
  var parts = Config.get("USER_PARTS");
  var username = parts[0];
  var password = parts[1];
  var host = parts[2] || "login.salesforce.com"

  sfforce.login( username, password, function( result ){
    if(result.error) deferred.reject(result)
    else{
      config.get( "SF_SESSION", result );
      deferred.resolve( result )
    }
  });

  return deferred.promise; 
}

module.exports = Login;