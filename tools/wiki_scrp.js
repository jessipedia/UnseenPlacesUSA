//required node modules
var fs = require('fs');
var scrapy = require('node-scrapy');
var request = require('request');
var mongoose = require('mongoose');
var assert = require('assert');


//read in the data in our list file
var readableStream = fs.createReadStream('./lists/alaska_state_prisons.txt');
//set the encoding of the data stream
readableStream.setEncoding('utf8');
//establish the data variable for the incoming data
var data = '';

//this variable is used to set the description field
var desc = "";
//this is a date contant to set the added  field
const now = new Date();

mongoose.Promise = global.Promise;

//the data model for node-scrapy
var model = {
    'name': '.firstHeading',
    'geo': {
        selector: '.geo',
        unique: true
    },
};

//mongoose data schema
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
  //Is this an acceptable date
  added: Date


}, { typeKey: '$type' })

var Place = mongoose.model('Place', placeSchema);

// connect to db (IS THIS THE RIGHT DB?)
// Should I be useing createConnection here?
mongoose.connect('mongodb://localhost/upusa',{useMongoClient: true});

var db = mongoose.connection;

//db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected")
});


//read in the data
readableStream.on('data', function(chunk) {
    data += chunk;
});

//split the data on commas into an array
//trim out extra characters and spaces
//cycle through the array
//call the gather function to scrape data and create JSON
function makeData(){
   readableStream.on('end', function() {
    var list = data.split(',');

    for (var i = 0; i < list.length; i++) {
        var name = list[i];
        var strp = list[i].trim();
        strp = list[i].replace(/\([^)]*\)/, '');
        strp = encodeURIComponent(strp);
        //console.log(strp);
        gather(strp, name);

    }

    //mongoose.connection.close();
  });
}

makeData.then(function(){
  console.log("Exit");
  process.exit();
})

//mongoose.disconnect();

function gather(place, nm) {
  //use wikipedia api to search for data
  var wikiapi = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=' +
      '&search=' + place;

    //make the request to the api
    request(wikiapi, function(err, res, body) {
        if (err != null) {
            console.log("Request " + err);
        } else {
            var parsed = JSON.parse(body);
            if (!parsed[3]) {
                return
            }
            //find the article url in the returned api data
            var url = parsed[3][0];

            //pass the url into scrapy
            scrapy.scrape(url, model, function(err, data) {
                if (err) {
                    console.log(nm);
                    console.log(wikiapi);
                    //record searches that don't work
                    fs.appendFile('broken.txt', nm + ", " + desc + ", " + wikiapi);
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
                //console.log(rejson);

                //var placeCreate = new Place({rejson});
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

                // mongoose.connect('mongodb://localhost/upusa',{useMongoClient: true});
                //
                // var db = mongoose.connection;
                //
                // //db.on('error', console.error.bind(console, 'connection error:'));
                // db.once('open', function() {
                //   console.log("Connected")
                // });


                var promise = placeCreate.save(function (err) {
                  if (err) return console.error(err);
                  console.log("Saved");
                  //mongoose.disconnect();
                  //console.log("Exit");
                  //process.exit();
                });
                //assert.ok(promise instanceof require('mpromise'));



                promise.then(function (doc) {
                  //mongoose.disconnect();
                  //console.log("Exit");
                  //process.exit();

                });

                //add this entry to JSON file
                //fs.appendFile('./json/gold_mine.json', '\n\n' + rejson + ',', finished);

                function finished(err) {
                }
            })
        }
    })
}
