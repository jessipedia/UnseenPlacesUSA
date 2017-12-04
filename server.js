var express = require('express');
var app = express();
var mongoose = require('mongoose');

var placeSchema = mongoose.Schema({
  name: String,
  description: String,
  location: {
    type: String,
    coordinates: [
      Number,
      Number
    ]
    //index: '2dsphere'
  },
  source: String,
  added: Date
}, { typeKey: '$type' });
//Set a variable so we can use our model quickly
var Place = mongoose.model('Place', placeSchema);

var stateSchema = mongoose.Schema({
  properties:
  {
    GEO_ID: String,
    STATE: String,
    NAME: String,
    LSAD: String,
    CENSUSAREA: Number
  },
  geometry:
  {
    type: String,
    coordinates: [[]]
    //index: '2dsphere'
  }
}, { typeKey: '$type' });

var State = mongoose.model('State', stateSchema);

var server = app.listen(process.env.PORT || 3000, listen);


function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('listening at http://' + host + ':' + port);
}

app.use(express.static('public'));

app.get('/api/place', placeResult);

function placeResult(req, res) {
  var data = req.query;
  var search = data.search;
  var loc = data.state;
  console.log(loc);
  mongoose.connect('mongodb://localhost/up_prod',{useMongoClient: true});
  console.log('DB Connected');

  if (loc) {

    console.log('Searching for loc');
    State.findOne({ 'properties.NAME' : data.state }, function(err, state){

      if (err) {
        res.send(err)
        mongoose.disconnect();
        console.log('err DB Disconnected');
        //console.log(err);
    } else if (search){
        search = data.search;
        var query = new RegExp(search, 'i');
        Place.find( { 'location': { $geoWithin: { $geometry: state.geometry } }, 'description' : { $regex: query } } , function(err, docs){
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
      Place.find( { 'location': { $geoWithin: { $geometry: state.geometry } } } , function(err, docs){
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
    Place.find({ 'description' : { $regex: query } }, function(err, docs){
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
    res.send('ALL RESULTS')
  }
}
