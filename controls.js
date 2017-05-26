
// Adapted from https://bl.ocks.org/mbostock/6452972

var MARGIN = { right: 10, left: 10, top: 20 };
var SIZE = { width: 400, height: 160 };
var YSPACE = 40;

var CWIDTH = SIZE.width - MARGIN.right - MARGIN.left;




function make_ctrl(svg, i, domain, callback) {

    var x = d3.scaleLinear()
        .domain(domain)
        .range([0, CWIDTH])
        .clamp(true);

    var x0 = MARGIN.left;
    var y0 = MARGIN.top + i * YSPACE;

    var slider = svg.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + x0 + "," + y0 + ")");

    slider.append("line")
        .attr("class", "track")
        .attr("x1", x.range()[0])
        .attr("x2", x.range()[1])
        .select(function() {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-inset")
        .select(function() {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-overlay")
        .call(d3.drag()
              .on("start.interrupt", function() { slider.interrupt(); })
              .on("start drag", function() { dragme(x.invert(d3.event.x)); }));

    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(x.ticks(10))
        .enter().append("text")
        .attr("x", x)
        .attr("text-anchor", "middle")
        .text(function(d) { return d; });

    var handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);

    function dragme(v) {
        handle.attr("cx", x(v));
        callback(v);
    }

}

// function hue(h) {
//   handle.attr("cx", x(h));
//   svg.style("background-color", d3.hsl(h, 0.8, 0.8));
// }
