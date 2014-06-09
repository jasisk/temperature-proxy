var Transform = require('stream').Transform;
var level = require('level');
var path = require('path');

var opts = {valueEncoding: 'utf8'};

var dbPath = path.join(__dirname, '..', 'history.db');
var db = level(dbPath, opts);

var latestKey = '!LATEST';

function logStream(stream) {
  var transform = new Transform({ objectMode: true });
  applyHandler(transform);
  if (stream) {
    stream.pipe(transform);
  }
  return transform;
}

function getLatest(cb) {
  db.get(latestKey, function (err, ts) {
    if (err) {
      if (err.notFound) {
        return cb(null, {temperature: '??.??', ts: new Date().toISOString()});
      } else {
        return cb(err);
      }
    }
    db.get(ts, function (err, temperature) {
      if (err) { return cb(err); }
      cb(null, {ts: ts, temperature: temperature});
    });
  });
}

function applyHandler(stream) {
  stream._transform = function (chunk, encoding, cb) {
    var ts = chunk.published_at;
    var temperature = chunk.data;
    var ops = [
      { type: 'put', key: ts, value: temperature },
      { type: 'put', key: latestKey, value: ts }
    ];
    db.batch(ops, function (err) {
      stream.push(chunk);
      cb(err);
    });
  };
}

module.exports = logStream;
module.exports.db = db;
module.exports.getLatest = getLatest;
