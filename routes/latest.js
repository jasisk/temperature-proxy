module.exports = function (temperature) {
  return {
    handler: function (request, reply) {
      reply(temperature.get());
    }
  };
};
