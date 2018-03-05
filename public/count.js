var placeData = "http://localhost:3000/api/places";
var data = [];

var margin = {top: 20, right: 20, bottom: 20, left: 20};
var width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var svgBar = d3.select('#bar')
            .append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.queue()
  .defer(d3.json, placeData)
  .await(ready);

function ready(error, dataPlace){
  //console.log(dataPlace);
  var places = [];

  for (i = 0; i < dataPlace.length; i++) {
    try{
        places.push(dataPlace[i].description)
    } catch (e) {
      console.log(e);
    }
  }

  var current = null;
  var cnt = 0;
  places = places.sort();
  //console.log(places);
   for (var i = 0; i <= places.length; i++) {
     if (places[i] != current) {
       if (cnt > 0){
       //make a new data entry and reset current to 1
       data.push({name: current, count: cnt})
       current = places[i];
       cnt = 1;
       } else{
         current = places[i];
         cnt = 1;
       }
     }else{
       //count another one in the current entry
       cnt++;
     }
   }

   svgBar.selectAll('.bar')
      .data(data)
      .attr("class", "bar")

}
