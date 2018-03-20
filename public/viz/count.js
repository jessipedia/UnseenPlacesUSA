var placeData = "http://localhost:3000/api/places";

loadJSON(placeData)
  .then(result => drawBar(count(result)));

function loadJSON(url){
  return new Promise(resolve => {
    fetch(url)
      .then(res => res.json())
      .then(data => resolve(data));
  })
}

function count(data){
    console.log(data);
    var counted = new Map();

    counted.set('private state prison', 0);
    counted.set('state prison', 0);

    for (var i = 0; i < data.length; i++) {

      if (data[i].description.includes('private prison')){
        counted.set('private state prison', (counted.get('private state prison') + 1));
      } else if (data[i].description.includes('state prison')){
        counted.set('state prison', (counted.get('state prison') + 1));
      } else if (data[i].description.includes('juvenile prison')){
        counted.set('state prison', (counted.get('state prison') + 1));
      } else if (data[i].description.includes('work release')){
        counted.set('state prison', (counted.get('state prison') + 1));
      } else if (counted.has(data[i].description)){
        counted.set(data[i].description, (counted.get(data[i].description) + 1));
      } else{
          counted.set(data[i].description, 1);
      }
    }
    return counted;
}

function drawBar(data){
      var margin = {top: 0, right: 0, bottom: 0, left: 0};
      var barHeight = 20;
      var width = 1000 - margin.left - margin.right,
          height = ((barHeight + 12) * data.size) - margin.top - margin.bottom;

      var countBox = document.getElementById('countBox');

      var svgBox = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
      svgBox.setAttribute("width", width);
      svgBox.setAttribute("height", height);
      svgBox.setAttribute("id", "svgBox");

      countBox.appendChild(svgBox);

      var i = 1;
      data.forEach(drawData);

      function drawData(value, key){
        var lineSpacing = 30;
        var xValue = 250;

        var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
        text.textContent = key;
        text.setAttribute('x', xValue );
        text.setAttribute('y', (i * lineSpacing));
        text.setAttribute('text-anchor', 'end');
        text.setAttribute('class', 'barText');

        var bar = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        bar.setAttribute('x', xValue + 10);
        bar.setAttribute('y', ((i * lineSpacing) - (barHeight - 5)));
        bar.setAttribute("width", value);
        bar.setAttribute("height", barHeight);
        bar.setAttribute("class", 'bar');

        var num = document.createElementNS("http://www.w3.org/2000/svg", 'text');
        num.textContent = value;
        num.setAttribute('x', (xValue + value + 15));
        num.setAttribute('y', (i * lineSpacing));
        num.setAttribute('class', 'numText');

        svgBox.appendChild(text);
        svgBox.appendChild(bar);
        svgBox.appendChild(num);

        i = i + 1;
      }
}
