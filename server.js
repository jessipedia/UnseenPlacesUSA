const express = require('express');
const mongoose = require('mongoose');
const placeResult = require('./routes/placeResult.js');
const sendKey = require('./routes/sendKey.js');

const mdbUri = process.env.UP_MDB_URI;
const app = express();
const server = app.listen(process.env.PORT || 8000, listen);

function listen() {
  const host = server.address().address;
  const port = server.address().port;
  console.log('listening at http://' + host + ':' + port);
}

mongoose.connect(mdbUri, {useMongoClient: true});

app.use(express.static('public'));

//Mapbox API key stored serverside
app.use('/key', sendKey);

app.use('/api/places', placeResult);
