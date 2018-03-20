var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var nlp = require('compromise');

gather();

function gather(){
  let url = 'https://en.wikipedia.org/wiki/Greensville_Correctional_Center';

  request(url, function(err, res, body){
    console.log('Requesting');
    if (err != null) {
        console.log("Request " + err);
        return
    } else {
        var $ = cheerio.load(body);
        let wholeText = $.text();
        let textList = wholeText.split(/\n/);
        let wordList = [];

        for (var i = 0; i < textList.length; i++) {
          if(nlp(textList[i]).sentences().length > 1){
            wordList.push(textList[i])
          }
        }
        console.log(wordList);
    }
  })
}
