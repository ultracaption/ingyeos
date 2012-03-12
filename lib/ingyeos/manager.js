var _und = require("underscore");
var util = require("util");
var redis = require("./redis");

var manager_client = redis.createClient();

Manager = module.exports = {};

Manager.process = function(type, data) {
  // Add or remove from channel's user_ids
  if(data.meta && data.meta.user_id){
    if(type == 'juggernaut:subscribe') {
      manager_client.sadd("manager:"+data.channel, data.meta.user_id+":"+data.session_id);
    }
    else if(type == 'juggernaut:unsubscribe') {
      manager_client.srem("manager:"+data.channel, data.meta.user_id+":"+data.session_id);
    }
  }

  // Broadcast current user_ids in the channel
  manager_client.smembers("manager:"+data.channel, function(err, user_session_ids){
    if(!err){
      var user_ids = _und.map(user_session_ids, function(user_session_id){
        return user_session_id.split(':')[0];
      });
      user_ids = _und.uniq(user_ids);
      var message = {
        channel: data.channel,
        data: {
          type: "OnlineUsers",
          object_hash: user_ids
        }
      }
      manager_client.publish("juggernaut", JSON.stringify(message));
    }
  });
}
