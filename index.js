var stream = require('./lib/stream');
var assert = require('assert');
var http = require('http');
var url = require('url');

var port = process.env.PORT || 8000;
var server;

var temperature = "??.??";
var timestamp = new Date().toISOString();

stream.on('data', function (obj) {
  temperature = round(obj.data);
  timestamp = obj.published_at;
});

server = http.createServer();
server.on('request', requestHandler);
server.listen(port, function () {
  console.log('Listening on %j', server.address());
});

function requestHandler(req, res) {
  var sendCode = respondWithCode.bind(this, req, res);
  var parts = url.parse(req.url.toLowerCase(), true);

  if (parts.pathname !== '/') {
    return sendCode(404);
  }

  var body = JSON.stringify({
    temperature: temperature,
    unit: 'fahrenheit',
    timestamp: timestamp
  });

  res.writeHead(200, {
    'content-type': 'application/json',
    'content-length': body.length
  });

  res.end(body);
};

function respondWithCode(req, res, code) {
  assert(~Object.keys(http.STATUS_CODES).indexOf(code.toString()), 'code not found');
  res.writeHead(code, {
    'content-length': http.STATUS_CODES[code].length,
    'content-type': 'text/plain'
  });
  res.end(http.STATUS_CODES[code]);
}

function round(val) {
  var precision = 2;
  var power = Math.pow(10, precision);
  var val = parseFloat(val);
  return (+(Math.round(val + 'e' + precision) / power).toFixed(precision)).toString();
}
