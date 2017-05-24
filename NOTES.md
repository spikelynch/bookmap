Try this with a force map


- rather than dithering, go

- DEWEY - Author - title

to try and reveal clustering at a discipline level



# TODO:

Make the colours easier to control - with css or a json config file

Try animating live searches in the voronoi map

## Modularising

Separate the code into the following components

* Layout - the Hilbert / Voronoi mapping and the dynamic force stuff
* Render - how the layout is mapped to svg elements
* Colour - how the svg elements are coloured

This should allow renderers and colour schemes to be swapped in and out
pretty easily

### Colours

Right now the dewey -> colour stuff is embedded in book2node so it's baked
into the visualisation when the data is loaded.  Pull it out so that each
node's colour is d3-ishly done with a callback on d, and then it can be
updated live with a control

### Rendering

Almost all of this should be done with stylesheets - the exception is circle
radius
