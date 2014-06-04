module.exports = function pipeChain(streams) {
  var count = streams.length;
  if (!count || typeof count !== 'number') { return; }
  if (count === 1) { return streams; }
  var last = --count, output, input = streams[last];
  while(count--) {
    output = streams[count];
    output.pipe(input);
    input = output;
  }
  return streams[last];
};
