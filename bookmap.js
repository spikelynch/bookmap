
RADIUS = 10;




function hilbert() {
  // Adapted from Nick Johnson: http://bit.ly/biWkkq
  var pairs = [
    [[0, 3], [1, 0], [3, 1], [2, 0]],
    [[2, 1], [1, 1], [3, 0], [0, 2]],
    [[2, 2], [3, 3], [1, 2], [0, 1]],
    [[0, 0], [3, 2], [1, 3], [2, 3]]
  ];
  return function(x, y, z) {
    var quad = 0,
        pair,
        i = 0;
    while (--z >= 0) {
      pair = pairs[quad][(x & (1 << z) ? 2 : 0) | (y & (1 << z) ? 1 : 0)];
      i = (i << 2) | pair[0];
      quad = pair[1];
    }
    return i;
  };
})();



function bookmap(books, width, height) {

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);
    
    nodes = BOOKS.map(function(b) {
        b.dd = Math.random() * 1000;
        c1 = d3.hsl(360 * b.dd * 0.001, 0.6, 0.6);
        
        return {
            'title': b.title,
            'x': width / 2,
            'y': height / 2,
            'dd': b.dd,
            'id': b.dd.toString(),
            'color': c1.toString()
        }});



