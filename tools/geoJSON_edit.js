var fs = require('fs');
var fileName = './cb_2016_us_state_500k.geojson';
//var file = require(fileName);

//console.log(fileName);
var content = fs.readFileSync(fileName);
//console.log(content);

var jsonContent = JSON.parse(content);

for (var i = 0; i < jsonContent.features.length; i++) {
  delete jsonContent.features[i].properties.description;
  delete jsonContent.features[i].properties.timestamp;
  delete jsonContent.features[i].properties.begin;
  delete jsonContent.features[i].properties.end;
  delete jsonContent.features[i].properties.altitudeMode;
  delete jsonContent.features[i].properties.tessellate;
  delete jsonContent.features[i].properties.extrude;
  delete jsonContent.features[i].properties.visibility;
  delete jsonContent.features[i].properties.drawOrder;
  delete jsonContent.features[i].properties.icon;
  delete jsonContent.features[i].properties.NAME2;
  console.log(jsonContent.features[i].properties);
}

var stringJSON = JSON.stringify(jsonContent);

fs.appendFileSync('cb_2016_us_state_500k_edit_v2.geojson', stringJSON);
