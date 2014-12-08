var Q = require("q");
var fs = require("fs")
var extend = require('util')._extend
var prompt = require("prompt")
var chalk = require('chalk');

function get(options, oneUser){
  var deferred = Q.defer();

  if(!options) options = { namespace: "3vot" }
  if(!oneUser && oneUser != false) oneUser=true;

  spawn(["get", options.namespace ])
  .then( function(result){ 
    try{ result  = JSON.parse(result) }catch(err){ result = {} }
    if(oneUser && (!result.users || result.users === {} )) return deferred.reject("No users found, use users --add ");
    var object = {};
    object.user = result;
    object.promptValues = options;
    options = object;
    return object
  })
  .then( function(object){ if(oneUser) return promptForUser(object); else return object; } )
  .then( function( result ){ console.log("\n\n\n"); console.log( chalk.bgGreen.black("User: " + result.user.user_name )); return result;  } )
  .then( deferred.resolve )
  .fail( deferred.reject )

  return deferred.promise;
}

function promptForUser(object){
  var deferred = Q.defer();

  var objectKeys = Object.keys(object.user.users)
  var objectUsers = objectKeys.length;
  
  if(objectUsers <= 1){
    if(objectUsers == 1) object.user = object.user.users[ objectKeys[0] ];
    process.nextTick( function(){ return deferred.resolve(object); });
    return deferred.promise;
  }

  prompt.start();

  var description = chalk.green('Registered Users') +  "\n";
  var index = 1;
  var userArray = [];
  for(user in object.user.users){
    description += index + ": " + user + "\n";
    userArray.push( object.user.users[user] );
    index++;
  }

  description+= "\n" + chalk.green('Type a number:');

  var prompts = [ 
    { name: 'user_name_index', description: description }
  ]

  prompt.get(prompts, function (err, result) {
    object.user = userArray[ parseInt(result.user_name_index) - 1 ];
    deferred.resolve(object);
  });

  return deferred.promise;

}

function set(contents, namespace){
  var deferred = Q.defer();
  spawn(["set", namespace || "3vot", JSON.stringify(contents)])
  .then( deferred.resolve )
  .fail( deferred.reject )

   return deferred.promise;  
}

function spawn(commands){
  var deferred = Q.defer();

  var exec = require('child_process').exec;

  var npmcommand = (process.platform === "win32" ? "npm.cmd" : "npm")
  
  var spawn = require('child_process').spawn
  var npm    = spawn(npmcommand, commands);
  var npmResponse ="";

  npm.stderr.setEncoding('utf8');
  npm.stderr.on('data', function (data) {
    deferred.reject(data)
  });

  npm.on('error', function (err) {
    return deferred.reject(err);
  });
  
  npm.stdout.on('data', function (data) {
    npmResponse += data.toString();
  });

  npm.on('close', function (code) {
    return deferred.resolve(npmResponse)
  });

  return deferred.promise;  
}

module.exports = {
  get: get,
  set: set,
  promptForUser: promptForUser
}