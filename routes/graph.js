var readGen = require('../lib/read');
var chart = require('../app/graph');

module.exports = function (db) {
  var read = readGen(db);
  return {
    handler: function (request, reply) {
      read(function (err, collection) {
        chart(collection);
        reply.view('graph', {graph: chart.toString()});
      });
    }
  };
};
