(function (){

var margin = {top: 0, right: 0, bottom: 0, left: 0};
var width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var svg = d3.selectAll('div')
            .append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

console.log('After SVG');

d3.queue()
    .defer(d3.json, "states.json")
    .await(ready);

var projection = d3.geoAlbersUsa()
                    .translate([ width / 2, height / 2])
                    .scale(850);

var path = d3.geoPath()
            .projection(projection);

function ready (error, data){
  console.log(data);

  var states = topojson.feature(data, data.objects.usStates).features;
  console.log(states);

  svg.selectAll(".states")
    .attr("class", "state")
    .data(states)
    .enter().append("path")
    .attr("d", path);


}

})();
