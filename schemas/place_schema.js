const mongoose  = require('mongoose');
const Schema    = mongoose.Schema;

const placeSchema = new Schema({
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
                  }, { typeKey: '$type' });

const Place = mongoose.model('places', placeSchema);

module.exports.Place = Place;
module.exports.Schema = placeSchema;
