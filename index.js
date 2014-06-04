// var stream = require('./test/fixtures/eventsource')();
var temperature = require('./lib/temperature')();
var filter = require('./lib/filter')();
var stream = require('./lib/stream');
var pipe = require('./lib/pipe');
var assert = require('assert');
var db = require('./lib/db')();
var http = require('http');
var url = require('url');

var port = process.env.PORT || 8000;
var server;

pipe([stream, filter, db, temperature.stream]);
filter.on('suppressed', temperature.handler.bind(temperature));

server = http.createServer();
server.on('request', requestHandler);
server.listen(port, function () {
  console.log('Listening on %j', server.address());
});

function requestHandler(req, res) {
  var sendCode = respondWithCode.bind(this, req, res);
  var parts = url.parse(req.url.toLowerCase(), true);

  if (parts.pathname === '/') {
    var obj = JSON.stringify(temperature.get());

    res.writeHead(200, {
      'content-type': 'application/json',
      'content-length': obj.length
    });

    res.end(obj);
  } else {
    return sendCode(404);
  }
};

function respondWithCode(req, res, code) {
  assert(~Object.keys(http.STATUS_CODES).indexOf(code.toString()), 'code not found');
  res.writeHead(code, {
    'content-length': http.STATUS_CODES[code].length,
    'content-type': 'text/plain'
  });
  res.end(http.STATUS_CODES[code]);
}
