var placeData = "http://localhost:3000/api/places";

d3.queue()
  .defer(d3.json, placeData)
  .await(count);

function count(error, data){
  var counted = new Map();

  counted.set('private state prison', 0);
  counted.set('state prison', 0);

  for (var i = 0; i < data.length; i++) {

    //console.log(data[i].description);

    if (data[i].description.includes('private prison')){
      counted.set('private state prison', (counted.get('private state prison') + 1));
    } else if (data[i].description.includes('state prison')){
      counted.set('state prison', (counted.get('state prison') + 1));
    } else if (data[i].description.includes('juvenile prison')){
      counted.set('state prison', (counted.get('state prison') + 1));
    } else if (data[i].description.includes('work release')){
      counted.set('state prison', (counted.get('state prison') + 1));
    } else if (counted.has(data[i].description)){
      counted.set(data[i].description, (counted.get(data[i].description) + 1));
    } else{
        counted.set(data[i].description, 1);
    }
  }

  console.log(counted);

  return counted;
}

// function ready(error, dataPlace){
//   //console.log(dataPlace);
//   var places = [];
//   var data = [];
//
//   for (i = 0; i < dataPlace.length; i++) {
//     try{
//         places.push(dataPlace[i].description)
//     } catch (e) {
//       console.log(e);
//     }
//   }
//
//   var current = null;
//   var cnt = 0;
//   places = places.sort();
//
//    for (var i = 0; i <= places.length; i++) {
//      if (places[i] != current) {
//        if (cnt > 0){
//        data.push({name: current, count: cnt})
//        current = places[i];
//        cnt = 1;
//        } else{
//          current = places[i];
//          cnt = 1;
//        }
//      }else{
//        cnt++;
//      }
//    }
//
//    var group = [
//    {
//    name: "private state prison",
//    count: 0
//     },
//
//    {
//     name: "state prison",
//     count: 0
//     }
//    ];
//
//    var privatePrisonTotal = 0;
//    var prisonTotal = 0;
//
//     for (var i = 0; i < data.length; i++) {
//       if (data[i].name.includes('private prison')){
//        privatePrisonTotal = privatePrisonTotal + data[i].count;
//      } else if (data[i].name.includes('state prison')){
//        prisonTotal = prisonTotal + data[i].count;
//      } else if (data[i].name.includes('juvenile prison')){
//        prisonTotal = prisonTotal + data[i].count;
//      } else if (data[i].name.includes('work release')){
//        prisonTotal = prisonTotal + data[i].count;
//      } else {
//        group.push({name: data[i].name, count: data[i].count})
//      }
//     };
//     group[0].count = privatePrisonTotal;
//     group[1].count = prisonTotal;
//
//
//     var margin = {top: 20, right: 20, bottom: 20, left: 20};
//     var barHeight = 20;
//     var width = 1000 - margin.left - margin.right,
//         height = ((barHeight + 12) * group.length) - margin.top - margin.bottom;
//
//     var svgBar = d3.select('#bar')
//                 .append('svg')
//                 .attr("width", width + margin.left + margin.right)
//                 .attr("height", height + margin.top + margin.bottom)
//                 .append("g")
//                 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//
//    svgBar.selectAll('.bar')
//       .data(group)
//       .attr("class", "bar")
//       .enter().append("rect")
//       .attr("width", function (d){
//         //var count = d.count
//         return d.count;
//       })
//       .attr("height", barHeight)
//       .attr("x", 250)
//       .attr("y", function (d, i){
//         y = i *30
//         return y
//       })
//
//     // svgBar.selectAll("div")
//     //   .data(group)
//     //   .attr("class", "textDiv")
//     //   .enter().append("div")
//     //   .attr("y", function (d, i){
//     //     y = i * 30 + 2;
//     //     return y
//     //   })
//     //   .attr("x", 10)
//     //   .attr("width", 50)
//     //   .attr("height", barHeight)
//     //   .append("text")
//     //   .text(function(d) { return d.name; })
//
//   svgBar.selectAll("text")
//       .data(group)
//       .enter().append("text")
//       .attr("y", function (d, i){
//         y = i * 30 + 3;
//         return y
//       })
//       .attr("x", 10)
//       .attr("dy", ".75em")
//       .text(function(d) { return d.name; });
//
// }
