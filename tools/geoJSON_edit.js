//Edits US census geojson for use with project
//https://www.census.gov/geo/maps-data/data/tiger-cart-boundary.html
const fs = require('fs');
const fileName = './geography/cb_2016_us_terr_5m.geojson';
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

fs.appendFileSync('./geography/cb_2016_us_terr_5m_edit.geojson', stringJSON);
