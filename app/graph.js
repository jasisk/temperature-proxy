var d3 = require('d3');
var chart = require('../components/tempchart');

var container = d3.select('body');
var historyChart = chart(container, {width: 300, height: 100});

module.exports = historyChart;
module.exports.toString = function () {
  return d3.select('body').html();
};
