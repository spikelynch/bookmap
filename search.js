// Library lookups


//SEARCH_URL = "/bookmap" //local proxy to UTS libray catalogue search

SEARCH_URL = "http://localhost:8000"
PAGE = 25

var results = [];

var DD_RE = /^(\d+\.\d+)/;


function do_search() {
    query = $("#query").val();
    
    results = [];
    $("#searchresults").empty();
    get_results(query, 0);

}

// this should take a callback as argument which updates a progress indicator
// and despatches sets of results to the visualisation

function get_results(query, offset) {
    var url = SEARCH_URL + "?q=" + query + "&limit=" + PAGE + "&offset=" + offset;
    d3.json(url, function(error, json) {
        if( error ) {
            return { error: error };
        }
        docset = json.data.documentSet;
        console.log("Got " + docset.length + " results...");
        handle_docs(docset.docs);
        if( offset + PAGE < docset.totalHits ) {
            get_results(query, offset + PAGE);
        } else {
            console.log("Done");
        }
    });
}




function handle_docs(docs) {
    for( var i = 0; i < docs.length; i++ ) {
        doc = docs[i];
        if( is_book(doc) ) {
            var r = doc.record;
            var dd, title, authors;
            dd_s = get_p(r, "p_CallNumber");
            dd = parse_dd(dd_s);
            if( dd ) {
                title = get_p(r, "p_Title");
                authors = get_p(r, "p_TitleResponsibility");
                results.push({
                    dd: dd,
                    title: title,
                    authors: authors
                });
                d3.select('#searchresults').append('div')
                    .attr('class', 'search')
                    .append('div')
                    .text(title);
            }
        }
    }
}



function is_book(doc) {
    //console.log(doc);
    for( var i = 0; i < doc.dimensions.length; i++ ) {
        var d = doc.dimensions[i];
        if ( d.name == "Type" ) {
            if( d.values[0].name == "Book" ) {
                return true;
            }
        }
    }
    return false;
}


function get_p(rec, property) {
    if( property in rec ) {
        return rec[property][0];
    } else {
        return undefined;
    }
}

function parse_dd(dds) {
    var rs = DD_RE.exec(dds);
    if( rs ) {
        fl = parseFloat(rs[0]);
        return fl;
    }
    return false;
}

