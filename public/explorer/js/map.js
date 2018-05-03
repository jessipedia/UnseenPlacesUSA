//Draw tiles and reset map center and zoom for leaflet.js
const myMap = L.map('up-l-map_box', {preferCanvas: true, scrollWheelZoom: false}).setView([39.648734, -118.9761848], 2.5);
const placesLayer = L.layerGroup();
const myIcon = L.icon({
    iconUrl: 'img/placeMarker.png'
  })


  function drawTiles(res){
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.satellite',
        accessToken: res
    }).addTo(myMap);
  }

  function resetMap(data){

    let latSum = 0;
    let lonSum = 0;
    let westMostLon = 100;
    let eastMostLon = -200;

    //Remove placesLayer, if it exists
    placesLayer.eachLayer(function (layer) {
      layer.remove();
    });

    //finlethe eastmost and westmost places and calculate the latsum and lonsum and create a marker point
    for (let i = 0; i < data.length; i++) {

      //Find sums of lat and lon
      latSum = locSum(data[i].location.coordinates[1], latSum);
      lonSum = locSum(data[i].location.coordinates[0], lonSum);

      //Find east and west most locations
      eastMostLon = findMost('east', data[i].location.coordinates[0], eastMostLon);
      westMostLon = findMost('west', data[i].location.coordinates[0], westMostLon);

      //Add a marker to the placesLayer
      addMarker(data[i].location.coordinates[0], data[i].location.coordinates[1], data[i]._id, data[i].name);

    }

    let zoom = findZoomLevel(westMostLon, eastMostLon);

    //flyto the calculated center of the group of places, at the calculated zoom level
    myMap.flyTo([latSum/data.length, lonSum/data.length], zoom)
    //Add placesLayer to map
    placesLayer.addTo(myMap);
  }


//Helper functions
  function findMost(dir, lon, val){
    switch (dir) {
      case 'east':
        if (lon > val){
          return lon
        } else {
          return val
        }
        break;
      case 'west':
        if (lon < val){
          return lon
        } else {
          return val
        }
        break;
    }
  }

  function locSum(loc, sum){
    return loc + sum;
  }

  function findZoomLevel(w,e){
    let diff = Math.abs(w - e);

    if (diff>=50){
      return 2.5;
    }else if (diff >= 30 && diff < 50 ) {
      return 4;
    }else if (diff >= 10 && diff < 30 ) {
      return 6;
    }else {
      return 7;
    }
  }

  function addMarker(lat, lon, id, name){
    let marker = L.marker([lon, lat], {icon: myIcon});
    marker._id = id;
    marker.name = name;
    marker.addTo(placesLayer).on('click', onClick);
  }
