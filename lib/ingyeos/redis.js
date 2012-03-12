var util = require("util");
var url = require("url");
var redis = require("redis");

module.exports.createClient = function() {
  var client;

  if(process.env.INGYEOS_REDIS_URL) {
    var addr = url.parse(process.env.INGYEOS_REDIS_URL);
    client = redis.createClient(addr.port, addr.hostname);
    if(addr.auth) {
      client.auth(addr.auth.split(":")[1]);
    }
  } else {
    client = redis.createClient();
  }

  return client;
};
