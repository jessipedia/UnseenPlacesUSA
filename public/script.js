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
  console.log(data);
  
}
