var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var nlp = require('compromise');

gather();

function gather(){
  let url = 'https://en.wikipedia.org/wiki/Chino_Mine';

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
