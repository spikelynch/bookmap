// Node script to fetch a search from the library catalogue

var request = require('request');

var SEARCH_URL = "http://discovery.lib.uts.edu.au/discovery/endeca";

var PAGE = 25;

var books = [];

var DD_RE = /^(\d+\.\d+)/;

var args = process.argv.slice(2);

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
                books.push({
                    dd: dd,
                    title: title,
                    authors: authors
                });
            }
        }
    }
}


function print_results() {
    console.log(JSON.stringify(books, null, 4));
}

function get_results(query, offset) {
    var url = SEARCH_URL + "?q=" + query + "&limit=" + PAGE + "&offset=" + offset;

    request.get(url, function(error, response, body) {
//        console.log(url);
        if( response && response.statusCode == "200" ) {
            json = JSON.parse(body);
            docset = json.data.documentSet;
            handle_docs(docset.docs);
            if( offset + PAGE < docset.totalHits ) {
                console.warn(offset + " of " + docset.totalHits);
                get_results(query, offset + PAGE);
            } else {
                print_results();
            }
        } else {
//            console.log("Status = " + r.statusCode);
        }
    });
}


get_results(args[0], 0);
