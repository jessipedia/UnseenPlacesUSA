var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var nlp = require('compromise');

var data;

var readableStream = fs.createReadStream('./lists/alaska_state_prisons.txt');

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

    request(wikiapi, function(err, res, body) {
      if (err != null) {
          //console.log("Request " + err);
          return
      } else {
          var parsed = JSON.parse(body);

          if (parsed[3][0]) {
            //console.log(parsed[3][0]);
            return parsed[3][0];
          } else {
            //console.log('nothing');
            return null
            //console.log(parsed[0]);
          }
        }
    })
  })
}

function scrape(url){
  console.log(url);

  // request(url, function(err, res, body){
  //   console.log('Requesting');
  //   if (err != null) {
  //       console.log("Request " + err);
  //       return
  //   } else {
  //       var $ = cheerio.load(body);
  //       let textList = $.text().split(/\n/);
  //       let wordList = [];
  //
  //       for (var i = 0; i < textList.length; i++) {
  //         if(nlp(textList[i]).sentences().length > 1){
  //           wordList.push(textList[i])
  //         }
  //       }
  //       let para = wordList[0].replace(/\[\d\]/g, '')
  //       console.log(para);
  //   }
  // })
}
