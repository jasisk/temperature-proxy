var Readable = require('stream').Readable;
var events = require('./events');

var proto = {
  fireEvent: function () {
    this.idx = (this.idx + 1) % events.length;
    var evt = events[this.idx];

    this.stream.push(evt);
  }
};

module.exports = function createStream() {
  var stream = new Readable({ objectMode: true });
  stream._read = function () {};

  return Object.create(proto, {
    idx: {
      value: events.length - 1,
      writable: true
    },
    stream: {
      value: stream
    },
    latest: {
      get: function () {
        return events[this.idx];
      }
    }
  });
};
