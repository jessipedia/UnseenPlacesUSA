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
  },
  source: String,
  added: Date
}, { typeKey: '$type' });
//Set a variable so we can use our model quickly
var Place = mongoose.model('Place', placeSchema);

var server = app.listen(process.env.PORT || 3000, listen);


function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('listening at http://' + host + ':' + port);
}

app.use(express.static('public'));

app.get('/api/all', showAll);

// Callback
function showAll(req, res) {
  //give all results here
  res.send("this is where the search results go");
}

app.get('/api/place', searchResult);

function searchResult(req, res) {
  var data = req.query;
  var search = data.search;
  var loc = data.state;
  var query = new RegExp(search, 'i');
  mongoose.connect('mongodb://localhost/up_prod',{useMongoClient: true});
  console.log('DB Connected');
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
}
