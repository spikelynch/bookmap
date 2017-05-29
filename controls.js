
// Adapted from https://bl.ocks.org/mbostock/6452972

var MARGIN = { right: 10, left: 10, top: 20, label: 40 };
var SIZE = { width: 360, height: 160 };
var YSPACE = 40;

var CWIDTH = SIZE.width - MARGIN.right - MARGIN.left;

function form_slot(svg, i, label) {
    var x0 = MARGIN.left;
    var y0 = MARGIN.top + i * YSPACE;

    var ff = svg.append("g")
        .attr("class", "formfield")
        .attr("transform", "translate(" + x0 + "," + y0 + ")");

    ff.append("text")
        .attr("class", "label")
        .attr("x", 0)
        .attr("y", 0)
        .text(label);
    return ff;
}


function make_select(svg, i, label, data, callback) {
    var fs = form_slot(svg, i, label);

    var select = fs.append("foreignObject")
        .attr("x", MARGIN.label)
        .attr("y", -20)
        .attr("height", YSPACE)
        .attr("width", 400)
        .attr("requiredExtensions", "http://www.w3.org/1999/xhtml")
        .append("xhtml:body")
        .attr("xmlns", "http://www.w3.org/1999/xhtml")
        .append("form")
        .attr("xmlns", "http://www.w3.org/1999/xhtml")
        .append('select')
        .attr("xmlns", "http://www.w3.org/1999/xhtml")
        .attr('class', 'select')
        .on('change', function() { callback(this.value) });

    var options = select
        .selectAll('option')
        .data(data).enter()
        .append('option')
        .attr("xmlns", "http://www.w3.org/1999/xhtml")
        .text(function (d) { return d });
}


function make_slider(svg, i, label, domain, init, callback) {

    var x = d3.scaleLinear()
        .domain(domain)
        .range([0, CWIDTH])
        .clamp(true);

    var x0 = MARGIN.left;
    var y0 = MARGIN.top + i * YSPACE;

    var fs = form_slot(svg, i, label);

    var slider = fs.append("g")
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
