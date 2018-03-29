var express = require('express');
var app = express();
var mongoose = require('mongoose');

var placeSchema = mongoose.Schema({
  name: String,
  short_desc: String,
  long_desc: String,
  stusps: String,
  location: {
    type: String,
    coordinates: [
      Number,
      Number
    ]
  },
  loc_source: String,
  desc_source: String,
  created: Date,
  updated: Date,
}, { typeKey: '$type' })
//Set a variable so we can use our model quickly
var Place = mongoose.model('Place', placeSchema);

var shapeSchema = mongoose.Schema({
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

var Shape = mongoose.model('Shape', shapeSchema);

var server = app.listen(process.env.PORT || 3000, listen);


function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('listening at http://' + host + ':' + port);
}

app.use(express.static('public'));

app.get('/api/places', placeResult);

function placeResult(req, res) {
  var data = req.query;
  var search = data.search;
  var loc = data.location;
  var name;
  //console.log(loc);
  mongoose.connect('mongodb://localhost/upusa',{useMongoClient: true});
  console.log('DB Connected');

  if (loc) {

    if (loc.length > 2){
    name = 'properties.Name';
    } else {
    name = 'properties.STUSPS';
    }

    console.log('Searching for loc');
    Shape.findOne({ [name] : data.location }, function(err, shape){
      //console.log(shape);
      if (shape === null){
        res.send('Invalid Location Name')
      }
      else if (err) {
        res.send(err)
        mongoose.disconnect();
        console.log('err DB Disconnected');
        //console.log(err);
    } else if (search){
        search = data.search;
        var query = new RegExp(search, 'i');
        Place.find( { 'location': { $geoWithin: { $geometry: shape.geometry } }, 'short_desc' : { $regex: query } } , function(err, docs){
          if (err) {
            res.send(err)
            mongoose.disconnect();
            console.log('DB Disconnected');
            //console.log(err);
          } else {
            res.send(docs);
            mongoose.disconnect();
            console.log('DB Disconnected');
            //console.log(docs);
          }
        })
    } else{
      Place.find( { 'location': { $geoWithin: { $geometry: shape.geometry } } } , function(err, docs){
        if (err) {
          res.send(err)
          mongoose.disconnect();
          console.log(docs);
          console.log('err DB Disconnected');
          //console.log(err);
        } else {
          res.send(docs);
          mongoose.disconnect();
          console.log('DB Disconnected');
        }
      })
    }
    })
  } else if (search) {
    search = data.search;

    var query = new RegExp(search, 'i');
    Place.find({ 'short_desc' : { $regex: query } }, function(err, docs){
      if (err) {
        res.send(err)
        mongoose.disconnect();
        console.log('DB Disconnected');
        //console.log(err);
    } else {
        res.send(docs);
        mongoose.disconnect();
        console.log('DB Disconnected');
        //console.log(docs);
    }
    })
  } else{
    Place.find({}, function(err, docs){
      if (err) {
        res.send(err)
        mongoose.disconnect();
        console.log('DB Disconnected');
        //console.log(err);
    } else {
        res.send(docs);
        mongoose.disconnect();
        console.log('DB Disconnected');
        //console.log(docs);
    }
    })
  }
}
