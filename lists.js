
LISTS = [
    { label: "football (original)", file: "football1.js" },
    { label: "football (search)", file: "football2.js" },
    { label: "atomic", file: "atomic.js" },
    { label: "bacteria", file: "bacteria.js" },
    { label: "elephants", file: "elephants.js" }
//    { label: "architecture (warning: HUGE)", file: "architecture.js" }
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

    function render() {
        var option = dd.property("value");
        console.log("Load", option);
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
    }
    
}


function status(s) {
    d3.select("#status").text(s);
    console.log(s);
}
