var util = require("util");
var redis = require("./redis");
var manager = require("./manager");

var watcher_client = redis.createClient();

Watcher = module.exports = {};

Watcher.subscribe = function(){
  watcher_client.on("message", function(type, data){
    data = JSON.parse(data);
    manager.process(type, data);
  });

  watcher_client.subscribe("juggernaut:subscribe");
  watcher_client.subscribe("juggernaut:unsubscribe");
};
