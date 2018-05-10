const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Place = require('../schemas/place_schema.js').Place;
const Shape = require('../schemas/shape_schema.js').Shape;


router.get('/', placeResult);

module.exports = router;


//Refactor
function placeResult(req, res) {
  const data = req.query;
  let search = data.search;
  const loc = data.location;
  let name;

  if (loc) {
    if (loc.length > 2){
    name = 'properties.Name';
  } else {
    name = 'properties.STUSPS';
    }

    Shape.findOne({ [name] : data.location }, function(err, shape){
      if (shape === null){
        res.send('Invalid Location Name')
      }
      else if (err) {
        res.send(err)
    } else if (search){
        search = data.search;
        const query = new RegExp(search, 'i');
        Place.find( { 'location': { $geoWithin: { $geometry: shape.geometry } }, 'short_desc' : { $regex: query } } , function(err, docs){
          if (err) {
            res.send(err)
          } else {
            res.send(docs);
          }
        })
    } else{
      Place.find( { 'location': { $geoWithin: { $geometry: shape.geometry } } } , function(err, docs){
        if (err) {
          res.send(err)
        } else {
          res.send(docs);
        }
      })
    }
    })
  } else if (search) {
    search = data.search;
    const query = new RegExp(search, 'i');
    Place.find({ 'short_desc' : { $regex: query } }, function(err, docs){
    if (err) {
        res.send(err)
    } else {
        res.send(docs);
    }
    })
  } else{
    Place.find({}, function(err, docs){
      if (err) {
        res.send(err)
    } else {
        res.send(docs);
    }
    })
  }
}
