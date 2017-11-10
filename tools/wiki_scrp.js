var fs = require('fs');
var scrapy = require('node-scrapy');
var request = require('request');

var readableStream = fs.createReadStream('./lists/gold_mine.txt');
var desc = "gold mine";
var data = '';
readableStream.setEncoding('utf8');

var model = {
    'name': '.firstHeading',
    'geo': {
        selector: '.geo',
        unique: true
    },
};

readableStream.on('data', function(chunk) {
    data += chunk;
});

readableStream.on('end', function() {
    var list = data.split(',');

    for (var i = 0; i < list.length; i++) {
        var name = list[i];
        var strp = list[i].trim();
        strp = list[i].replace(/\([^)]*\)/, '');
        strp = encodeURIComponent(strp);
        //console.log(strp);
        gather(strp, name);

    }
})

function gather(place, nm) {

  var wikiapi = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=' +
      '&search=' + place;

    request(wikiapi, function(err, res, body) {
        if (err != null) {
            console.log("Request " + err);
        } else {
            var parsed = JSON.parse(body);
            if (!parsed[3]) {
                return
            }
            var url = parsed[3][0];
            //console.log(parsed)
            //fs.appendFile('log.txt', parsed);
            //console.log(url);


            scrapy.scrape(url, model, function(err, data) {
                if (err) {
                    console.log(nm);
                    console.log(wikiapi);
                    fs.appendFile('broken.txt', nm);
                    //console.error("Scrape " + err + " " + url);
                    return
                }

                var json = JSON.stringify(data, null, 2);
                var parsed = JSON.parse(json);


                if (parsed.geo != null) {
                    var latlon = parsed.geo.split(';');
                    //remove the space
                    latlon[1] = latlon[1].replace(/\s/, '');
                    parsed.description = desc;
                    parsed.location = {type: "Point", coordinates: []}
                    //longitude
                    parsed.location.coordinates[0] = latlon[1];
                    //latitude
                    parsed.location.coordinates[1] = latlon[0];
                    parsed.source = url;

                } else {
                    return
                }

                delete parsed.geo;

                var rejson = JSON.stringify(parsed, null, 2);
                //console.log(rejson);

                fs.appendFile('./json/gold_mine.json', '\n\n' + rejson + ',', finished);

                function finished(err) {

                }
            })

        }
    })
}
