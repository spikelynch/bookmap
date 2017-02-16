
JITTER = 10;

function jitter(dewey) {
    return dewey + ( Math.random() - 0.5 ) * JITTER;
}

width = 600;


var booklist = BOOKS.map(function (b) {
//    coords = hilbert(b.dd, 1000, 8, width);
    coords = hbookmap(b.dd);
    c = d3.hsl(360 * b.dd * 0.001, 1, 0.76).toString();
    return {
        "x": jitter(coords[0]), "y": jitter(coords[1]),
        "c": c,
        "label": b.dd + " " + b.title,
        "dewey": b.dd
    };
});


var bookrnd = d3.range(200).map(function (b) {
    d = Math.random() * 1000;
    coords = hbookmap(d);
    c = d3.hsl(360 * d * 0.001, 1, 0.76).toString();
    return {
        "x": jitter(coords[0]), "y": jitter(coords[1]),
        "c": c,
        "label": d,
        "dewey": d
    };
});    


function bookmap_static(books) {
    var svg = d3.select("body").append("svg")
        .attr("id", "chart")
        .attr("width", width)
        .attr("height", width);

   
    var voronoi = d3.voronoi()
        .extent([[-1, -1], [width + 1, width + 1]])
        .x(function (d) { return d.x } )
        .y(function (d) { return d.y } );

    var polygon = svg.append("g")
        .attr("class", "polygons")
        .selectAll("path")
        .data(voronoi.polygons(books));

    var links = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(voronoi.links(books));

    polygon.enter()
        .append("path")
        .attr("class", "cell")
        .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
        .attr("fill", function(d) { return d ? ( d.data ? d.data.c : null ) : null;})
        .append("title")
        .text(function(d) { return d ? ( d.data ? d.data.label : "" ) :"" });

    
    links.enter()
        .append("line")
        .attr("class", "link")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
}


function bookmap_dynamic (books) {

    var svg = d3.select("body").append("svg")
        .attr("id", "chart")
        .attr("width", width)
        .attr("height", width);


    var voronoi_start = d3.voronoi()
        .extent([[-1, -1], [width + 1, width + 1]])
        .x(function (d) { return d.x } )
        .y(function (d) { return d.y } );
    
    vpolygons = voronoi_start.polygons(books);
    vlinks = voronoi_start.links(books);



    var simulation = d3.forceSimulation()
        .force("links", d3.forceLink().iterations(5))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, width / 2));

    simulation.velocityDecay(0.1);
    simulation.nodes(books);
    simulation.force("links").links(vlinks);
    simulation.force("charge").strength(-4);


    // make a new voronoi to track the animation of the nodes
    // (the first one was just to get the delaunay links)

    var voronoi = d3.voronoi()
        .extent([[-1, -1], [width + 1, width + 1]])
        .x(function (d) { return d.x } )
        .y(function (d) { return d.y } );

    var voronoiGroup = svg.append("g")
        .attr("class", "voronoi");


    var polygons = svg.append("g")
        .attr("class", "polygons")
        .selectAll("path")
        .data(voronoi(simulation.nodes()).polygons())
        .enter()
        .append("path")
        .attr("class", "cell")
        .attr("fill", function(d) {  return d ? ( d.data ? d.data.c : "#fff" ) : "#fff"; });
    

    polygons.append("title")
        .text(function(d) { return d ? ( d.data ? d.data.label : "" ) :"" });
    
    var links = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(voronoi.links(books)).enter()
        .append("line")
        .attr("class", "link");
    

    var nodes = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(simulation.nodes()).enter()
        .append("circle")
        .attr("class", "node")
        .attr("r", 3)
        .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));



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
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }
    
    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(.03);
        d.fx = null;
        d.fy = null;
    }
    
}
