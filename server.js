var express = require('express');
var mongoose = require('mongoose');

var Place = require('./schemas/place_schema.js').Place;
var Shape = require('./schemas/shape_schema.js').Shape;
var placeResult = require('./routes/placeResult.js');

var app = express();
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

app.use('/api/places', placeResult);
