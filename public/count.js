var placeData = "http://localhost:3000/api/places";

var margin = {top: 20, right: 20, bottom: 20, left: 20};
var width = 1000 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

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
  var data = [];

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

   for (var i = 0; i <= places.length; i++) {
     if (places[i] != current) {
       if (cnt > 0){
       data.push({name: current, count: cnt})
       current = places[i];
       cnt = 1;
       } else{
         current = places[i];
         cnt = 1;
       }
     }else{
       cnt++;
     }
   }

   //console.log(data);

   // for (var i = 0; i < data.length; i++) {
   //   console.log(data[i].name);
   // }

   var group = [
   {
   name: "private state prison",
   count: 0
    },

   {
    name: "state prison",
    count: 0
    }
   ];

   var privatePrisonTotal = 0;
   var prisonTotal = 0;
   var expr = /state prison/;
   console.log(data);
   console.log(data.length);

    for (var i = 0; i < data.length; i++) {
      //console.log(data[i].name);
      if (data[i].name.includes('private prison')){
       privatePrisonTotal = privatePrisonTotal + data[i].count;
       console.log(data[i].name);
     } else if (data[i].name.includes('state prison')){
       prisonTotal = prisonTotal + data[i].count;
       console.log(data[i].name);
     } else if (data[i].name.includes('juvenile prison')){
       prisonTotal = prisonTotal + data[i].count;
       console.log(data[i].name);
     } else if (data[i].name.includes('work release')){
       prisonTotal = prisonTotal + data[i].count;
       console.log(data[i].name);
     } else {
       group.push({name: data[i].name, count: data[i].count})
     }
    };
    group[0].count = privatePrisonTotal;
    group[1].count = prisonTotal;
    console.log(privatePrisonTotal);
    console.log(prisonTotal);
    console.log(group);

   var y = -10;

   svgBar.selectAll('.bar')
      .data(group)
      .attr("class", "bar")
      .enter().append("rect")
      .attr("width", function (d){
        //var count = d.count
        return d.count;
      })
      .attr("height", 20)
      .attr("x", 200)
      .attr("y", function (){
        y = y + 30;
        return y
      })

  svgBar.selectAll('text')
      .data(group)
      .attr("y", 50)
      .attr("x", 10)
      .attr("dy", ".75em")
      .text(function(d) { return d.name; });

}
