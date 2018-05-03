//Edits US census geojson for use with project
const fs = require('fs');
const fileName = './cb_2016_us_state_500k.geojson';
const content = fs.readFileSync(fileName);

const jsonContent = JSON.parse(content);

for (let i = 0; i < jsonContent.features.length; i++) {
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
}

const stringJSON = JSON.stringify(jsonContent);

fs.appendFileSync('cb_2016_us_state_500k_edit_v2.geojson', stringJSON);
