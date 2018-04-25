var express = require('express');
var app = express();
var mongoose = require('mongoose');

var Place = require('./place_schema.js').Place;
var Shape = require('./shape_schema.js').Shape;
let mdbUri = process.env.UP_MDB_URI;

var server = app.listen(process.env.PORT || 8000, listen);

function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('listening at http://' + host + ':' + port);
}

app.use(express.static('public'));

app.get('/234598', sendKey);

function sendKey(req, res) {
    res.send(process.env.MBX_KEY)
}

app.get('/api/places', placeResult);

function placeResult(req, res) {
  var data = req.query;
  var search = data.search;
  var loc = data.location;
  var name;
  //console.log(loc);
  mongoose.connect(mdbUri,{useMongoClient: true});
  console.log('DB Connected');

  if (loc) {
    console.log(loc);
    if (loc.length > 2){
    console.log('loc larger than 2');
    name = 'properties.Name';
  } else {
    console.log('loc not larger than 2');
    name = 'properties.STUSPS';
    }

    console.log('Searching for loc');
    Shape.findOne({ [name] : data.location }, function(err, shape){
      console.log(shape);
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
