var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var config = require('./config.js');
var bottleneck = require('bottleneck');
var mongoose = require('mongoose');

var shortDesc = 'unseen place';
var locAbbrev = 'NV';
const now = new Date();

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

var data;
var readableStream = fs.createReadStream('./lists/nevada_state_prisons.txt');

readableStream.setEncoding('utf8');

readableStream.on('data', function(chunk) {
    data += chunk;
});

readableStream.on('end', function() {
   let list = data.split(',');

  for (let i = 0; i < list.length; i++) {
      counter = i;
      let name = list[i].trim();
      name = name.replace(/undefined/, '');
      let strp = name.replace(/\([^)]*\)/, '');
      strp = encodeURIComponent(strp);


      limiter.schedule(() => gather(strp))
        .then(result => scrape(result))
        .then(result => createObj(result));
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
          console.log("Gather Request " + err + '\n' + '\t' + wikiapi);
          resolve("Gather Request " + err + '\n' + '\t' + wikiapi);
      } else {
          let parsed = JSON.parse(body);
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
            resolve(body, parsed[0]);
          }
        })
    } else {
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
      console.log(nm);
      //console.log(latlon);
      //console.log(text == null);

      if (latlon && text){
        //console.log('Complete ' + nm);
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

                    let placeCreate = new Place({
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
                    });

                    console.log('Complete ' + placeCreate);

                  } else{
                    //This is the wrong object, move on
                  }
                }
              } else {
                //There are no location results
                let placeCreate = new Place({
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
                });

                console.log('Partially Incomplete no stusps ' + placeCreate)
              }
            }
          })
        }else {
          let placeCreate = new Place({
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
          });

          console.log('Complete ' + placeCreate);
        }

      } else if (text && latlon == null){

        let placeCreate = new Place({
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
        });
        console.log('Partially Incomplete no latlon' + placeCreate);

      } else if (latlon && text == null){

        latlon = latlon.split(';');
        let lat = latlon[0];
        let lon = latlon[1];

        let placeCreate = new Place({
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
        });
        console.log('Partially Incomplete no text ' + placeCreate);
          } else{

        }
    } else {
      let placeCreate = new Place({
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
      });
      console.log('Totally Incomplete ' + placeCreate);
      resolve();
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
