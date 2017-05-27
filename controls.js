
// Adapted from https://bl.ocks.org/mbostock/6452972

var MARGIN = { right: 10, left: 10, top: 20, label: 40 };
var SIZE = { width: 400, height: 160 };
var YSPACE = 40;

var CWIDTH = SIZE.width - MARGIN.right - MARGIN.left;

function make_select(cont, data, callback) {
    var select = cont.append('select')
        .attr('class', 'select')
        .on('change', function() { callback(this.value) });
    var options = select
        .selectAll('option')
        .data(data).enter()
        .append('option')
        .text(function (d) { return d });
}


function make_slider(svg, i, label, domain, init, callback) {

    var x = d3.scaleLinear()
        .domain(domain)
        .range([0, CWIDTH])
        .clamp(true);

    var x0 = MARGIN.left;
    var y0 = MARGIN.top + i * YSPACE;

    var sg = svg.append("g")
        .attr("class", "slidergroup")
        .attr("transform", "translate(" + x0 + "," + y0 + ")");

    sg.append("text")
        .attr("class", "slider")
        .attr("x", 0)
        .attr("y", 0)
        .text(label);

    var slider = sg.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + MARGIN.label + ",0)");

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

    var initx = x(init);
    var handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("cx", initx)
        .attr("r", 9);

    function dragme(v) {
        handle.attr("cx", x(v));
        callback(v);
    }

}
