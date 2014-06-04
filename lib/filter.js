var Transform = require('stream').Transform;

function duplicateFilter(stream) {
  var transform = new Transform({ objectMode: true });
  applyTransform(transform);
  if (stream) {
    stream.pipe(transform);
  }
  return transform;
}

function applyTransform(stream) {
  var previousTemp;
  stream._transform = function (chunk, encoding, cb) {
    var temp = chunk.data;
    if (temp !== previousTemp) {
      stream.push(chunk);
      previousTemp = temp;
    } else {
      stream.emit('suppressed', chunk.published_at);
    }
    cb();
  };
}

module.exports = duplicateFilter;
