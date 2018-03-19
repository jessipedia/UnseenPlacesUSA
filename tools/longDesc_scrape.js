var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');

// var readableStream = fs.createReadStream('./lists/alaska_state_prisons.txt');
//
// readableStream.setEncoding('utf8');
//
// On event 'data', callback. What is event 'data'
// Can this be better written with Promises?
// readableStream.on('data', function(){
//   data += chunk;
// })
//
// readableStream.on('end', function(){
//   let list = data.split(',');
//
//   for (var i = 0; i < list.length; i++) {
//     let name = list[i];
//     let strp = list[i].trim;
//     strp = list[i].replace(/\([^)]*\)/, '');
//     strp = encodeURIComponent(strp);
//     gather(strp, name);
//   }
// })

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
        console.log($(".mw-parser-output").html());
    }
  })
}
