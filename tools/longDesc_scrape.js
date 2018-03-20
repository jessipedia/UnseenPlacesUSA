var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var nlp = require('compromise');

var data;

var readableStream = fs.createReadStream('./lists/florida_state_prisons.txt');

readableStream.setEncoding('utf8');

readableStream.on('data', function(chunk) {
    data += chunk;
});

readableStream.on('end', function() {
   let list = data.split(',');
   //console.log(list);
   let listFix = [];

  for (var i = 0; i < list.length; i++) {
      //console.log(list[i]);
      counter = i;
      var name = list[i].trim();
      name = name.replace(/undefined/, '');
      var strp = list[i].trim();
      strp = list[i].replace(/\([^)]*\)/, '');
      strp = encodeURIComponent(strp);
      //console.log(strp);
      //console.log(name);
      listFix.push(name);

  }
  console.log(listFix);
});

gather();

function gather(place, nm){
  let url = 'https://en.wikipedia.org/wiki/John_M._Sully';

  request(url, function(err, res, body){
    console.log('Requesting');
    if (err != null) {
        console.log("Request " + err);
        return
    } else {
        var $ = cheerio.load(body);
        let textList = $.text().split(/\n/);
        let wordList = [];

        for (var i = 0; i < textList.length; i++) {
          if(nlp(textList[i]).sentences().length > 1){
            wordList.push(textList[i])
          }
        }
        let para = wordList[0].replace(/\[\d\]/g, '')
        console.log(para);
    }
  })
}
