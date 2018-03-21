var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var nlp = require('compromise');

var data;
var readableStream = fs.createReadStream('./lists/test_short.txt');

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
          console.log("Gather Request " + err);
          return
      } else {
          var parsed = JSON.parse(body);

          if (parsed[3][0]) {
            //console.log(parsed[0]);
            resolve(parsed);
          } else {
            //console.log('nothing');
            resolve(null);
            //console.log(parsed[0]);
          }
        }
    })
  })
}

function scrape(parsed){
  if (parsed == null){
    return
  } else{
    //let url = 'https://en.wikipedia.org/wiki/Goose_Creek_Correctional_Center';
    let result = parsed[3][0];
    let nm = parsed[0];

    request(result, function(err, res, body){
      //console.log('****');
      if (err != null) {
          console.log("Scrape Request " + err);
          return
      } else {
          var $ = cheerio.load(body);
          let textList = $.text().split(/\n/);
          let wordList = [];
          //console.log(textList);
          for (var i = 0; i < textList.length; i++) {
            //console.log(textList[i]);
            //console.log(textList[i].length);
            if(textList[i].length > 100 && textList[i].includes('This article') == false && textList[i].includes('Coordinates') == false ){

              wordList.push(textList[i])

            }
          }
          let para = wordList[0].replace(/\[\d\]/g, '');
          fs.appendFileSync('scrape_article.csv', nm + ', ' + result + ', ' + para + '\n');
          //console.log(wordList);
          //console.log(para);
      }
    })
  }


}
