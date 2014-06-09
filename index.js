// var stream = require('./test/fixtures/eventsource')();
var temperature = require('./lib/temperature')();
var filter = require('./lib/filter')();
var stream = require('./lib/stream');
var database = require('./lib/db');
var pipe = require('./lib/pipe');
var assert = require('assert');
var http = require('http');
var url = require('url');
var db = database();

var read = require('./lib/read')(database.db);

var port = process.env.PORT || 8000;
var server;

database.getLatest(function (err, initial) {
  temperature.set({data: initial.temperature, published_at: initial.ts});
});

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
  } else if (parts.pathname === '/history') {
    var hours;
    if (parts.query && (hours = parts.query.hours)) {
      hours = parseInt(hours, 10);
      if (isNaN(hours) || hours < 1) {
        hours = null;
      }
    }
    read(function (err, collection) {
      var stringified = JSON.stringify(collection, null, 4);

      res.writeHead(200, {
        'content-type': 'application/json',
        'content-length': stringified.length
      });

      res.end(stringified);
    }, hours);
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
