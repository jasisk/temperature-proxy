var Writable = require('stream').Writable;
var extend = require('util')._extend;

function writeStream(inst) {
  var stream = new Writable({ objectMode: true });
  stream._write = function (chunk, encoding, cb) {
    inst.set(chunk);
    cb();
  };
  return stream;
};

function Temperature() {
  if (!(this instanceof Temperature)) return new Temperature();
  this.stream = writeStream(this);
  Object.defineProperties(this, {
    stash: {
      writable: true,
      value: {
        data: null,
        unit: 'fahrenheit',
        ts: null,
        last_event_ts: null
      }
    },
    stream: {
      value: writeStream(this)
    }
  });
}

Temperature.prototype.set = function (obj) {
  extend(this.stash, obj);
  if (obj.updated_at != null) {
    this.stash.last_updated_at = obj.updated_at;
  }
};

Temperature.prototype.get = function () {
  return {
    temperature: this.stash.data,
    unit: this.stash.unit,
    ts: this.stash.updated_at,
    last_event_ts: this.stash.last_updated_at
  };
};

Temperature.prototype.handler = function (ts) {
  this.set({last_updated_at: ts});
};

module.exports = Temperature;
