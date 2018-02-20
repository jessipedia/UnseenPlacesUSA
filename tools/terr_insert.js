var express = require('express');
var app = express();
var mongoose = require('mongoose');
var fs = require('fs');

var fileName = './cb_2016_us_state_500k_edit_v2.geojson';
var content = fs.readFileSync(fileName);
var jsonContent = JSON.parse(content);

var features = jsonContent.features;
console.log(features);

var terrSchema = mongoose.Schema({
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

var terrShape = mongoose.model('Shape', terrSchema);

mongoose.connect('mongodb://localhost/up_prod',{useMongoClient: true});

terrShape.insertMany(features, function(err, docs) {
  if (err){
    console.log(err);
  }else{
    console.log('docs inserted');
    mongoose.disconnect();
    console.log('db disconnected');
  }

})
