var PassThrough = require('stream').PassThrough;
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

var stream = new PassThrough({ objectMode: true });
var es = createEventSource(stream, api);

module.exports = stream;

function createEventSource(stream, api) {
  var esUrl = api.protocol + '://' + api.hostname +
              api.path + '?' + querystring.stringify(api.qs);

  var eventSource = new EventSource(esUrl);
  eventSource.on('temperature', function (evt) {
    stream.write(JSON.parse(evt.data));
  });
  return eventSource;
}
