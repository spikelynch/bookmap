
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

TLISTS = [
    { label: "atomic", file: "atomic.js" },
    { label: "random 200", file: "200" },
    { label: "random 1000", file: "1000" },
];

WORD_JITTER = 1;
EXTRA_JITTER = 0.02;
JITTER = 10;




function setup_lists(form, chart_fn, testing) {

    var dd = form.append("select").attr("id", "listmenu");
    var lists = testing ? TLISTS : LISTS;
    var options = dd
        .selectAll('option')
        .data(lists).enter()
        .append('option')
        .attr('value', function (d) { return d.file; })
        .text(function(d) { return d.label; });

    var input = form.append("input")
        .attr("value", "Render")
        .attr("type", "button")
        .on("click", render);

    callbacks = render();

    function render() {
        var cbs = null;
        var option = dd.property("value");
        if( option.slice(-3) == '.js' ) {
            if( testing ) {
                var booklist = STATIC.map(book2node);
                cbs = chart_fn(booklist);
                status("Loaded " + booklist.length + " books");
            } else {
                d3.json("./Lists/" + option)
                    .on("progress", function () { status("Loading...") })
                    .on("load", function(books) {
                        var booklist = books.map(book2node);
                        cbs = chart_fn(booklist);
                        status("Loaded " + books.length + " books");
                    })
                    .on("error", function(error) {
                        status("Error: ", error);
                    }).get();
            }
        } else {
            var n = parseInt(option);
            if( n ) {
                var booklist = d3.range(n).map(function(i) {
                    return book2node({ "dd": Math.random() * 1000, "title": "" });
                });
                cbs = chart_fn(booklist);
            }
        }
        return cbs;
    }

    return callbacks;
}

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
    return {
        "x": coords[0],
        "y": coords[1],
        "colour": jd,
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

function jitter(dewey) {
    return dewey + ( Math.random() - 0.5 ) * JITTER;
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
