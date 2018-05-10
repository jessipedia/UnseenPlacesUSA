/* JS for drawing and interacting with non-map elements */

const url = "/api/places";

loadPlaces(url);

fetch('/key')
  .then(res => res.text())
  .then(text => drawTiles(text))
  .catch(err => { throw err });


/* Helper functions */

function loadPlaces(u){
  loadJSON(u)
    .then(function(result){
      drawBoxes(result);
      resetMap(result);
    });
}

function loadJSON(url){
  return new Promise(resolve => {
    fetch(url)
      .then(res => res.json())
      .then(data => resolve(data))
      .catch(err => { throw err });
  })
}

function removeBoxes(){
  const boxes = document.getElementsByClassName('up-c-placesbox');
  for (let i = boxes.length - 1; i > -1 ; i--) {
  boxes[i].remove();
  }
}

/* Sidebar */

function collapse(){
  const slider = document.getElementById('up-c-slider_body_container');

  if (slider.classList.length == 0){
    slider.setAttribute("class", "up-u-slider_body_closed");
  } else {
    slider.classList.remove("up-u-slider_body_closed");
  }

}

/* Map */

//Flyto point and scroll to view placebox when clicking on point
function onClick(){
  const placebox = document.getElementById(this._id);
  placebox.scrollIntoView({behavior:"smooth"});
  const placeboxBody = placebox.getElementsByTagName("div")[0];
  placeboxBody.removeAttribute("hidden");
  placeboxBody.setAttribute("class", "up-c-placesbox_body up-c-placesbox_body_shown");
  myMap.flyTo([this._latlng.lat, this._latlng.lng], 15);
}

/* Place Container */

//Draw location boxes
function popUp(){
  // if (e.type == 'keydown' && e.key !=  'Enter'){
  //   return
  // }

  let dialog = document.getElementById('up-c-infodialog');
  let button = document.getElementById('up-c-infodialog_button');
  dialog.showModal();

  button.addEventListener('click', function() {
    dialog.close();
  })
}


function drawBoxes(data){

    for (let i = 0; i < data.length; i++) {
      const avan = AvsAnSimple.query(data[i].short_desc);
      const container = document.getElementById('up-l-places_container');

      //select hidden box template and update elements
      const newBox = document.getElementById("template").cloneNode([true]);
      newBox.removeAttribute("hidden");
      newBox.setAttribute("id", data[i]._id);
      newBox.setAttribute("class", "up-c-placesbox");

      //update h1 elements, Add eventhandelers for mouse and keyboard
      const h1 = newBox.getElementsByTagName("h1")[0];
      h1.textContent = data[i].name;
      h1.onclick = boxToggle;
      h1.onkeydown = boxToggle;

      //select and update placesbox_body elements
      const boxBody = newBox.getElementsByTagName("div")[0];

      const latlon = boxBody.getElementsByTagName("p")[0];
      latlon.textContent = data[i].location.coordinates[1] + " , " + data[i].location.coordinates[0];

      const short_desc = boxBody.getElementsByTagName("p")[1];
      short_desc.textContent = data[i].name + " is " + avan + " " + data[i].short_desc + ".";

      const long_desc = boxBody.getElementsByTagName("p")[2];
      long_desc.textContent = data[i].long_desc;

      if (data[i].desc_source.includes('wikipedia')){
        const ref_link = document.createElement('a');
        ref_link.setAttribute("href", data[i].desc_source);
        ref_link.textContent = " Wikipedia"
        long_desc.appendChild(ref_link);
      }

      //select and update placesbox_refbox elements
      const refBox = newBox.getElementsByTagName("div")[2];

      const latlon_link = refBox.getElementsByTagName("p")[0].getElementsByTagName("a")[0];
      latlon_link.setAttribute("href", data[i].loc_source);
      latlon_link.textContent = data[i].loc_source;

      const desc_link = refBox.getElementsByTagName("p")[1].getElementsByTagName("a")[0];
      desc_link.setAttribute("href", data[i].desc_source);
      desc_link.textContent = data[i].desc_source;

      const lastUpdate = refBox.getElementsByTagName("p")[2];
      lastUpdate.textContent = "Data last updated: " + data[i].updated;

      //Append new location box to the document
      container.appendChild(newBox);
    }
}


//Open & Close the placesbox_body
function boxToggle(e){
  //keyboard toggle only works with enter key
  if (e.type == 'keydown' && e.key !=  'Enter'){
    return
  }
  //select placesbox_body element
  const targetElement = e.target.parentElement.children[1];

      if(targetElement.getAttribute("hidden") == null){
        //if not hidden, hide the placesbox_body
        targetElement.setAttribute("hidden", "true");
        targetElement.setAttribute("class", "up-c-placesbox_body");
      } else {
        //if hidden, show placesbox_body
        targetElement.removeAttribute("hidden");
        targetElement.setAttribute("class", "up-c-placesbox_body up-c-placesbox_body_shown");

        //flyto placesbox_body latlon location on the map
        //using existing element data
        const targetLatLon = targetElement.getElementsByTagName("p")[0].textContent;
        const arrayLatLon = targetLatLon.split(',');
        const lat = arrayLatLon[0].replace(/\s/g,'');
        const lon = arrayLatLon[1].replace(/\s/g,'');
        myMap.flyTo([lat, lon], 15);
      }
  }

//Search function in controls
function submit(){
  const loc = document.getElementById('up-c-dropdown_elem').value;
  const search = document.getElementById('up-c-search_elem').value;
  const placeUrl = url + "?location=" + loc + "&search=" + search;

  removeBoxes();
  loadPlaces(placeUrl);
}
