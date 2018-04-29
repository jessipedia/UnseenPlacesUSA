var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

const shapeSchema = new Schema({
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

const Shape = mongoose.model('shapes', shapeSchema);

module.exports.Shape = Shape;
module.exports.Schema = shapeSchema;
