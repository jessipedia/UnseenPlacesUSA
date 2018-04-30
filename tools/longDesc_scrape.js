var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var config = require('./config.js');
var bottleneck = require('bottleneck');
var mongoose = require('mongoose');

var shortDesc = 'automatic tracking radar station';
var locAbbrev = 'none';
const now = new Date();
var filename = 'auto_tracking_radar'

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

mongoose.connect('',{useMongoClient: true});
console.log('Opening connection');

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
});

function gather(place){
  return new Promise(resolve => {
  let wikiapi = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search='+ place;
  let options = {
    uri: wikiapi,
    family: 4
  }

    request(options, function(err, res, body) {
      if (err) {
          count = count -1;
          console.log("Gather Request " + err + '\n' + '\t' + wikiapi);
          return;
      } else {
          let parsed = JSON.parse(body);
          console.log('Completed request');
          //This is for debugging
          //fs.appendFileSync('gather_log_' + filename + ' ' + now + '.txt', res + '\n');
          resolve(parsed);
        }
    })
  })
}

function scrape(parsed){
  return new Promise(resolve => {
    if (parsed == null){
      console.log('Error Scrape Results null: ' + parsed);
      count = count - 1;
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
                count = count - 1;
                console.log("Scrape Request " + err + '\n' + '\t' + url);
                return
            } else {
              resolve(body);
              console.log('Completed Scrape');
              //This is for debugging
              //fs.appendFileSync('scrape_log_' + filename + ' ' + now + '.txt', res + '\n');
            }
          })
      } else {
        //This is for debugging
        //fs.appendFileSync('scrape_log_' + filename + ' ' + now + '.txt', parsed + '\n');
        console.log('Completed Scrape')
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
              count = count - 1;
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
                    console.log('Completed CreateObj');
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
                console.log('Completed CreateObj');
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
          console.log('Completed CreateObj');
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
        console.log('Completed CreateObj');
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
        console.log('Completed CreateObj');
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
            console.log('Completed CreateObj');
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
      console.log('Completed CreateObj');
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
  if(para){
    let text = para.text();
    text = text.replace(/\[citation needed\]/g, '');
    text = text.replace(/\[update\]/g, '');
    text = text.replace(/\[\d+\]/g, '');
    text = text.replace(/\\/g, '');
    text = text.replace(/\\\'/g, '\'');
    return(text);
  } else{
    return(null);
  }

}

function firstHeading(body){
  let $ = cheerio.load(body);
  let heading = $(".firstHeading").text();
  if(heading){
    return(heading);
  } else{
    return(null);
  }

}

function source(body){
  let $ = cheerio.load(body);
  let source = $('link');
  if (source){
    for (var i = 0; i < source.length; i++) {
      let rel = source[i].attribs.rel;
      if (rel == 'canonical'){
        return(source[i].attribs.href);
      }
      //Doesn't return if cannonical doesn't exist
    }
  } else {
      return(null)
    }
}

function insert(doc){
  let text = doc.long_desc;
  let stusps = doc.stusps;
  let lat = doc.location.coordinates[0];

  fs.appendFileSync('insert_log_' + filename + ' ' + now + '.txt', doc.name + '\n');

  if (text == 'none' || stusps == 'none' || lat == 0 || text.includes('Coordinates:')){
    console.log('Place is Incomplete');
    let incomplete = new incPlace ({
      name: doc.name,
      short_desc: doc.short_desc,
      long_desc: doc.long_desc,
      stusps: doc.stusps,
      location: {
        type: doc.location.type,
        coordinates: [
          doc.location.coordinates[1],
          doc.location.coordinates[0]
        ]
      },
      loc_source: doc.loc_source,
      desc_source: doc.desc_source,
      created: doc.created,
      updated: doc.updated,
    })
    // if (count ==  length) {
    //   console.log("Incomplete Doc Opening Connection");
    //
    //
    // }
      incomplete.save(function(err) {
        if (err) {
          console.log("Incomplete Doc Error saving: " + err);
        } else {
            count = count - 1;
            console.log('Saving Incomplete Doc ' + count);
            if (count === 0){
              mongoose.connection.close('close', function(){
              console.log("Incomplete Doc Closing Connection");
              });
            }
          }
      })
  } else{
    console.log('Place is Complete');

    let complete = new Place ({
      name: doc.name,
      short_desc: doc.short_desc,
      long_desc: doc.long_desc,
      stusps: doc.stusps,
      location: {
        type: doc.location.type,
        coordinates: [
          doc.location.coordinates[1],
          doc.location.coordinates[0]
        ]
      },
      loc_source: doc.loc_source,
      desc_source: doc.desc_source,
      created: doc.created,
      updated: doc.updated,
    })

    // if (count == length) {
    //   console.log('Complete Doc Opening connection');
    //   mongoose.connect('mongodb://jscottdutcher:5eD8xe5T6vr3@jessdb-shard-00-00-98ywm.mongodb.net:27017,jessdb-shard-00-01-98ywm.mongodb.net:27017,jessdb-shard-00-02-98ywm.mongodb.net:27017/upusa?ssl=true&replicaSet=JessDB-shard-0&authSource=admin',{useMongoClient: true});
    // }

    console.log('After new Place created');

    complete.save(function(err) {
      if (err) {
        console.log("Complete Error saving: " + err);
      } else {
        console.log('Saving Complete Doc ' + count);
          count = count - 1;
          if (count === 0){
            mongoose.connection.close('close', function(){
            console.log("Complete Doc Closing Connection");
            });
          }
        }
    })
  }
}
