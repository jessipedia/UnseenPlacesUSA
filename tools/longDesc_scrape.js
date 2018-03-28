var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var config = require('./config.js');
var bottleneck = require('bottleneck');
var mongoose = require('mongoose');

var shortDesc = 'unseen place';
var locAbbrev = 'none';
const now = new Date();
var filename = 'superfund'

const limiter = new bottleneck({
  maxConcurrent: 6,
  minTime: 2000
});

var placeSchema = mongoose.Schema({
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
}, { typeKey: '$type' })

var Place = mongoose.model('Place', placeSchema);
var incPlace = mongoose.model('incPlace', placeSchema);
var incompleteCount = 0;
var completeCount = 0;
var count = 0;
var length = 0;

var data;
var readableStream = fs.createReadStream('./lists/' + filename + '.txt');

readableStream.setEncoding('utf8');

readableStream.on('data', function(chunk) {
    data += chunk;
});

readableStream.on('end', function() {
   let list = data.split(',');
      count = list.length;
      length = list.length;

      createPlaces(list);


  console.log('After List Loop');
});

function createPlaces(list){
  //return new Promise(resolve => {
    for (let i = 0; i < list.length; i++) {

        let name = list[i].trim();
        name = name.replace(/undefined/, '');
        let strp = name.replace(/\([^)]*\)/, '');
        strp = encodeURIComponent(strp);


        limiter.schedule(() => gather(strp))
          .then(result => scrape(result))
          .then(result => createObj(result))
          .then(result => insert(result));
    }
    //console.log('About to Resolve');
    //resolve();
  //})

}


function gather(place){
  return new Promise(resolve => {
  let wikiapi = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search='+ place;
  let options = {
    uri: wikiapi,
    family: 4
  }

    request(options, function(err, res, body) {
      if (err) {
          console.log("Gather Request " + err + '\n' + '\t' + wikiapi);
          resolve("Gather Request " + err + '\n' + '\t' + wikiapi);
      } else {
          let parsed = JSON.parse(body);
          fs.appendFileSync('gather_log_' + filename + ' ' + now + '.txt', res + '\n');

            resolve(parsed);
        }
    })
  })
}

function scrape(parsed){
  return new Promise(resolve => {
    if (parsed == null){
      console.log('Scrape Results null: ' + parsed);
      return;
    } else{

      if (parsed[3][0]){
        let url = parsed[3][0];
        let options = {
          uri: url,
          family: 4
        }

        request(options, function(err, res, body){
          if (err != null) {
              console.log("Scrape Request " + err + '\n' + '\t' + url);
              resolve(null)
          } else {
            resolve(body);
            fs.appendFileSync('scrape_log_' + filename + ' ' + now + '.txt', res + '\n');
          }
        })
    } else {
      fs.appendFileSync('gather_log_' + filename + ' ' + now + '.txt', parsed + '\n');
      resolve(parsed[0]);
    }

      }
})
}

function createObj(body){
  return new Promise(resolve => {

   if (body.includes('<!DOCTYPE html>')){

      let text = longDesc(body);
      let latlon = geo(body);
      let nm = firstHeading(body);
      let link = source(body);

      if (latlon && text){
        latlon = latlon.split(';');
        let lat = latlon[0];
        let lon = latlon[1];

        if (locAbbrev == 'none'){
          let mapsUrl = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lon + '&key=' + config.staticKey;

          request(mapsUrl, function(err, res, body){
            if (err != null) {
              console.log("Geocode Request " + err + '\n' + '\t' + mapsUrl);
              return;
            } else{
              let parsed = JSON.parse(body);
              if (parsed.results[0]){
                let address = parsed.results[0].address_components;
                for (var i = 0; i < address.length; i++) {
                  if(address[i].types.includes('administrative_area_level_1')){
                    let stusps = address[i].short_name;

                    let placeCreate = {
                      name: nm,
                      short_desc: shortDesc,
                      long_desc: text,
                      stusps: stusps,
                      location: {
                        type: 'Point',
                        coordinates: [
                          lat,
                          lon
                        ]
                      },
                      loc_source: link,
                      desc_source: link,
                      created: now,
                      updated: now,
                    };

                    resolve(placeCreate);

                  } else{
                    //This is the wrong object, move on
                  }
                }
              } else {
                //There are no location results
                let placeCreate = {
                  name: nm,
                  short_desc: shortDesc,
                  long_desc: text,
                  stusps: locAbbrev,
                  location: {
                    type: 'Point',
                    coordinates: [
                      lat,
                      lon
                    ]
                  },
                  loc_source: link,
                  desc_source: link,
                  created: now,
                  updated: now,
                };

                resolve(placeCreate);
              }
            }
          })
        }else {
          let placeCreate = {
            name: nm,
            short_desc: shortDesc,
            long_desc: text,
            stusps: locAbbrev,
            location: {
              type: 'Point',
              coordinates: [
                lat,
                lon
              ]
            },
            loc_source: link,
            desc_source: link,
            created: now,
            updated: now,
          };

          resolve(placeCreate);
        }

      } else if (text && latlon == null){

        let placeCreate = {
          name: nm,
          short_desc: shortDesc,
          long_desc: text,
          stusps: locAbbrev,
          location: {
            type: 'Point',
            coordinates: [
              0,
              0
            ]
          },
          loc_source: 'none',
          desc_source: link,
          created: now,
          updated: now,
        };
        resolve(placeCreate);

      } else if (latlon && text == null){

        latlon = latlon.split(';');
        let lat = latlon[0];
        let lon = latlon[1];

        let placeCreate = {
          name: nm,
          short_desc: shortDesc,
          long_desc: 'none',
          stusps: locAbbrev,
          location: {
            type: 'Point',
            coordinates: [
              lat,
              lon
            ]
          },
          loc_source: link,
          desc_source: 'none',
          created: now,
          updated: now,
        };
        resolve(placeCreate);
          } else{

            let placeCreate = {
              name: nm,
              short_desc: shortDesc,
              long_desc: 'none',
              stusps: locAbbrev,
              location: {
                type: 'Point',
                coordinates: [
                  0,
                  0
                ]
              },
              loc_source: link,
              desc_source: 'none',
              created: now,
              updated: now,
            };
            resolve(placeCreate);
        }
    } else {
      let placeCreate = {
        name: body,
        short_desc: shortDesc,
        long_desc: 'none',
        stusps: locAbbrev,
        location: {
          type: 'Point',
          coordinates: [
            0,
            0
          ]
        },
        loc_source: 'none',
        desc_source: 'none',
        created: now,
        updated: now,
      };
      resolve(placeCreate);
    }
  })
}

