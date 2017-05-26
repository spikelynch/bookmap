
ZOOM_EXTENT = [ 0.25, 80 ];


RADIUS = 2;
CHARGE = 100;


WIDTH = 600;
HEIGHT = 600;

VORO_EXTENT = [[-WIDTH, -HEIGHT], [2 * WIDTH, 2 * HEIGHT]];


// global var where the dynamic bookmap puts control callbacks

var bookmap_controls = {};

// global colour parameters

var cell_colour = {
    'hue': 0,
    'saturation': 0.5,
    'luminance': 0.5,
    'mode': 'colour'
}



function cell_fill(d) {
    if( d.data ) {
        s = cell_colour.saturation;
        if( cell_colour.mode == 'grayscale' ) {
            h = cell_colour.hue;
            l = .5 + cell_colour.luminance * d.data.colour * 0.0005;
        } else {
            h = cell_colour.hue + (d.data.colour * 0.36);
            l = cell_colour.luminance;
        }
        return d3.hsl(h, s, l).toString();
    } else {
        return "white"
    }
}


function node_fill(d) {
    if( d.colour ) {
       return d3.hsl(.36 * d.colour, 0, .8, .9).toString();
    } else {
        return "white"
    }
}

function node_size(d) { return d.label.length * 0.076 }


// cell_fill function(d) { return d ? ( d.data ? d.data.cell_c : null ) : null;}



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
        .attr("fill", cell_fill)
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
        .attr("fill", cell_fill);


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
        .attr("fill", function (d) { return node_fill(books[d.index])})
        .attr("r", function (d) { return node_size(books[d.index])});


    polygons.call(d3.drag()
                  .on("start", dragstarted)
                  .on("drag", dragged)
                  .on("end", dragended));

    add_zoom(svg, chart);


    // callbacks to be driven by the controls

    bookmap_controls.cells_hue = function (hue) {
        cell_colour.hue = hue;
        d3.selectAll('path').attr('fill', cell_fill);
    };

    bookmap_controls.cells_sat = function (sat) {
        cell_colour.saturation = sat;
        d3.selectAll('path').attr('fill', cell_fill);
    };

    bookmap_controls.cells_lum = function (lum) {
        cell_colour.luminance = lum;
        d3.selectAll('path').attr('fill', cell_fill);
    };

    simulation.on("tick", function () {
        polygons
            .data(voronoi(simulation.nodes()).polygons())
            .attr("d", function(d) { return d ? "M" +d.join("L")
                                     + "Z" : null; })
                                     ;

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
