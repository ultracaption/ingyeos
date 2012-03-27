var util = require('util');
var url = require('url');
var redis = require('redis');

module.exports.createClient = function(redis_url) {
  var client;

  if(redis_url) {
    var addr = url.parse(redis_url);
    client = redis.createClient(addr.port, addr.hostname);
    if(addr.auth) {
      client.auth(addr.auth.split(':')[1]);
    }
  } else {
    client = redis.createClient();
  }

  return client;
}

module.exports.createJuggernautClient = function() {
  return module.exports.createClient(process.env.REDISTOGO_URL);
};

module.exports.createIngyeosClient = function() {
  var client = module.exports.createClient(process.env.INGYEOS_REDIS_URL);

  // TODO: Sweep previous online users data on (re)start
  // client.flushdb();

  return client;
};
