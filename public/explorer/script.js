var url = "/api/places";
var placeData = [];
let sliderStatus = 'closed';

var myMap = L.map('up-l-map_box', {preferCanvas: true, scrollWheelZoom: false}).setView([39.648734, -118.9761848], 2.5);
var myScale = L.control.scale().addTo(myMap)
var placesLayer = L.layerGroup();
var placeMarkers = [];

var myIcon = L.icon({
    iconUrl: 'placeMarker.png'
  })


fetch('/234598')
  .then(res => res.text())
  .then(text => drawTiles(text))
  .catch(err => { throw err });

loadJSON(url)
  .then(function(result){
    drawBoxes(result);
    drawMarkers(result);
  });

function loadJSON(url){
  return new Promise(resolve => {
    console.log('load JSON');
    fetch(url)
      .then(res => res.json())
      .then(data => resolve(data))
      .catch(err => { throw err });
  })
}



//Sidebar

function collapse(){
  let slider = document.getElementById('up-c-slider_body_container');
  //console.log(slider.classList);
  if (sliderStatus == 'closed'){
    slider.classList.remove("up-u-slider_body_closed");
    sliderStatus = 'open';
  } else {
    slider.setAttribute("class", "up-u-slider_body_closed");
    sliderStatus = 'closed';
  }

}

//Map

function drawTiles(res){
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.satellite',
      accessToken: res
  }).addTo(myMap);
}

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

//Placebxes

function drawBoxes(data){

    for (var i = 0; i < data.length; i++) {
      let avan = AvsAnSimple.query(data[i].short_desc);
      let id = data[i]._id;
      let cord = data[i].location.coordinates;
      let state = data[i].stusps;
      placeData.push({id, cord});

      var container = document.getElementById('up-l-places_container');

      let box = document.createElement('div');
      box.setAttribute("class", "up-c-placesbox "+ data[i]._id);

      let input = document.createElement('input');
      input.setAttribute("class", "up-c-placesbox_toggle");
      input.setAttribute("type", "checkbox");
      input.setAttribute("id", data[i]._id);
      input.setAttribute("value", "box");
      input.onclick = function(input){
        let thisCheckbox = document.getElementById(input.target.id);
        if (thisCheckbox.checked){
          let obj = placeData.filter(function(place){return place.id == input.target.id});
          let lon = obj[0].cord[0];
          let lat = obj[0].cord[1];
          myMap.flyTo([lat, lon], 15);
        }
      }
      box.appendChild(input);

      let label = document.createElement('label');
      label.setAttribute("class", "up-c-placesbox_checkbox_label");
      label.setAttribute("for", data[i]._id);
      box.appendChild(label);

      let placeNameHeader = document.createElement('h1');
      placeNameHeader.textContent = data[i].name;
      placeNameHeader.setAttribute("class", "up-c-placesbox_h1");
      label.appendChild(placeNameHeader);

      let boxBody = document.createElement('div');
      boxBody.setAttribute("class", "up-c-placesbox_body");
      box.appendChild(boxBody);

      let latlon = document.createElement('p');
      latlon.textContent = data[i].location.coordinates[1] + " , " + data[i].location.coordinates[0];
      latlon.setAttribute("class", "up-c-placesbox_text_latlon up-c-placesbox_text");
      boxBody.appendChild(latlon);

      let short_desc = document.createElement('p');
      short_desc.textContent = data[i].name + " is " + avan + " " + data[i].short_desc + ".";
      short_desc.setAttribute("class", "up-c-placesbox_text");
      boxBody.appendChild(short_desc);

      let long_desc = document.createElement('p');
      long_desc.textContent = data[i].long_desc;
      long_desc.setAttribute("class", "up-c-placesbox_text");
      boxBody.appendChild(long_desc);

      if (data[i].desc_source.includes('wikipedia')){
        let ref_link = document.createElement('a');
        ref_link.setAttribute("href", data[i].desc_source);
        ref_link.textContent = " Wikipedia"
        long_desc.appendChild(ref_link);
      }

      let line = document.createElement('div');
      line.setAttribute("class", "up-c-placesbox_divider_line");
      boxBody.appendChild(line);

      let refBox = document.createElement('div');
      boxBody.appendChild(refBox);

      let latlon_source = document.createElement('p');
      latlon_source.textContent = "Location Source: ";
      latlon_source.setAttribute("class", "up-c-placesbox_text up-c-placesbox_text_ref");
      refBox.appendChild(latlon_source);

      let latlon_link = document.createElement('a');
      latlon_link.setAttribute("href", data[i].loc_source);
      latlon_link.setAttribute("class", "up-c-placesbox_text up-c-placesbox_text_ref");
      latlon_link.textContent = data[i].loc_source;
      latlon_source.appendChild(latlon_link);

      let desc_source = document.createElement('p');
      desc_source.textContent = "Description Source: ";
      desc_source.setAttribute("class", "up-c-placesbox_text up-c-placesbox_text_ref");
      refBox.appendChild(desc_source);

      let desc_link = document.createElement('a');
      desc_link.setAttribute("href", data[i].desc_source);
      desc_link.setAttribute("class", "up-c-placesbox_text up-c-placesbox_text_ref");
      desc_link.textContent = data[i].desc_source;
      desc_source.appendChild(desc_link);

      let lastUpdate = document.createElement('p');
      lastUpdate.textContent = "Data last updated: " + data[i].updated;
      lastUpdate.setAttribute("class", "up-c-placesbox_text up-c-placesbox_text_ref");
      refBox.appendChild(lastUpdate);

      container.appendChild(box);

    }
}

function submit(){

  let loc = document.getElementById('dropdown').value;
  var search = document.getElementById('search').value;
  let placeUrl = url + "?location=" + loc + "&search=" + search;

  let boxes = document.getElementsByClassName('box');
  for (var i = boxes.length - 1; i > -1 ; i--) {
  boxes[i].remove();
  }

  let json = loadJSON(placeUrl)
    json.then(result =>drawBoxes(result));
    json.then(result =>drawMarkers(result));
}
