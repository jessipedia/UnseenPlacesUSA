let usGeoJSON = 'cb_2016_us_state_500k_edit_v2.geojson';

var projection = d3.geo.albers();
var path = d3.geo.path().projection(projection);


d3.json(usGeoJSON, function(data){

  var mapContainer = d3.select('#mapContainer').append('svg')
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 960 500")
      .classed("card", true)

  var group = mapContainer.selectAll('g')
     .data(data.features)
     .enter()
     .append('g')

 var map = group.append("path")
     .attr("d", path)
     .attr("class", "area")
     .style({
       fill: 'none',
       stroke: "#6E6E6E",
     })
})


// d3.json("http://localhost:3000/api/places", function(data) {
//   console.log(data);
//
//   var map = d3.select('').
// })
