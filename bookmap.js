
ZOOM_EXTENT = [ 0.25, 80 ];


WORD_JITTER = 1;
EXTRA_JITTER = 0.02;
JITTER = 10;
RADIUS = 2;
CHARGE = 100;

function jitter(dewey) {
    return dewey + ( Math.random() - 0.5 ) * JITTER;
}

WIDTH = 600;
HEIGHT = 600;

VORO_EXTENT = [[-WIDTH, -HEIGHT], [2 * WIDTH, 2 * HEIGHT]];


// global var where the dynamic bookmap puts control callbacks

var bookmap_controls = {};

function book2node_old(b) {
    coords = hbookmap(b.dd * 0.001);
    hue = 360 * b.dd * 0.001;
    cell_c = d3.hsl(hue, .75, 0.7).toString();
    node_c = d3.hsl(hue, .8, .8).toString();
    return {
        "x": jitter(coords[0]), "y": jitter(coords[1]),
        "cell_c": cell_c,
        "node_c": node_c,
        "label": b.dd + " " + b.title,
        "dewey": b.dd
    };
}


function book2node(b) {
    // - go through the list
    // - for each dewey number with more than one title, count how many 
    //   are on that number, and find the next dewey number
    // - take the title (and author) and map them to a distribution between
    //   the lower and upper bounds, and then use that value as the 1-d coord
    var textkey = book2key(b);
    var jd = b.dd + WORD_JITTER * words2float(textkey);
    coords = hbookmap(jd * 0.001);
    hue = 360 * jd * 0.001;
    cell_c = d3.hsl(hue, .75, 0.7).toString();
    node_c = d3.hsl(hue, .8, .25).toString();
    return {
        "x": coords[0], "y": coords[1],
        "cell_c": cell_c,
        "node_c": node_c,
        "label": b.dd + " " + b.title,
        "textkey": textkey,
        "dewey": b.dd
    };
}


// Alternative to the original jitter - turns a string into a float

function words2float(s) {
    var n = 0;
    for( var i = 0, il = s.length; i < il; i++ ) {
        var a = s.charCodeAt(i);
        if( a > 64 && a < 91 ) {
            a -= 64;
        } else if( a > 96 && a < 123 ) {
            a -= 96;
        } else {
            a = 0;
        }
        n += a / Math.pow(26, i + 1);
    }
    return n - EXTRA_JITTER + 2 * EXTRA_JITTER * Math.random();
}

function book2key(b) {
    if( b.authors ) {
        return b.authors + " " + b.title;
    } else {
        return b.title;
    }
}


function bookmap_static(books) {
    d3.select("#chartsvg").remove();

    var cdiv = d3.select("#chart");
    
    var svg = cdiv.append("svg")
        .attr("id", "chartsvg")
        .attr("width", WIDTH)
        .attr("height", HEIGHT);
   
    var voronoi = d3.voronoi()
        .extent(VORO_EXTENT)
        .x(function (d) { return d.x } )
        .y(function (d) { return d.y } );

    var chart = svg.append("g")
    
    var polygon = chart.append("g")
        .attr("class", "polygons")
        .selectAll("path")
        .data(voronoi.polygons(books));

    var links = chart.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(voronoi.links(books));

    polygon.enter()
        .append("path")
        .attr("class", "cell")
        .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
        .attr("fill", function(d) { return d ? ( d.data ? d.data.cell_c : null ) : null;})
        .append("title")
        .text(function(d) { return d ? ( d.data ? d.data.label : "" ) :"" });

    
    links.enter()
        .append("line")
        .attr("class", "link")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });


    add_zoom(svg, chart);

}


    


