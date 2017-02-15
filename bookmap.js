


function bookmap(books, width, height) {

    
    nodes = BOOKS.map(function(b) {
        b.dd = Math.random() * 1000;
        c1 = d3.hsl(360 * b.dd * 0.001, 0.6, 0.6);

        hcoords = hilbert(
        
        return {
            'title': b.title,
            'x': width / 2,
            'y': height / 2,
            'dd': b.dd,
            'id': b.dd.toString(),
            'color': c1.toString()
        }});



