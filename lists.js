
LISTS = [
    { label: "football", file: "football1.js" },
    { label: "football 2", file: "football2.js" },
    { label: "atomic", file: "atomic.js" },
    { label: "bacteria", file: "bacteria.js" },
    { label: "elephants", file: "elephants.js" },
    { label: "quantum", file: "quantum.js" },
    { label: "architecture (warning: HUGE)", file: "architecture.js" },
    { label: "random 200", file: "200" },
    { label: "random 1000", file: "1000" },
];


function setup_lists(chart_fn) {
    
    var dd = d3.select("form").append("select").attr("id", "listmenu");
    var options = dd
        .selectAll('option')
        .data(LISTS).enter()
        .append('option')
        .attr('value', function (d) { return d.file; })
        .text(function(d) { return d.label; });

    var input = d3.select("form")
        .append("input")
        .attr("value", "Render")
        .attr("type", "button")
        .on("click", render);

    render();
    
    function render() {
        var option = dd.property("value");
        if( option.slice(-3) == '.js' ) {
            d3.json("./Lists/" + option)
                .on("progress", function () { status("Loading...") })
                .on("load", function(books) {
                    var booklist = books.map(book2node);
                    chart_fn(booklist);
                    status("Loaded " + books.length + " books");
                })
                .on("error", function(error) {
                    status("Error: ", error);
                }).get();
        } else {
            var n = parseInt(option);
            if( n ) {
                var booklist = d3.range(n).map(function(i) {
                    return book2node({ "dd": Math.random(), "title": "" });
                });
                chart_fn(booklist);
            }
        }
    }
    
}


// "lost marbles"
var bookrnd3 = d3.range(200).map(function(i) {
    return book2node({ "dd": (Math.random() + Math.random() ), "title": "" });
});

var bookrnd2 = d3.range(200).map(function(i) {
    return book2node({ "dd": (Math.random() + Math.random() ) * .5, "title": "" });
});



function status(s) {
    d3.select("#status").text(s);
    console.log(s);
}
