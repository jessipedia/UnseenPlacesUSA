var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var nlp = require('compromise');

//require('request-debug')(request);

var shortDesc = 'unseen place'

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
            //this is were you first find out if something has a wikipedia page
            //create incompletePlace here, data is not passed to next function
            //how does reolving a promise interact with side effects?
            let nm = parsed[0];
            console.log('\n' + 'Incomplete ' + '\n' + nm + '\n' + shortDesc);
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

          if (text && latlon){
            console.log('\n' + 'Complete ' + '\n' + nm + '\n' + latlon + '\n' + shortDesc + '\n' + url + '\n' + text);
          } else{
            console.log('\n' + 'Incomplete ' + '\n' + nm + '\n' + latlon + '\n' + shortDesc  + '\n' + url + '\n'  + text);
          }

          //console.log(latlon);
          //fs.appendFileSync('scrape.csv', nm + ', ' + url + ', ' + text + '\n');

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
