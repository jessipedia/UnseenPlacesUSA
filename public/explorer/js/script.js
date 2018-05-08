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

// function testOpen(e){
//   console.log(e);
// }


//Place Container
//Refactor to clone from HTML instead of building from nothing
function drawBoxes(data){

    for (var i = 0; i < data.length; i++) {
      let avan = AvsAnSimple.query(data[i].short_desc);
      let id = data[i]._id;
      let cord = data[i].location.coordinates;
      let state = data[i].stusps;
      placeData.push({id, cord});

      var container = document.getElementById('up-l-places_container');

      let newBox = document.getElementById("template").cloneNode([true]);
      newBox.removeAttribute("hidden");
      newBox.setAttribute("id", data[i]._id);
      newBox.onclick = function(e){
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

      let h1 = newBox.getElementsByTagName("h1")[0];
      h1.textContent = data[i].name;

      let boxBody = newBox.getElementsByTagName("div")[0];

      let latlon = boxBody.getElementsByTagName("p")[0];
      latlon.textContent = data[i].location.coordinates[1] + " , " + data[i].location.coordinates[0];

      let short_desc = boxBody.getElementsByTagName("p")[1];
      short_desc.textContent = data[i].name + " is " + avan + " " + data[i].short_desc + ".";

      let long_desc = boxBody.getElementsByTagName("p")[2];
      long_desc.textContent = data[i].long_desc;

      if (data[i].desc_source.includes('wikipedia')){
        let ref_link = document.createElement('a');
        ref_link.setAttribute("href", data[i].desc_source);
        ref_link.textContent = " Wikipedia"
        long_desc.appendChild(ref_link);
      }

      let refBox = newBox.getElementsByTagName("div")[2];

      let latlon_link = refBox.getElementsByTagName("p")[0].getElementsByTagName("a")[0];
      latlon_link.setAttribute("href", data[i].loc_source);
      latlon_link.textContent = data[i].loc_source;

      let desc_link = refBox.getElementsByTagName("p")[1].getElementsByTagName("a")[0];
      desc_link.setAttribute("href", data[i].desc_source);
      desc_link.textContent = data[i].desc_source;

      let lastUpdate = refBox.getElementsByTagName("p")[2];
      lastUpdate.textContent = "Data last updated: " + data[i].updated;

      container.appendChild(newBox);
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
