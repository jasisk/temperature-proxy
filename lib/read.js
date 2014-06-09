module.exports = function (db) {
  return function streamFilter(cb, hours) {
    hours || (hours = 24);
    var anHourInMilli = 60 * 60 * 1000;
    var ago = Date.now() - hours * anHourInMilli;
    var agoDate = new Date(ago);
    var agoISO = agoDate.toISOString();
    var stream = db.createReadStream({start: agoISO});
    var collection = [];

    stream.on('data', function (entry) {
        collection.push({
          ts: entry.key,
          temperature: entry.value
        });
    });

    stream.on('end', function () {
      cb(null, collection);
    });
  };
};
