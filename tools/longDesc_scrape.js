var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var nlp = require('compromise');
var config = require('./config.js');
var bottleneck = require('bottleneck');

var shortDesc = 'unseen place';
const now = new Date();

const limiter = new bottleneck({
  maxConcurrent: 1,
  minTime: 2000
});

var data;
var readableStream = fs.createReadStream('./lists/test.txt');

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
        .then(result => stusup(result));
  }
});



function gather(place){
  return new Promise(resolve => {
  //console.log(place);
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
      //console.log(url);
      //let nm = parsed[0];

      let options = {
        uri: url,
        family: 4
      }

      request(options, function(err, res, body){
        console.log('Scrape Request Made');

        if (err != null) {
            console.log("Scrape Request " + err + '\n' + '\t' + url);
            resolve(null)
        } else {
          resolve(body);
        }
      })
    } else {
      console.log(parsed[0]);
      resolve();
    }

      }
})
}

function stusup(body){
  //console.log(body);
  return new Promise(resolve => {

  let text = longDesc(body);
  let latlon = geo(body);

  if (text && latlon){
    latlon = latlon.split(';');
    let lat = latlon[0];
    let lon = latlon[1];
    let mapsUrl = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lon + '&key=' + config.staticKey;

    request(mapsUrl, function(err, res, body){
      console.log('Geocode Request Made');
      if (err != null) {
        console.log("Geocode Request " + err + '\n' + '\t' + mapsUrl);
        return;
      } else{
        let parsed = JSON.parse(body);
        console.log(parsed);
      }

    })

    //console.log('\n' + 'Complete ' + '\n' + nm + '\n' + now + '\n' + latlon + '\n' + shortDesc + '\n' + url + '\n' + text);
    } else{
    //console.log('\n' + 'Incomplete ' + '\n' + nm + '\n' + now + '\n' + latlon + '\n' + shortDesc  + '\n' + url + '\n'  + text);
    }

  })
}

function geo(body, url){
  let $ = cheerio.load(body);
  let coord = $(".geo").html();
  if (coord){
    //console.log(url);
    coord = coord.toString();
    return(coord);
  } else{
    //lon is the negative number in US (geo[1])
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
