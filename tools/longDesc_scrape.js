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

        // let word = nlp('swim');
        // word.verbs().conjugation();
        // console.log(word.verbs().conjugate());
        //
        // let doc = nlp('a bottle of beer on the wall.')
        // doc.nouns(0).toPlural()
        // console.log(doc.out('text'));
        //
        // console.log(nlp('32°47′30″N 108°04′02″W﻿ / ﻿32.7917425°N 108.0672635°W﻿ / 32.7917425; -108.0672635Coordinates: 32°47′30″N 108°04′02″W﻿ / ﻿32.7917425°N 108.0672635°W﻿ / 32.7917425; -108.0672635').sentences().length);

        for (var i = 0; i < textList.length; i++) {
          // console.log(textList[i]);
          // console.log(nlp(textList[i]).sentences().length);
          //let length = ;
          if(nlp(textList[i]).sentences().length > 1){
            wordList.push(textList[i])
          }


          // if (textList[i] == ''){
          //
          // } else if (textList[i].includes('\t'))  {
          //
          // } else {
          //   wordList.push(textList[i])
          // }

        }
        console.log(wordList);
    }
  })
}
