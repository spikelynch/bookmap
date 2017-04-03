
var CUTOFF = 0;

var PATH = [ [0, 0], [0, 1], [1, 1], [1, 0 ] ];   

var ORDER;
var SCALE_1D;
var SCALE_2D;

function hilbert_init(o, size) {
    ORDER = o;
    SCALE_1D = Math.pow(4, ORDER);
    SCALE_2D = size / Math.pow(2, ORDER);
}

function hbookmap(i) {
    var v = i * SCALE_1D;
    var scoords = _hilbert(v, ORDER);
    var coords = scoords.map(function (x) { return x * SCALE_2D / 2 });
//    console.log(v, scoords, coords);
    return coords;
}

function hbookmap2(i) {
    var scoords = _hilbert(i, ORDER);
    var coords = scoords.map(function (x) { return x * SCALE_2D / 2 });
    return coords;
}


// This version is broken, but quite beautifully

function hilbert(i, max, order, side) {
    n = Math.pow(4, order);
    d1 = Math.floor(n * i / max);
    coords = _hilbert(d1, order);
    scale = side / Math.pow(2, order + 1);
    return [ coords[0] * scale, coords[1] * scale ];
}


function _hilbert(i, order) {
    p = PATH.slice(0);
    return hilbert_r(i, order, 0, 0, p);
}





// i:      number we are converting to x, y
// o:      order of curve we are searching
// x0, y0: origin of current square
// path:   [ [ x1, y1 ], ] of unit points on this path

function hilbert_r(i, o, x0, y0, path) {
    if( o <= CUTOFF ) {
        return [ x0, y0 ];
    }
    side = Math.pow(2, o);
    n = side * side;
    seg = n / 4;
    s = Math.floor(i / seg);
    if( s < 0 ) {
        s = 0;
    }
    if( s > 3 ) {
        s = 3;
    }
    x = x0 + path[s][0] * side;
    y = y0 + path[s][1] * side;
    
    // flip/rotate path if needed
    if( s == 0 ) {
        p1 = path[1];
        path[1] = path[3];
        path[3] = p1;
    } else if ( s == 3 ) {
        p0 = path[0];
        path[0] = path[2];
        path[2] = p0;
    }
    
    return hilbert_r(i - s * seg, o - 1, x, y, path);
}




function hcolour(dd) {
    console.log(360 * dd);
    return d3.hsl(360 * dd, 1, 0.5).toString();
}


function hilbert_demo(order) {
    var width = 1000;

    var svg = d3.select("body").append("svg")
        .attr("id", "chart")
        .attr("width", width * 2)
        .attr("height", width * 2);

    hilbert_init(12, width);
    
    var h = SCALE_1D;
    var cw = 10;

    for( var i = 0; i < 1000; i += 1 ) {
        var p = Math.random();
        var coords = hbookmap2(p * h);
        var c = hcolour(p);
        svg.append("rect")
            .attr("class", "demo")
            .attr("fill", c)
            .attr("stroke-width", 0)
            .attr("x", coords[0])
            .attr("y", coords[1])
            .attr("width", cw)
            .attr("height", cw);
        // svg.append("text")
        //     .attr("x", coords[0] + 10)
        //     .attr("y", coords[1] + 16)
        //     .text(i);
    }
}
