// var stream = require('./test/fixtures/eventsource')();
var temperature = require('./lib/temperature')();
var filterGen = require('./lib/filter');
var stream = require('./lib/stream');
var database = require('./lib/db');
var pipe = require('./lib/pipe');
var routes = require('./routes');
var assert = require('assert');
var hapi = require('hapi');
var http = require('http');
var url = require('url');
var db = database();

var port = process.env.PORT || 8000;
var server;

database.getLatest(function (err, initial) {
  var setTemp, filter;

  temperature.set({data: initial.temperature, published_at: initial.ts});
  initial.temperature !== '??.??' && (setTemp = initial.temperature);

  filter = filterGen(setTemp);

  pipe([stream, filter, db, temperature.stream]);
  filter.on('suppressed', temperature.handler.bind(temperature));

  server.start(function () {
    console.log('Server started at: ' + server.info.uri);
  });
});

server = hapi.createServer('localhost', port, {cors: true});

server.route([
  { method: 'GET', path: '/',        config: routes.latest(temperature) },
  { method: 'GET', path: '/history', config: routes.history(database.db) }
]);
