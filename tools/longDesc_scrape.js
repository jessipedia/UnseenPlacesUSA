var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var nlp = require('compromise');

gather();

function gather(){
  let url = 'https://en.wikipedia.org/wiki/Wild_Horse_Wind_Farm';

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

        console.log(nlp('This is a cat.').sentences());

        console.log(nlp('at').sentences());

        for (var i = 0; i < textList.length; i++) {
          //console.log(textList[i]);
          //nlp(textList[i]).sentences;
          //console.log('After');

          if (textList[i] == ''){

          } else if (textList[i].includes('\t'))  {

          } else {
            wordList.push(textList[i])
          }

        }
        //console.log(wordList);
    }
  })
}
