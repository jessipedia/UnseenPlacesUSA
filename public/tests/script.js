//(function (){
var stateShapes = "states.json";
var placeData = "/api/places";


var margin = {top: 0, right: 0, bottom: 0, left: 0};
var width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var svgMap = d3.select('#map')
            .append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

console.log('After SVG');

draw(stateShapes, placeData, ready);

function outputtext(){
  var searchTerm = document.getElementById('search').value;
  var placeData = "http://localhost:3000/api/places" + "?search=" + searchTerm;
  console.log(placeData);
  draw(stateShapes, placeData, change);
}

function draw(stateShapes, placeData, func){
  d3.queue()
    .defer(d3.json, stateShapes)
    .defer(d3.json, placeData)
    .await(func);
  }

var projection = d3.geoAlbersUsa()
                    .translate([ width / 2, height / 2])
                    .scale(1300);

var path = d3.geoPath()
            .projection(projection);

function ready (error, dataShape, dataPlace){
  console.log(dataShape);

  var states = topojson.feature(dataShape, dataShape.objects.usStates).features;
  console.log(states);

  svgMap.selectAll(".state")
    .data(states)
    .enter().append("path")
    .attr("class", "state")
    .attr("d", path);

  console.log(dataPlace);

  svgMap.selectAll('.place')
    .data(dataPlace)
    .enter().append("circle")
    .attr("class", "place")
    .attr("r", 1)
    .attr("cx", function (d){
      var coords = projection(d.location.coordinates);
      try{
        return coords[0]
      } catch (e){
        console.log(e);
      }
    })
    .attr("cy", function (d){
      var coords = projection(d.location.coordinates);
      try{
        return coords[1]
      } catch (e){
        console.log(e);
      }
    })
    //.on('mouseover', tip.show)
    //.on('mouseout', tip.hide)
}

function change(error, stateShapes, dataPlace){
  console.log(dataPlace);

  svgMap.selectAll('.place').remove();

  svgMap.selectAll('.place')
    .data(dataPlace)
    .enter().append("circle")
    .attr("class", "place")
    .attr("r", 1)
    .attr("cx", function (d){
      var coords = projection(d.location.coordinates);
      try{
        return coords[0]
      } catch (e){
        console.log(e);
      }
    })
    .attr("cy", function (d){
      var coords = projection(d.location.coordinates);
      try{
        return coords[1]
      } catch (e){
        console.log(e);
      }
    });

  console.log('Finnished changing');


}

//})();
