var Transform = require('stream').Transform;
var level = require('level');
var path = require('path');

var opts = {valueEncoding: 'json'};

var dbPath = path.join(__dirname, '..', 'history.db');
var db = level(dbPath, opts);

var latestOpts = { valueEncoding: 'utf8' };
var latestKey = '!LATEST';

function logStream(stream) {
  var transform = new Transform({ objectMode: true });
  applyHandler(transform);
  if (stream) {
    stream.pipe(transform);
  }
  return transform;
}

function setLatest(db, ts, cb) {
  db.put(latestKey, ts, latestOpts, cb);
}

function getLatest(cb) {
  db.get(latestKey, latestOpts, function (err, ts) {
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
    db.put(ts, chunk.data, function (err) {
      stream.push(chunk);
      if (err) {
        cb(err);
      } else {
        setLatest(db, ts, cb);
      }
    });
  };
}

module.exports = logStream;
module.exports.db = db;
module.exports.getLatest = getLatest;
