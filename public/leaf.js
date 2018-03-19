var url = "http://localhost:3000/api/places";
var myMap = L.map('map', {preferCanvas: true, scrollWheelZoom: false}).setView([39.648734, -118.9761848], 2.5);
var myKey = config.MY_KEY;
var myScale = L.control.scale().addTo(myMap)
var placesLayer = L.layerGroup();
var placeMarkers = [];

var myIcon = L.icon({
    iconUrl: 'placeMarker.png'
  })
//I do not understand this promise
fetch(url)
  .then(res => res.json())
  .then(data => drawMarkers(data))
  .catch(err => { throw err });

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.satellite',
    accessToken: myKey
}).addTo(myMap);

function drawMarkers(data){
  placesLayer.eachLayer(function (layer) {
    layer.remove();
  });

  let latSum = 0;
  let lonSum = 0;
  let westMostLon = 100;
  let eastMostLon = -200;
  let smallestLonName;
  let biggestLonName;

  for (var i = 0; i < data.length; i++) {
    lonSum = lonSum + data[i].location.coordinates[0];
    latSum = latSum + data[i].location.coordinates[1];

    if (data[i].location.coordinates[0] < westMostLon){
      westMostLon = data[i].location.coordinates[0];
      smallestLonName = data[i].name;
    }

    if (data[i].location.coordinates[0] > eastMostLon){
      eastMostLon = data[i].location.coordinates[0];
      biggestLonName = data[i].name;
  }


  let marker = L.marker([data[i].location.coordinates[1], data[i].location.coordinates[0]], {icon: myIcon});
  marker._id = data[i]._id;
  marker.name = data[i].name;
  marker.addTo(placesLayer).on('click', onClick);
  }
  
  function diff(w,e){
    return Math.abs(w - e);
  }

  let diffNum = diff(westMostLon,eastMostLon);

  function zoomLevel(diffNum){
    if (diffNum>=50){
      return 2.5;
    }else if (diffNum >= 30 && diffNum < 50 ) {
      return 4;
    }else if (diffNum >= 10 && diffNum < 30 ) {
      return 6;
    }else {
      return 7;
    }
  }

  let zoom = zoomLevel(diffNum);

  myMap.flyTo([latSum/data.length, lonSum/data.length], zoom)
  placesLayer.addTo(myMap);
}


function onClick(){
  let place = document.getElementById(this._id);
  place.checked = true;
  let boxes = document.getElementsByClassName(this._id);
  let box = boxes[0];
  box.scrollIntoView({behavior:"smooth"});

  myMap.flyTo([this._latlng.lat, this._latlng.lng], 15);
}
