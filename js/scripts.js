
var toastType = Object.freeze({"info":1, "error":2});
var data = {};
var stack = [];
var canvas = document.getElementById('c');
var ctx = canvas.getContext('2d');

data = {"vertices":[{"x":0.3,"y":0.3},{"x":0.3,"y":0.6},{"x":0.6,"y":0.6},{"x":0.4,"y":0.4},{"x":0.6,"y":0.3}],"eye":{"x":0.44,"y":0.37}}; // OK
data = {"vertices":[{"x":0.3,"y":0.3},{"x":0.3,"y":0.6},{"x":0.6,"y":0.6},{"x":0.4,"y":0.4},{"x":0.6,"y":0.3}],"eye":{"x":0.35,"y":0.39}}; // OK
data = {"vertices":[{"x":0.3,"y":0.3},{"x":0.3,"y":0.6},{"x":0.6,"y":0.6},{"x":0.4,"y":0.4},{"x":0.6,"y":0.3}],"eye":{"x":0.40,"y":0.50}}; // OK
data = {"vertices":[{"x":0.3,"y":0.3},{"x":0.3,"y":0.6},{"x":0.6,"y":0.6},{"x":0.4,"y":0.4},{"x":0.6,"y":0.3}],"eye":{"x":0.55,"y":0.32}}; // OK
data = {"vertices":[{"x":0.35,"y":0.09},{"x":0.32,"y":0.45},{"x":0.79,"y":0.27},{"x":0.57,"y":0.08},{"x":0.48,"y":0.22}],"eye":{"x":0.59,"y":0.26}} // OK
data = {"vertices":[{"x":0.35,"y":0.09},{"x":0.32,"y":0.45},{"x":0.79,"y":0.27},{"x":0.57,"y":0.08},{"x":0.48,"y":0.22}],"eye":{"x":0.49,"y":0.28}} // OK
data = {"vertices":[{"x":0.45,"y":0.15},{"x":0.40,"y":0.40},{"x":0.20,"y":0.30},{"x":0.35,"y":0.50},{"x":0.25,"y":0.75},{"x":0.45,"y":0.60},{"x":0.70,"y":0.75},{"x":0.55,"y":0.50},{"x":0.70,"y":0.30},{"x":0.50,"y":0.40}],"eye":{"x":0.35,"y":0.42}}

canvas.addEventListener('click', onCanvasClick, true);

function onCanvasClick(event) {

  let mode = $('input[name=mode]:checked').val();

  if(mode == 1) {
    if(!data.vertices) data.vertices = [];
    data.vertices.push({x: event.clientX/canvas.width, y: event.clientY/canvas.height});
  }

  if(mode == 2) {
    data.eye = {x: event.clientX/canvas.width, y: event.clientY/canvas.height};
  }

  drawCanvas();
}

