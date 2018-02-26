let usGeoJSON = '~/tools/cb_2016_us_state_500k_edit_v2.geojson'


d3.json("http://localhost:3000/api/places", function(data) {
  console.log(data);

  var map = d3.select('box').
});
