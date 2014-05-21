var Readable = require('stream').Readable;
var querystring = require('querystring');
var EventSource = require('eventsource');
var assert = require('assert');

var deviceId = process.env.SPARK_DEVICE_ID;
var token = process.env.SPARK_TOKEN;

assert(deviceId, 'SPARK_DEVICE_ID required');
assert(token, 'SPARK_token required');

var api = {
  protocol: 'https',
  hostname: 'api.spark.io',
  path: '/v1/devices/' + deviceId + '/events/temperature',
  qs: {
    access_token: token
  }
};

var readable = new Readable({ objectMode: true });

var es = bindReadable(readable, api);

module.exports = readable;

function bindReadable(readable, api) {
  var esUrl = api.protocol + '://' + api.hostname +
              api.path + '?' + querystring.stringify(api.qs);

  var eventSource = new EventSource(esUrl);

  readable._read = function () {
    eventSource.once('temperature', function (evt) {
      readable.push(JSON.parse(evt.data));
    });
  };
}
