var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var nlp = require('compromise');

//require('request-debug')(request);

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


      gather(strp)
        .then(result => scrape(result));
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
          return
      } else {
          var parsed = JSON.parse(body);

          if (parsed[3][0]) {
            resolve(parsed);
          } else {
            resolve(null);
          }
        }
    })
  })
}

function scrape(parsed){
  if (parsed == null){
    return
  } else{

    let url = parsed[3][0];
    let nm = parsed[0];

    let options = {
      uri: url,
      family: 4
    }

    request(options, function(err, res, body){

      if (err != null) {
          console.log("Scrape Request " + err + '\n' + '\t' + url);
          return
      } else {
          let text = longDesc(body);
          let latlon = geo(body, url);

          console.log(latlon);
          //previous version scraped name, geolocation

          fs.appendFileSync('scrape.csv', nm + ', ' + url + ', ' + text + '\n');

      }
    })
  }
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
    return(url);
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
