console.log('Loding Globe');

(function (){
  var margin = { top: 0, right: 0, bottom: 0, left: 0};
  var width = 800 - margin.right - margin.left,
      height = 400 - margin.top - margin.bottom;

  var svg = d3.select('#globe')
            .append('svg')
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom);
            //.append('g')
            //.transform('transform', 'translate(' + margin.left + ', ' + margin.top + ')')

  console.log('After SVG Globe');

  var projection = d3.geoOrthographic()
                    .scale(250)
                    .translate([width / 2, height / 2])
                    .clipAngle;

  var path = d3.geoPath()
              .projection(projection);

  var λ = d3.scaleLinear()
            .domain([0, width])
            .range([-180, 180]);

  var φ = d3.scaleLinear()
            .domain([0, height])
            .range([90, -90]);



  svg.on('mousemove', function(){
    var p = d3.mouse(this);
    projection.rotate([λ(p[0]), φ(p[1])]);
    svg.selectAll("path").attr("d", path);
  })

  d3.queue()
    .defer(d3.json, "custom.geo.json")
    .await(ready)

  function ready(error, data){
    if (error) throw error;

    console.log(data)

  }



})();
