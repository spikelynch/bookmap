
CUTOFF = 0;

PATH = [ [0, 0], [0, 1], [1, 1], [1, 0 ] ];   





function hilbert(i, max, order, side) {
    n = Math.pow(4, order);
    d1 = Math.floor(n * i / max);
    coords = _hilbert(d1, order);
    scale = side / Math.pow(2, order + 1);
    return [ coords[0] * scale, coords[1] * scale ];
}


function _hilbert(i, order) {
    p = PATH.slice(0);
    return hilbert_r(i, order, 0, 0, p);
}


// i:      number we are converting to x, y
// o:      order of curve we are searching
// x0, y0: origin of current square
// path:   [ [ x1, y1 ], ] of unit points on this path

function hilbert_r(i, o, x0, y0, path) {
    if( o <= CUTOFF ) {
        return [ x0, y0 ];
    }
    side = Math.pow(2, o);
    n = side * side;
    seg = n / 4;
    s = Math.floor(i / seg);
    //console.log(o, n, i, seg, s, path);
    x = x0 + path[s][0] * side;
    y = y0 + path[s][1] * side;
    
    // flip/rotate path if needed
    if( s == 0 ) {
        p1 = path[1];
        path[1] = path[3];
        path[3] = p1;
    } else if ( s == 3 ) {
        p0 = path[0];
        path[0] = path[2];
        path[2] = p0;
    }
    
    return hilbert_r(i - s * seg, o - 1, x, y, path);
}


function hilbert_test(n) {
    r = []
    for ( var i = 0; i < n; i++ ) {
        //d = Math.floor(Math.random() * 1024);
        coords = hilbert_r(i, 5, 0, 0, PATH);
        console.log(i, coords);
    }
//    console.log(r);
 //   return r;
}
