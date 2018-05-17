//Insterts geojson shapes into db
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const fs = require('fs');

const fileName = './geography/cb_2016_us_terr_5m_edit.geojson';
const mdbUri = process.env.UP_MDB_URI;
const content = fs.readFileSync(fileName);
const jsonContent = JSON.parse(content);

const features = jsonContent.features;

const terrSchema = mongoose.Schema({
  properties:
  {
    Name: String,
    STATEFP: Number,
    STATENS: Number,
    AFFGEOID: String,
    GEOID: Number,
    STUSPS: String,
    LSAD: Number,
    ALAND: Number,
    AWATER: Number
  },
  geometry:
  {
    type: String,
    coordinates:
    [[]]
  }
}, { typeKey: '$type' });

const terrShape = mongoose.model('Shape', terrSchema);

mongoose.connect(mdbUri, {useMongoClient: true});

terrShape.insertMany(features, function(err, docs) {
  console.log('Saving');
  if (err){
    console.log(err);
  }else{
    console.log('docs inserted');
    mongoose.disconnect();
    console.log('db disconnected');
  }

})
