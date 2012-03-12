var util = require("util");
var redis = require("./redis");
var watcher = require("./watcher");

module.exports.run = function(){
  watcher.subscribe();
};
