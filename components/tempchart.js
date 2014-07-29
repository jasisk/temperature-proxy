var d3 = require('d3');

module.exports = function go(container, opts) {
  return function createChart(entries) {
    opts || (opts = {});

    return makeGraph(entries);

    function prepEntries(entries) {
      return entries.map(function (entry) {
        return {
          date: new Date(entry.ts),
          temperature: +entry.temperature
        };
      });
    }

    function makeGraph(data) {
      var totalWidth = opts.width || 300;
      var totalHeight = opts.height || 100;

      var margin = {top: 20, right: 20, bottom: 30, left: 30};

      var width = totalWidth - margin.left - margin.right;
      var height = totalHeight - margin.top - margin.bottom;

      var entries = prepEntries(data);

      var transformation = 'translate(' + margin.left + ', ' + margin.top + ')';

      var colorScale = d3.scale.linear()
            .domain([63, 68, 74, 80])
            .range(['#068A91', '#6CFA6C', '#6CFA6C', '#E34646'])
            .clamp(true);

      var svg = container.append('svg')
            .attr('xmlns', 'http://www.w3.org/2000/svg')
            .attr('width', totalWidth)
            .attr('height', totalHeight)
          .append('g')
            .attr('transform', transformation);

      var x = d3.time.scale()
            .domain(d3.extent(entries, function (d) { return d.date; }))
            .range([0, width]);

      var yTicks = 4;
      var yRange = d3.extent(entries, function (d) { return d.temperature; });

      if (yRange[1] - yRange[0] < 2) {
        yRange[1] = Math.ceil(yRange[1]);
        yRange[0] = Math.floor(yRange[0]);
        yTicks = 2;
      }

      var y = d3.scale.linear()
            .domain(yRange)
            .range([height, 0]).nice();

      var grid = svg.append('g')
            .classed('grid', true);

      var xAxis = d3.svg.axis().scale(x)
            .tickSize(5).ticks(d3.time.minutes, 60).orient('bottom')
            .tickFormat(function (d) {
              return d3.time.format('%H:%M')(d).replace(/\s/, '').replace(/^0/, '');
            });

      var xAxisGrid = d3.svg.axis().scale(x)
            .tickSize(height).ticks(d3.time.minutes, 60).orient('top')
            .tickFormat('');

      var xax = svg.append('g')
            .classed('x axis', true)
            .attr('transform', 'translate(0, ' + (height) + ')')
          .call(xAxis)
          .selectAll('.tick')
            .data(x.ticks(4), function (d) { return d; })
          .exit()
            .classed('minor', true);

      grid.append('g')
        .classed('x', true)
        .attr('transform', 'translate(0, ' + (height) + ')')
        .call(xAxisGrid)
      .selectAll('.tick')
        .data(x.ticks(4), function (d) { return d; })
      .exit()
        .classed('minor', true);

      var yAxis = d3.svg.axis().scale(y).orient('left')
            .tickPadding(5).tickSize(5).ticks(yTicks).tickFormat(function (d) {
              return d;
            });

      var yAxisGrid = d3.svg.axis().scale(y)
            .tickSize(width, 0).ticks(yTicks).orient('right')
            .tickFormat('');

      var yax = svg.append('g')
            .classed('y axis', true)
          .call(yAxis);

      grid.append('g')
        .classed('y', true)
        .call(yAxisGrid);

      var line = d3.svg.line()
            .x(function (d) { return x(d.date); })
            .y(function (d) { return y(d.temperature); })
            .interpolate('basis');

      svg.append("linearGradient")
            .attr("id", "line-gradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", 0)
            .attr("x2", 0).attr("y2", height)
        .selectAll("stop")
            .data([
                {offset: "0%", color: colorScale(y.domain()[1])},
                {offset: "100%", color: colorScale(y.domain()[0])}
            ])
        .enter().append("stop")
            .attr("offset", function(d) { return d.offset; })
            .attr("stop-color", function(d) { return d.color; });

      var path = svg.append('path')
            .attr('d', line(entries))
            .classed('path', true);

      if (opts.animate) { path.call(transition); }

      if (opts.cb && !opts.animate) { opts.cb(); }

      function transition(path) {
        path.transition()
            .duration(2000)
            .attrTween("stroke-dasharray", tweenDash)
            .each('end', function () { if (opts.cb) { opts.cb(); } });
      }

      function tweenDash() {
        var l = this.getTotalLength(),
            i = d3.interpolateString("0," + l, l + "," + l);
        return function(t) { return i(t); };
      }

      return svg;
    }
  };
};
