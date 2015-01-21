global.threevot = {}

var Path = require("path")
var Fs = require("fs")
var gulp = require('gulp');
var gutil = require('gulp-util');
var chalk = require('chalk');
var requireDir = require('require-dir');


var localPath = Path.join( process.cwd(), "gulpfile.js" )

var localPath = process.cwd();
var originalTaks = gulp.tasks;

var config = require("./clayconfig")

console.log( chalk.magenta('Welcome to 3VOT') );

requireDir('./tasks', { recurse: true });


