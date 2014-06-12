var readGen = require('../lib/read');
var joi = require('joi');

module.exports = function (db) {
    var read = readGen(db);
    return {
      handler: function (request, reply) {
        read(function (err, collection) {
          reply(collection);
        }, request.query.hours);
      },
      validate: {
        query: {
          hours: joi.number().integer().min(1)
        }
      }
    };
};
