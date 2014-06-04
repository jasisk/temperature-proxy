module.exports = function round(val) {
  var precision = 2;
  var power = Math.pow(10, precision);
  var val = parseFloat(val);
  return (+(Math.round(val + 'e' + precision) / power).toFixed(precision)).toString();
}