function bookmap_dynamic (books) {
    d3.select("#chartsvg").remove();

    var cdiv = d3.select("#chart");

    var svg = cdiv.append("svg")
        .attr("id", "chartsvg")
        .attr("width", WIDTH)
        .attr("height", HEIGHT);


    var voronoi_start = d3.voronoi()
        .extent(VORO_EXTENT)
        .x(function (d) { return d.x } )
        .y(function (d) { return d.y } );
    
    vpolygons = voronoi_start.polygons(books);
    vlinks = voronoi_start.links(books);



    var simulation = d3.forceSimulation()
        .force("links", d3.forceLink().iterations(1))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2));

    simulation.velocityDecay(0.1);
    simulation.nodes(books);
    simulation.force("links").links(vlinks);
    simulation.force("charge").strength(-CHARGE / books.length);


    // make a new voronoi to track the animation of the nodes
    // (the first one was just to get the delaunay links)

    var voronoi = d3.voronoi()
        .extent(VORO_EXTENT)
        .x(function (d) { return d.x } )
        .y(function (d) { return d.y } );

    var chart = svg.append("g");
    
    var voronoiGroup = chart.append("g")
        .attr("class", "voronoi");


    var polygons = chart.append("g")
        .attr("class", "polygons")
        .selectAll("path")
        .data(voronoi(simulation.nodes()).polygons())
        .enter()
        .append("path")
        .attr("class", "cell")
        .attr("fill", function(d) {  return d ? ( d.data ? d.data.cell_c : "#fff" ) : "#fff"; });
    

    polygons.append("title")
        .text(function(d) { return d ? ( d.data ? d.data.label : "" ) :"" });
    
    var links = chart.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(voronoi.links(books)).enter()
        .append("line")
        .attr("class", "link");
    

    var nodes = chart.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(simulation.nodes()).enter()
        .append("circle")
        .attr("class", "node")
        .attr("fill", function (d) { return d.node_c; })
        .attr("r", RADIUS);


    polygons.call(d3.drag()
                  .on("start", dragstarted)
                  .on("drag", dragged)
                  .on("end", dragended));

    add_zoom(svg, chart);


    // callbacks to be driven by the controls
    
    bookmap_controls.charge = function (charge) {
        console.log("Setting charge to " + charge);
        simulation.force("charge").strength(-charge);
    };

    bookmap_controls.alpha = function (alpha) {
        console.log("Setting alpha to " + alpha);
        simulation.alphaDecay(alpha);
        simulation.restart();
    };

    bookmap_controls.velocity = function (velocity) {
        console.log("Setting velocity to " + velocity);
        simulation.velocityDecay(velocity);
        simulation.restart();
    };

    
    simulation.on("tick", function () {
        polygons
            .data(voronoi(simulation.nodes()).polygons())
            .attr("d", function(d) { return d ? "M" +d.join("L")
                                     + "Z" : null; });

        links.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
        
        nodes.attr("cx", function(d) { return d.x })
             .attr("cy", function(d) { return d.y });

    });


    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(.03).restart();
        d.data.fx = d.data.x;
        d.data.fy = d.data.y;
    }
    
    function dragged(d) {
        d.data.fx = d3.event.x;
        d.data.fy = d3.event.y;
    }
    
    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(.03);
        d.data.fx = null;
        d.data.fy = null;
    }

}


// an invisible rect over the svg with a zoom behaviour
// from https://bl.ocks.org/mbostock/4e3925cdc804db257a86fdef3a032a45


function add_zoom(svg, chart) {
    svg.call(d3.zoom()
             .scaleExtent(ZOOM_EXTENT)
             .on("zoom", function () {
                 chart.attr("transform", d3.event.transform)
             }
                ));
    // svg.append("rect")
    //     .attr("width", WIDTH)
    //     .attr("height", HEIGHT)
    //     .style("fill", "none")
    //     .style("pointer-events", "all")
    //     .call(d3.zoom()
    //           .scaleExtent(ZOOM_EXTENT)
    //           .on("zoom", function () {
    //               console.log("Zoom" + d3.event.transform);
    //               chart.attr("transform", d3.event.transform)
    //           }
    //              ));
}
    
