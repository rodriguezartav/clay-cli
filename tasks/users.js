var gulp = require('gulp');
var path = require("path");
var chalk = require('chalk');

var gutil = require('gulp-util');


var users = require("../users");
var config = require("../config");


gulp.task("3VOT_PROMPTUSER", function(cb){
  users.get()
  .then( function(result){
    config.set("USER", result.user);
    return cb()
  })
  .fail( function(err){  console.dir(err); } )
  .catch( function(err){ console.dir(err); } )
  .done();
})


gulp.task("3VOT_ADD_USER", function(cb){
  users.get()
  .then( function(result){
    config.set("USER", result.user);
    return cb()
  })
  .fail( function(err){ console.error(err) } )

})


gulp.task("3VOT_REMOVE_USER", function(cb){
  users.get()
  .then( function(result){
    config.set("USER", result.user);
    return cb()
  })
  .fail( function(err){ console.error(err) } )

})


gulp.task("CLAY_PROMPTUSER", function(cb){
  users.get({namespace: "clay"})
  .then( function(result){
    config.set("USER", result.user);
    return cb()
  })
  .fail( function(err){  console.dir(err); } )
  .catch( function(err){ console.dir(err); } )
  .done();
})


/*

function clay_removeuser(object){
  delete oldUser.users[ promptOptions.user.user_name + " : " + object.user.salesforce_user_name + " : " + object.user.salesforce_host ];
  
  return Packs.set(oldUser, "clay");
}


function clay_saveuser(){
  if( !promptOptions.user ) promptOptions.user = { users: {} }
  else if( !promptOptions.user.users || promptOptions.user.users === undefined || promptOptions.user.users ===   "undefined") promptOptions.user.users = {};
  promptOptions.user.users[ promptOptions.promptValues.user_name + " : " + promptOptions.promptValues.salesforce_user_name + " : " + promptOptions.promptValues.salesforce_host ] = promptOptions.promptValues;
  return Packs.set(promptOptions.user, "clay");
}

function removeuser(object){
  delete oldUser.users[object.user.user_name];
  return Packs.set(oldUser);

}

function saveuser(){
  if( !promptOptions.user.users || promptOptions.user.users === undefined || promptOptions.user.users == "undefined") promptOptions.user.users = {};
  promptOptions.user.users[promptOptions.promptValues.user_name] = promptOptions.promptValues;
  return Packs.set(promptOptions.user);

}

*/
