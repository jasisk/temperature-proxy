var Transform = require('stream').Transform;
var level = require('level');
var path = require('path');

var opts = {valueEncoding: 'json'};

var dbPath = path.join(__dirname, '..', 'history.db');
var db = level(dbPath, opts);

function logStream(stream) {
  var transform = new Transform({ objectMode: true });
  applyHandler(transform);
  if (stream) {
    stream.pipe(transform);
  }
  return transform;
}

function applyHandler(stream) {
  stream._transform = function (chunk, encoding, cb) {
    var ts = chunk.updated_at;
    db.put(ts, chunk.data, function (err) {
      stream.push(chunk);
      cb(err);
    });
  };
}

module.exports = logStream;
module.exports.db = db;
