process.chdir( "./test/fixtures/clay_old" );
console.log(process.cwd())

var fs = require("fs");
var test = require('tape');
var gulp = require("gulp");
var path = require("path")
var rimraf = require("rimraf")

var glog = require('gulp-api-log');
//glog(gulp);

test('should start config and read values', function (t) {
  t.plan(2);
  
  var config = require("../config").setup("clay.json");

  t.equal( config.get("build.src"), "./");

  config.set("build.src", "test");

  t.equal( config.get("build.src"), "test");

  

});


