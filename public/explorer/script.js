var url = "http://localhost:3000/api/places";
var placeData = [];
var stateShapes;
let sliderStatus = 'closed';



loadJSON(url)
  .then(result => drawBoxes(result));

function loadJSON(url){
  return new Promise(resolve => {
    fetch(url)
      .then(res => res.json())
      .then(data => resolve(data))
      .catch(err => { throw err });
  })
}

function collapse(){
  let slider = document.getElementById('sliderBody');
  //console.log(slider.classList);
  if (sliderStatus == 'closed'){
    slider.classList.remove("sliderClosed");
    sliderStatus = 'open';
  } else {
    slider.setAttribute("class", "sliderClosed");
    sliderStatus = 'closed';
  }

}


function drawBoxes(data){

    for (var i = 0; i < data.length; i++) {
      let avan = AvsAnSimple.query(data[i].short_desc);
      let id = data[i]._id;
      let cord = data[i].location.coordinates;
      let state = data[i].stusps;
      placeData.push({id, cord});

      var container = document.getElementById('container');

      let box = document.createElement('div');
      box.setAttribute("class", "box "+ data[i]._id);

      let input = document.createElement('input');
      input.setAttribute("class", "toggle");
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
      label.setAttribute("class", "labelHeader");
      label.setAttribute("for", data[i]._id);
      box.appendChild(label);

      let placeNameHeader = document.createElement('h1');
      placeNameHeader.textContent = data[i].name;
      placeNameHeader.setAttribute("class", "placeNameHeader");
      label.appendChild(placeNameHeader);

      let boxBody = document.createElement('div');
      boxBody.setAttribute("class", "boxBody");
      box.appendChild(boxBody);

      let latlon = document.createElement('p');
      latlon.textContent = data[i].location.coordinates[1] + " , " + data[i].location.coordinates[0];
      latlon.setAttribute("class", "latlon text");
      // latlon.setAttribute("class", "desc");
      // latlon.setAttribute("class", "text");
      boxBody.appendChild(latlon);

      let short_desc = document.createElement('p');
      short_desc.textContent = data[i].name + " is " + avan + " " + data[i].short_desc + ".";
      short_desc.setAttribute("class", "desc");
      short_desc.setAttribute("class", "text");
      boxBody.appendChild(short_desc);

      let long_desc = document.createElement('p');
      long_desc.textContent = data[i].long_desc;
      long_desc.setAttribute("class", "desc");
      long_desc.setAttribute("class", "text");
      boxBody.appendChild(long_desc);

      if (data[i].desc_source.includes('wikipedia')){
        let ref_link = document.createElement('a');
        ref_link.setAttribute("href", data[i].desc_source);
        ref_link.setAttribute("class", "text");
        ref_link.setAttribute("class", "link");
        ref_link.textContent = " Wikipedia"
        long_desc.appendChild(ref_link);
      }

      let line = document.createElement('div');
      line.setAttribute("class", "hline-bottom");
      boxBody.appendChild(line);

      let refBox = document.createElement('div');
      refBox.setAttribute("class", "refBox");
      boxBody.appendChild(refBox);

      let latlon_source = document.createElement('p');
      latlon_source.textContent = "Location Source: ";
      latlon_source.setAttribute("class", "text ref");
      refBox.appendChild(latlon_source);

      let latlon_link = document.createElement('a');
      latlon_link.setAttribute("href", data[i].loc_source);
      latlon_link.setAttribute("class", "text ref link");
      latlon_link.textContent = data[i].loc_source;
      latlon_source.appendChild(latlon_link);

      let desc_source = document.createElement('p');
      desc_source.textContent = "Description Source: ";
      desc_source.setAttribute("class", "text ref");
      refBox.appendChild(desc_source);

      let desc_link = document.createElement('a');
      desc_link.setAttribute("href", data[i].desc_source);
      desc_link.setAttribute("class", "text ref link");
      desc_link.textContent = data[i].desc_source;
      desc_source.appendChild(desc_link);

      let lastUpdate = document.createElement('p');
      lastUpdate.textContent = "Data last updated: " + data[i].updated;
      lastUpdate.setAttribute("class", "text ref");
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
