//required node modules
var fs = require('fs');
var scrapy = require('node-scrapy');
var request = require('request');
var mongoose = require('mongoose');

//read in the data in our list file
var readableStream = fs.createReadStream('./lists/wyoming_state_prisons.txt');
//set the encoding of the data stream
readableStream.setEncoding('utf8');
//establish the data variable for the incoming data
var data = '';

//this variable is used to set the description field
var desc = "Wyoming state prison";

//the data model for node-scrapy
var model = {
    'name': '.firstHeading',
    'geo': {
        selector: '.geo',
        unique: true
    },
};

//mongoose data schema
//need to set typeKey to use 'type' for geoJSON
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
}, { typeKey: '$type' })
//Set a variable so we can use our model quickly
var Place = mongoose.model('Place', placeSchema);

//Set a const for recording the date & time
const now = new Date();

//Counter for tracking saves to the db
//so we can close db when saves are complete
var count = 0;

readableStream.on('data', function(chunk) {
    data += chunk;
});

readableStream.on('end', function() {
   list = data.split(',');

  for (var i = 0; i < list.length; i++) {
      counter = i;
      var name = list[i];
      var strp = list[i].trim();
      strp = list[i].replace(/\([^)]*\)/, '');
      strp = encodeURIComponent(strp);
      gather(strp, name);
  }
});

function gather(place, nm) {
  //use wikipedia api to search for data
  var wikiapi = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=' + place;

    //make the request to the api
    request(wikiapi, function(err, res, body) {
        console.log("Searching wikipedia");
        if (err != null) {
            console.log("Request " + err);
            return
        } else {
            var parsed = JSON.parse(body);
            if (!parsed[3]) {
                return
            }
            //find the article url in the returned api data
            var url = parsed[3][0];
            console.log("found url");

            scrapy.scrape(url, model, function(err, data) {
                if (err) {
                    console.log(nm);
                    console.log(wikiapi);
                    //record searches that don't work
                    fs.appendFileSync('broken.txt', nm + ", " + desc + ", " + wikiapi);
                    return
                }
                //convert js values to JSON
                var json = JSON.stringify(data, null, 2);
                //parse JSON to objects
                var parsed = JSON.parse(json);

                if (parsed.geo != null) {
                    var latlon = parsed.geo.split(';');
                    //remove the space
                    latlon[1] = latlon[1].replace(/\s/, '');
                    parsed.location = {type: "", coordinates: []}
                    //longitude
                    parsed.location.coordinates[0] = latlon[1];
                    //latitude
                    parsed.location.coordinates[1] = latlon[0];
                    parsed.source = url;
                    delete parsed.geo;

                } else {
                    return
                }

                //convert all values to JSON
                var rejson = JSON.stringify(parsed, null, 2);

                var placeCreate = new Place({
                  name: parsed.name,
                  description: desc,
                  location: {
                    type: "Point",
                    coordinates: [
                      parsed.location.coordinates[0],
                      parsed.location.coordinates[1]
                    ]
                  },
                  source: parsed.source,
                  added: now
                });
                console.log(placeCreate);

                count += 1;
                console.log(count);
                if (count == 1) {
                  mongoose.connect('mongodb://localhost/up_prod',{useMongoClient: true});
                }
                placeCreate.save(function(err) {
                  count -= 1;
                  console.log(count);
                  if (count === 0){
                    mongoose.disconnect();
                  }

                  if (err) {
                    console.log("Error saving: " + err);
                  }
                });
            })
          }
    })
}
