var url = "http://localhost:3000/api/places";
var placeData = [];

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
  //console.log(data);

  for (var i = 0; i < data.length; i++) {
    let id = data[i]._id;
    let cord = data[i].location.coordinates;
    placeData.push({id, cord});

    var container = document.getElementById('container');
    //console.log(data[i]._id);

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

    // let img = document.createElement('img');
    // img.setAttribute("src", "image.jpg");
    // img.setAttribute("class", "satImage");
    // boxBody.appendChild(img);

    let desc = document.createElement('p');
    desc.textContent = data[i].name + " is a/an " + data[i].description + ".";
    desc.setAttribute("class", "desc");
    boxBody.appendChild(desc);

    container.appendChild(box);
  }
  //console.log(placeData);
}

function submit(){
  let loc = document.getElementById('dropdown').value;
  let placeUrl = "http://localhost:3000/api/places" + "?location=" + loc;

  let boxes = document.getElementsByClassName('box');
  for (var i = boxes.length - 1; i > -1 ; i--) {
    console.log(boxes[i]);
    boxes[i].remove();

  }
  //boxes.remove();
  loadJSON(placeUrl)
    .then(result => drawBoxes(result));
  //console.log(boxes);
}