function geo(body, url){
  let $ = cheerio.load(body);
  let coord = $(".geo").html();
  if (coord){
    coord = coord.toString();
    return(coord);
  } else{
    return(null);
  }
}

function longDesc(body){
  let $ = cheerio.load(body);
  let paraHtml = $(".mw-parser-output > p").html();
  let para = cheerio.load(paraHtml);
  let text = para.text();
  text = text.replace(/\[citation needed\]/g, '');
  text = text.replace(/\[\d\]/g, '');
  text = text.replace(/\\/g, '');
  text = text.replace(/\\\'/g, '\'');
  return(text);
}

function firstHeading(body){
  let $ = cheerio.load(body);
  let heading = $(".firstHeading").text();
  //console.log(heading);
  return(heading);
}

function source(body){
  let $ = cheerio.load(body);
  let source = $('link');
  for (var i = 0; i < source.length; i++) {
    let rel = source[i].attribs.rel;
    if (rel == 'canonical'){
      return(source[i].attribs.href);
    }
  }
}

function insert(doc){
  //console.log(doc);
  //console.log(count);
  //console.log(length);
  let text = doc.long_desc;
  let stusps = doc.stusps;
  let lat = doc.location.coordinates[0];

  fs.appendFileSync('insert_log_' + filename + ' ' + now + '.txt', doc.name + '\n');

  if (text == 'none' || stusps == 'none' || lat == 0 || text.includes('Coordinates:')){
    //Incomplete
    //console.log('Incomplete');
    //console.log(doc);

    let incomplete = new incPlace ({
      name: doc.name,
      short_desc: doc.short_desc,
      long_desc: doc.long_desc,
      stusps: doc.stusps,
      location: {
        type: doc.location.type,
        coordinates: [
          doc.location.coordinates[0],
          doc.location.coordinates[1]
        ]
      },
      loc_source: doc.loc_source,
      desc_source: doc.desc_source,
      created: doc.created,
      updated: doc.updated,
    })

    //console.log(incomplete);

    //count = count + 1
    if (count ==  length) {
      console.log('Incomplete opening connection');
      mongoose.connect('mongodb://localhost/upusa',{useMongoClient: true});
    }
      incomplete.save(function(err) {
        console.log('Saving incomplete' + count);
        if (err) {
          console.log("Incomplete Error saving: " + err);
        } else {
            count = count - 1;
            console.log('Saving Incomplete');
            console.log(count);
            if (count === 0){
              mongoose.connection.close('close', function(){
              console.log("Incomplete Closing Connection");
              });
            }
          }
      })
  } else{
    //Complete
    //console.log('Complete');
    //console.log(doc);

    let complete = new Place ({
      name: doc.name,
      short_desc: doc.short_desc,
      long_desc: doc.long_desc,
      stusps: doc.stusps,
      location: {
        type: doc.location.type,
        coordinates: [
          doc.location.coordinates[0],
          doc.location.coordinates[1]
        ]
      },
      loc_source: doc.loc_source,
      desc_source: doc.desc_source,
      created: doc.created,
      updated: doc.updated,
    })

    //console.log(complete);

    //count = count + 1;
    if (count == length) {
      console.log('Complete opening connection');
      mongoose.connect('mongodb://localhost/upusa',{useMongoClient: true});
    }
    complete.save(function(err) {
      console.log('Saving count' + count);
      if (err) {
        console.log("Complete Error saving: " + err);
      } else {
        console.log('Saving Complete');
          count = count - 1;
          if (count === 0){
            mongoose.connection.close('close', function(){
            console.log("Complete Closing Connection");
            });
          }
        }
    })
  }
}
