var url = "http://localhost:3000/api/places";
var myMap = L.map('map').setView([39.648734, -118.9761848], 2.5);
var myKey = config.MY_KEY;
var placeMarkers = [];

var myIcon = L.icon({
    iconUrl: 'placeMarker.png'
  })
//I do not understand this promise
fetch(url)
  .then(res => res.json())
  .then(data => {
    console.log('Checkout this JSON! ', data);
    for (var i = 0; i < data.length; i++) {
      placeMarker[i] = L.marker([data[i].location.coordinates[1], data[i].location.coordinates[0]], {icon: myIcon})
      placeMarker[i].addTo(myMap)
    }
  })

  .catch(err => { throw err });

  console.log('wow!');




L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: myKey
}).addTo(myMap);


function placeMarker(lat, lon){
  var lat = this.lat;
  var lon = this.lon;

  this.show = function(){
    L.marker([lat, lon]).addTo(myMap);
  }
}
