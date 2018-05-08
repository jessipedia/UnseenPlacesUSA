//JS for

const url = "/api/places";
const placeData = [];

let sliderStatus = 'closed';

fetch('/key')
  .then(res => res.text())
  .then(text => drawTiles(text))
  .catch(err => { throw err });

loadJSON(url)
  .then(function(result){
    drawBoxes(result);
    resetMap(result);
  });

function loadJSON(url){
  return new Promise(resolve => {
    fetch(url)
      .then(res => res.json())
      .then(data => resolve(data))
      .catch(err => { throw err });
  })
}

//Sidebar

function collapse(){
  let slider = document.getElementById('up-c-slider_body_container');

  if (sliderStatus == 'closed'){
    slider.classList.remove("up-u-slider_body_closed");
    sliderStatus = 'open';
  } else {
    slider.setAttribute("class", "up-u-slider_body_closed");
    sliderStatus = 'closed';
  }

}

function onClick(){
  let place = document.getElementById(this._id);
  place.checked = true;
  let boxes = document.getElementsByClassName(this._id);
  let box = boxes[0];
  box.scrollIntoView({behavior:"smooth"});
  myMap.flyTo([this._latlng.lat, this._latlng.lng], 15);
}

function testOpen(e){
  console.log(e);
}


//Place Container
//Refactor to clone from HTML instead of building from nothing
function drawBoxes(data){

let copy = document.getElementById("template");
console.log(copy);

    for (var i = 0; i < data.length; i++) {
      let avan = AvsAnSimple.query(data[i].short_desc);
      let id = data[i]._id;
      let cord = data[i].location.coordinates;
      let state = data[i].stusps;
      placeData.push({id, cord});

      var container = document.getElementById('up-l-places_container');

      let box = document.createElement('div');
      box.setAttribute("class", "up-c-placesbox ");
      box.setAttribute("tabindex", "0");
      box.onclick = function(e){
        let boxBody = e.target.parentElement.children[1];
        if(boxBody.getAttribute("hidden") == null){
          boxBody.setAttribute("hidden", "true");
          boxBody.setAttribute("class", "up-c-placesbox_body");
        } else {
          boxBody.removeAttribute("hidden");
          boxBody.setAttribute("class", "up-c-placesbox_body up-c-placesbox_body_shown");
          console.log(e.path[0].id);
          let obj = placeData.filter(function(place){return place.id == e.path[0].id});
          console.log(obj);
          let lon = obj[0].cord[0];
          let lat = obj[0].cord[1];
          myMap.flyTo([lat, lon], 15);
        }
      }

      let placeNameHeader = document.createElement('h1');
      placeNameHeader.textContent = data[i].name;
      placeNameHeader.setAttribute("id", data[i]._id);
      placeNameHeader.setAttribute("class", "up-c-placesbox_h1");
      box.appendChild(placeNameHeader);

      let boxBody = document.createElement('div');
      boxBody.setAttribute("class", "up-c-placesbox_body");
      boxBody.setAttribute("hidden", "true")
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
  let search = document.getElementById('search').value;
  let placeUrl = url + "?location=" + loc + "&search=" + search;

  let boxes = document.getElementsByClassName('box');
  for (var i = boxes.length - 1; i > -1 ; i--) {
  boxes[i].remove();
  }

  let json = loadJSON(placeUrl)
    json.then(result =>drawBoxes(result));
    json.then(result =>resetMap(result));
}
