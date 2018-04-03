var url = "http://localhost:3000/api/places";
var placeData = [];
var stateShapes;

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
        console.log('wikipedia');
        let ref_link = document.createElement('a');
        ref_link.setAttribute("href", data[i].desc_source);
        ref_link.setAttribute("class", "text");
        ref_link.setAttribute("class", "link");
        ref_link.textContent = " Wikipedia"
        long_desc.appendChild(ref_link);
      }

      container.appendChild(box);

    }
}


function submit(){

  let loc = document.getElementById('dropdown').value;
  var search = document.getElementById('search').value;
  let placeUrl = "http://localhost:3000/api/places" + "?location=" + loc + "&search=" + search;

  let boxes = document.getElementsByClassName('box');
  for (var i = boxes.length - 1; i > -1 ; i--) {

  boxes[i].remove();

  }

  let json = loadJSON(placeUrl)
    json.then(result =>drawBoxes(result));
    json.then(result =>drawMarkers(result));
}
