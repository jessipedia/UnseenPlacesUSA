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

mongoose.connect('mongodb://jscottdutcher:5eD8xe5T6vr3@jessdb-shard-00-00-98ywm.mongodb.net:27017,jessdb-shard-00-01-98ywm.mongodb.net:27017,jessdb-shard-00-02-98ywm.mongodb.net:27017/upusa?ssl=true&replicaSet=JessDB-shard-0&authSource=admin',{useMongoClient: true});

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
