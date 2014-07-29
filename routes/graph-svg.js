var readGen = require('../lib/read');
var chart = require('../app/graph');

module.exports = function (db) {
  var read = readGen(db);
  return {
    handler: function (request, reply) {
      read(function (err, collection) {
        reply('<?xml-stylesheet type="text/css" href="http://temp.sisk.io/static/css/graph.css" ?>\n' + chart(collection))
          .type('image/svg+xml');
      });
    }
  };
};
