var _und = require('underscore');
var util = require('util');
var async = require('async');
var redis = require('./redis');

var ingyeos_client = redis.createIngyeosClient();
var juggernaut_client = redis.createJuggernautClient();

var TARGET_CHANNEL_NAMESPACES = ['page'];

Manager = module.exports = {};

Manager.process = function(type, data) {
  var channel_namespace = data.channel.split('/')[0];
  if(TARGET_CHANNEL_NAMESPACES.indexOf(channel_namespace) < 0) return;

  // Add or remove from channel's user_ids
  if(data.meta && data.meta.user){
    var user = data.meta.user;
    ingyeos_client.hmset('user:' + user._id, user);
    if(type === 'juggernaut:subscribe') {
      ingyeos_client.sadd('manager:' + data.channel, user._id + ':' + data.session_id);
    }
    else if(type === 'juggernaut:unsubscribe') {
      ingyeos_client.srem('manager:' + data.channel, user._id + ':' + data.session_id);
    }
  }

  // Broadcast current user_ids in the channel
  ingyeos_client.smembers('manager:' + data.channel, function(err, user_session_ids){
    if(!err){
      var user_ids = _und.map(user_session_ids, function(user_session_id){
        return user_session_id.split(':')[0];
      });
      user_ids = _und.uniq(user_ids);
      async.parallel(_und.map(user_ids, function(user_id){
        return function(callback){
          ingyeos_client.hgetall('user:' + user_id, function(err, user){
            if(!err){
              callback(null, user);
            }
            else{
              callback(err, null);
            }
          });
        };
      }), function(err, user_data){
        var message = {
          channel: data.channel,
          data: {
            _type: 'OnlineUsers',
            object_hash: user_data
          }
        }
        juggernaut_client.publish('juggernaut', JSON.stringify(message));
      });
    }
  });
}