function eyeInsidePolygon() {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = data.eye.x, y = data.eye.y;

    var inside = false;
    for (var i = 0, j = data.vertices.length - 1; i < data.vertices.length; j = i++) {
        var xi = data.vertices[i].x, yi = data.vertices[i].y;
        var xj = data.vertices[j].x, yj = data.vertices[j].y;

        var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}

function clearCanvas() {
  data = {};
  stack = [];

  document.getElementById("r1").checked = true;

  drawCanvas();
}

function drawCanvas() {

  console.clear();

  if(data.eye && data.vertices && data.vertices.length >= 3) {
    if(eyeInsidePolygon()) {
      let start = performance.now();
      calculateVisibility();
      let end = performance.now();
      document.getElementById("statsCalc").innerHTML = Math.ceil(end - start)+"ms";
    } else {
      toast("Eye outside polygon!", toastType.error);
      document.getElementById("statsCalc").innerHTML = "---";
    }
  }

  let start = performance.now();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if(stack) {
    ctx.fillStyle = '#ff0';
    ctx.beginPath();
    stack.forEach(function(vertex, i) {
      if(i == 0) {
        ctx.moveTo(vertex.x*window.innerWidth, vertex.y*window.innerHeight);
      } else {
        ctx.lineTo(vertex.x*window.innerWidth, vertex.y*window.innerHeight);
      }
    });
    ctx.closePath();
    ctx.fill();
  }

  if(data.vertices) {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 0]);
    ctx.beginPath();
    data.vertices.forEach(function(vertex, i) {
      if(i == 0) {
        ctx.moveTo(vertex.x*window.innerWidth, vertex.y*window.innerHeight);
      } else {
        ctx.lineTo(vertex.x*window.innerWidth, vertex.y*window.innerHeight);
      }
    });
    ctx.closePath();
    ctx.stroke();
  }

  if(data.eye) {
    ctx.fillStyle = '#f00';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(data.eye.x*window.innerWidth, data.eye.y*window.innerHeight, 5, 0, 2 * Math.PI, true);
    ctx.fill();
    ctx.stroke();
  }

  if(document.getElementById("checkboxDebug").checked && stack) {
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth=4;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    stack.forEach(function(vertex, i) {
      if(i == 0) {
        ctx.moveTo(vertex.x*window.innerWidth, vertex.y*window.innerHeight);
      } else {
        ctx.lineTo(vertex.x*window.innerWidth, vertex.y*window.innerHeight);
      }
    });
    ctx.closePath();
    ctx.stroke();
  }

  if(document.getElementById("checkboxCoords").checked) {
    ctx.strokeStyle = 'white';
    ctx.font = "1rem Arial Narrow";
    ctx.lineWidth = 1;
    ctx.fillStyle = 'red';
    if(data.eye) {
      var txt = "("+data.eye.x.toFixed(2)+","+data.eye.y.toFixed(2)+")";
      ctx.strokeText(txt, data.eye.x*window.innerWidth-ctx.measureText(txt).width/2, data.eye.y*window.innerHeight-10);
      ctx.fillText(txt, data.eye.x*window.innerWidth-ctx.measureText(txt).width/2, data.eye.y*window.innerHeight-10);
    }

    if(data.vertices) {
      data.vertices.forEach(function(vertex) {
        ctx.fillStyle = 'black';
        var txt = "("+vertex.x.toFixed(2)+","+vertex.y.toFixed(2)+")";
        //ctx.strokeText(txt, vertex.x*window.innerWidth-ctx.measureText(txt).width/2, vertex.y*window.innerHeight-5);
        ctx.fillText(txt, vertex.x*window.innerWidth-ctx.measureText(txt).width/2, vertex.y*window.innerHeight-5);
      });
    }

    ctx.fillStyle = 'orange';
    if(stack) {
      stack.forEach(function(vertex) {
        var txt = "("+vertex.x.toFixed(2)+","+vertex.y.toFixed(2)+")";
        //ctx.strokeText(txt, vertex.x*window.innerWidth-ctx.measureText(txt).width/2, vertex.y*window.innerHeight-5);
        ctx.fillText(txt, vertex.x*window.innerWidth-ctx.measureText(txt).width/2, vertex.y*window.innerHeight-5);
      });
    }

    var vertex = data.vertices[getClosestVisibleVertex()];
    ctx.fillStyle = 'red';
    var txt = "("+vertex.x.toFixed(2)+","+vertex.y.toFixed(2)+")";
    //ctx.strokeText(txt, vertex.x*window.innerWidth-ctx.measureText(txt).width/2, vertex.y*window.innerHeight-5);
    ctx.fillText(txt, vertex.x*window.innerWidth-ctx.measureText(txt).width/2, vertex.y*window.innerHeight-5);
  }

  let end = performance.now();
  document.getElementById("statsDraw").innerHTML = Math.ceil(end - start)+"ms";
}

$('input[type=checkbox]').change(function() { // while you're at it listen for change rather than click, this is in case something else modifies the checkbox
  drawCanvas();
});

function resizeCanvasToDisplaySize() {
  canvas.setAttribute('width', window.innerWidth);
  canvas.setAttribute('height', window.innerHeight);

  drawCanvas();
}

window.addEventListener('resize', function(event) {
  resizeCanvasToDisplaySize();
});
resizeCanvasToDisplaySize();

function showModal(e) {
  if(e == 'import') {
    document.getElementById("import").style.display = "block";
    document.getElementById("textareaImport").value = "";
    document.getElementById("textareaImport").focus();
  } else {
    document.getElementById("export").style.display = "block";
    let textareaExport = document.getElementById("textareaExport");
    textareaExport.innerHTML = JSON.stringify(data);
    textareaExport.select();
    document.execCommand("Copy");
    toast("Data copied to clipboard!", toastType.info);
  }
  document.getElementById("modalBackground").style.display = "block";
}

function closeModal() {
  document.getElementById("import").style.display = "none";
  document.getElementById("export").style.display = "none";
  document.getElementById("modalBackground").style.display = "none";
}

function onClickImportPolygon() {
  try {
    data = JSON.parse(document.getElementById("textareaImport").value);
  } catch (e) {
    toast("Could not parse imported data.", toastType.error);
  }

  drawCanvas();
  closeModal();
}

function toast(message, type) {
  let div = document.createElement('div');

  div.innerHTML = message;

  if(type == toastType.info) {
    div.className = "info";
  }
  if(type == toastType.error) {
    div.className = "error";
  }

  document.getElementById("toasts").appendChild(div);

  setTimeout(function() {
    div.remove();
  }, 3000);
}
