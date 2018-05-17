//Insterts geojson shapes into db
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const fs = require('fs');

const fileName = './geography/cb_2016_us_state_5m.geojson';
const mdbUri = process.env.UP_MDB_URI;
const content = fs.readFileSync(fileName);
const jsonContent = JSON.parse(content);

const features = jsonContent.features;

const terr = ['Guam', 'Commonwealth of the Northern Mariana Islands', 'United States Virgin Islands', 'American Samoa'];

for (var i = 0; i < features.length; i++) {

  if(terr.includes(features[i].properties.Name)){
    console.log(features[i].properties.Name);
    const obj = JSON.stringify(features[i]);
    fs.appendFileSync('cb_2016_us_terr_5m.geojson', obj + ',' + '\n');
  }

}
