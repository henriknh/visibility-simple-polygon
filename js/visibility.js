
var i = 0;
var t = 0;
var vpcase = "";
var ccw = true;
var w = {x: 0, y: 0};
var indexStartVertex = 0;
var vertices = {};
var eye = {x: 0, y: 0};

var crash = 0;
var crashThreshold = 20;


function polarCoord(p) {
  // http://jsfiddle.net/3SY8v/27/

  var x1 = eye.x;
  var y1 = eye.y;

  var x2 = p.x;
  var y2 = p.y;

  // Determine line lengths
  var xlen = x2 - x1;
  var ylen = y2 - y1;

  // Determine hypotenuse length
  var hlen = Math.sqrt(Math.pow(xlen,2) + Math.pow(ylen,2));

  // The variable identifying the length of the `shortened` line.
  // In this case 50 units.
  var smallerLen = 100;

  // Determine the ratio between they shortened value and the full hypotenuse.
  var ratio = smallerLen / hlen;

  var smallerXLen = xlen * ratio;
  var smallerYLen = ylen * ratio;

  // The new X point is the starting x plus the smaller x length.
  var smallerX = x1 + smallerXLen;

  // Same goes for the new Y.
  var smallerY = y1 + smallerYLen;

  return {x: smallerX, y: smallerY};
}

function calcAngles() {

  let angleStart = Math.atan2(eye.y - vertices[indexStartVertex%vertices.length].y, eye.x - vertices[indexStartVertex%vertices.length].x) * 180 / Math.PI;
  if (angleStart > 0) angleStart = 360 - angleStart;
  if (angleStart < 0) angleStart *= -1;

  vertices[indexStartVertex].angle = angleStart;

  var prev = angleStart;

  for (j = indexStartVertex+1; j < vertices.length+indexStartVertex; j++) {
    /*let angleCurr = Math.atan2(eye.y - vertices[j%vertices.length].y, eye.x - vertices[j%vertices.length].x) * 180 / Math.PI;
    if (angleCurr > 0) angleCurr = 360 - angleCurr;
    if (angleCurr < 0) angleCurr *= -1;
    angleCurr = (angleCurr-angleStart)*-1;*/

    var angle = 0;
    var angleDelta = getDeltaAngle(vertices[(j-1)%vertices.length], vertices[j%vertices.length]);

    if(isLeftTurn2(eye, vertices[(j-1)%vertices.length], vertices[(j)%vertices.length]))  {
      angle = prev + angleDelta;
    } else if (isRightTurn2(eye, vertices[(j-1)%vertices.length], vertices[(j)%vertices.length])) {
        angle = prev - angleDelta;
    } else {
        angle = prev;
    }
    vertices[j%vertices.length].angle = angle;
    prev = angle;
  }

  for (j = indexStartVertex; j < vertices.length+indexStartVertex; j++) {
    vertices[j%vertices.length].angle -= angleStart;
  }
}
function test() {
  console.log("test");
}

function calcAngle(data, j) {

  let prev = data[(j-1)%data.length].angle;

  var angle = 0;
  var angleDelta = getDeltaAngle(data[(j-1)%data.length], data[j%data.length]);

  if(isLeftTurn2(eye, data[(j-1)%data.length], data[(j)%data.length]))  {
    angle = prev + angleDelta;
  } else if (isRightTurn2(eye, data[(j-1)%data.length], data[(j)%data.length])) {
      angle = prev - angleDelta;
  } else {
      angle = prev;
  }
  return angle;
}
function getDeltaAngle(v1, v2) {

  let a1 = Math.atan2(eye.y - v1.y, eye.x - v1.x) * 180 / Math.PI;
  let a2 = Math.atan2(eye.y - v2.y, eye.x - v2.x) * 180 / Math.PI;


  var delta = 0;
  if(a1 < 0 && a2 > 0) {
    delta = Math.abs(a1*-1 + a2);
    if(delta > 180) delta = 360 - delta;
    } else if (a1 > 0 && a2 < 0) {
    delta = Math.abs(a1 + a2*-1);
    if(delta > 180) delta = 360 - delta;
  } else if (a1 < 0 && a2 < 0) {
    delta = Math.abs(a2*-1 + a1);
    if(delta > 180) delta = 360 - delta;
  } else if (a1 > 0 && a2 > 0) {
    delta = Math.abs(a2 - a1);
    if(delta > 180) delta = 360 - delta;
  } else {
    console.log("getDeltaAngle: BAD ANGLES!?");
    return;
  }
  return delta;
}

function calculateVisibility() {

  vertices = data.vertices;
  eye = data.eye;
  indexStartVertex = getClosestVisibleVertex();
  crash = 0;
  vpcase = "unknown";
  i = indexStartVertex;
  t = 0;
  stack = [];
  stack[0] = vertices[i%vertices.length];

  calcAngles();

  for(var x = vertices.length-1; x >= indexStartVertex; x--) {
    var p = {x: vertices[x].x,y: vertices[x].y,angle: vertices[x].angle};
    //vertices[x+1] = p;
  }
  vertices[indexStartVertex].angle = 0;
  //indexStartVertex++;

  console.log(vertices);

  for (j = indexStartVertex; j < vertices.length+indexStartVertex; j++) {
    console.log(vertices[j%vertices.length]);
  }

  //return;

  // Added seconds half of boolean-statment to make it possible to enter else-statement
  if(vertices[(i+1)%vertices.length].angle >= vertices[i%vertices.length].angle && vertices[(i+1)%vertices.length].angle < 180) {
    vpcase = "advance";
  } else {
    vpcase = "scan";
    ccw = true;
    w = polarCoord(vertices[i%vertices.length]);
  }

  while(vpcase != "finish") {
    switch(vpcase) {
      case "advance":
        advance();
        break;
      case "retard":
        retard();
        break;
      case "scan":
        scan();
        break;
      default:
        console.log("Unknown vpcase:", vpcase);
        vpcase = "finish";
    }
  }
}

function advance() {

  while(vpcase == "advance") {
    console.log('advance', stack);

    crash += 1;
    if(crash > crashThreshold) {vpcase = "crash"; return;}

    console.log(vertices[(i+1)%vertices.length].angle);

    if(vertices[(i+1)%vertices.length].angle <= 2*180) {

      i += 1;
      t += 1;
      stack[t] = vertices[i%vertices.length];

      console.log("i:", i);

      if(i == vertices.length + indexStartVertex - 1) {
        vpcase = "finish";
      } else if (vertices[(i+1)%vertices.length].angle < vertices[i%vertices.length].angle && isRightTurn(vertices, i-1, i, i+1)) {
        vpcase = "scan";
        ccw = true;
        w = polarCoord(vertices[i%vertices.length]);
      } else if (vertices[(i+1)%vertices.length].angle < vertices[i%vertices.length].angle && isLeftTurn(vertices, i-1, i, i+1)) {
        vpcase = "retard";
      }
    } else {
      if(stack[t].angle < 2*180) {
        t += 1;

        p = checkLineIntersection(vertices[i%vertices.length], vertices[(i+1)%vertices.length], eye, vertices[indexStartVertex]);
        a = calcAngle(stack, t);
        p.angle = a;
        stack[t] = p;
      }
      vpcase = "scan";
      ccw = false;
      w = vertices[indexStartVertex];
    }
  }
}

function retard() {

  let j = t-1;

  while(vpcase == "retard") {
    console.log('retard');
    crash += 1;
    if(crash > crashThreshold) {vpcase = "crash"; return;}

    while((stack[j].angle < vertices[(i+1)%vertices.length].angle && vertices[(i+1)%vertices.length].angle <= stack[(j+1)%stack.length].angle) &&
      (vertices[(i+1)%vertices.length].angle <= stack[j].angle && stack[j].angle == stack[(j+1)%stack.length].angle && intersect(vertices[i%vertices.length], vertices[(i+1)%vertices.length], stack[j%stack.length], stack[(j+1)%stack.length]))) {

        z = stack.shift(j);
        console.log("retard scan:", j, z);
        j--;

    }

    j -= 1;
    console.log("R");
    if(stack[j].angle < vertices[(i+1)%vertices.length].angle) {
      console.log("R1");
      i += 1;
      t = j + 2;

      p = checkLineIntersection(stack[j+1], stack[j+2], eye, vertices[i%vertices.length]);
      a = calcAngle(stack, t);
      p.angle = a;
      stack[t] = p;

      t += 1;
      stack[t] = vertices[i%vertices.length];

      if(i == vertices.length + indexStartVertex) {
        console.log("R1a");
        vpcase = "finish";
      } else if (vertices[(i+1)%vertices.length].angle >= vertices[i%vertices.length].angle && isRightTurn(vertices, i-1, i, i+1)) {
        console.log("R1b");
        vpcase = "advance";
      } else if (vertices[(i+1)%vertices.length].angle > vertices[i%vertices.length].angle && isLeftTurn(vertices, i-1, i, i+1)) {
        console.log("R1c");
        vpcase = "retard";
        ccw = false;
        w = vertices[i%vertices.length];
        t -= 1;
      } else {
        console.log("R1d");
        t -= 1;
      }
    } else {
      console.log("R2");
      if (vertices[(i+1)%vertices.length].angle == stack[j].angle && vertices[(i+2)%vertices.length].angle > vertices[(i+1)%vertices.length].angle && isRightTurn(vertices, i, i+1, i+2)) {
        vpcase = "advance";
        i += 1;
        t = j + 1;
        stack[t] = vertices[i%vertices.length];
      } else {
        vpcase = "scan";
        t = j;
        ccw = true;
        w = checkLineIntersection(vertices[i%vertices.length], vertices[(i+1)%vertices.length], stack[j], stack[j+1]);
        console.log("TODO: calc angle of w");
        console.log(w, j);
        console.log(vertices[i%vertices.length]);
        console.log(vertices[(i+1)%vertices.length]);
        console.log(stack[j]);
        console.log(stack[j+1]);
      }
    }
  }
}

function scan() {

  while(vpcase == "scan") {
    console.log('scan');
    crash += 1;
    if(crash > crashThreshold) {vpcase = "crash"; return;}


    i += 1;

    /*console.log("i:", i%vertices.length);

    console.log(ccw);
    console.log(vertices[(i+1)%vertices.length].angle);
    console.log(stack[t].angle);
    console.log(vertices[i%vertices.length].angle);

    console.log("");

    console.log(ccw && vertices[(i+1)%vertices.length].angle > stack[t].angle && stack[t].angle >= vertices[i%vertices.length].angle);
    console.log(!ccw && vertices[(i+1)%vertices.length].angle <= stack[t].angle && stack[t].angle < vertices[i%vertices.length].angle);*/

    if(ccw && vertices[(i+1)%vertices.length].angle > stack[t].angle && stack[t].angle >= vertices[i%vertices.length].angle) {
      if(intersect(vertices[i%vertices.length], vertices[(i+1)%vertices.length], stack[t], w)) {
        p = checkLineIntersection(vertices[i%vertices.length], vertices[(i+1)%vertices.length], stack[t], w);
        a = calcAngle(stack, t);
        p.angle = a;
        stack[t+1] = p;

        t += 1;
        vpcase = "advance";
      }
    } else if(!ccw && vertices[(i+1)%vertices.length].angle <= stack[t].angle && stack[t].angle < vertices[i%vertices.length].angle) {
      if(intersect(vertices[i%vertices.length], vertices[(i+1)%vertices.length], stack[t], w)) {
        vpcase = "retard";
      }
    }
  }
}

function isRightTurn(array, i_v1, i_v2, i_v3) {
  return turnDirection(array, i_v1, i_v2, i_v3) > 0;
}

function isLeftTurn(array, i_v1, i_v2, i_v3) {
  return turnDirection(array, i_v1, i_v2, i_v3) < 0;
}

function turnDirection(array, i_v1, i_v2, i_v3) {
  let v1 = array[(i_v1+array.length)%array.length];
  let v2 = array[(i_v2+array.length)%array.length];
  let v3 = array[(i_v3+array.length)%array.length];

  return ((v2.x - v1.x)*(v3.y - v1.y) - (v2.y - v1.y)*(v3.x - v1.x));
}

function isRightTurn2(v1, v2, v3) {
  return turnDirection2(v1, v2, v3) > 0;
}

function isLeftTurn2(v1, v2, v3) {
  return turnDirection2(v1, v2, v3) < 0;
}

function turnDirection2(v1, v2, v3) {
  return ((v2.x - v1.x)*(v3.y - v1.y) - (v2.y - v1.y)*(v3.x - v1.x));
}

function getAngle(array, i_v) {
  i_v = (i_v+array.length)%array.length;

  let startAngle =  Math.atan2(eye.y - stack[0].y, eye.x - stack[0].x);// * 180 / Math.PI;
  let angleVector = Math.atan2(eye.y - array[i_v].y, eye.x - array[i_v].x);// * 180 / Math.PI;

  let angle = angleVector - startAngle;

  /*if(angle > 0) {
    angle = 2*Math.PI - angle;
  } else if (angle < 0) {
    angle *= -1;
  }*/

  if(angle > 0) {
    //angle = 2*Math.PI - angle;
  } else if (angle < 0) {
    //angle = -1*angle + 2*Math.PI;
  }

  return angle;
}

function getClosestVisibleVertex() {
  var closest = null;
  var minDistance = Number.MAX_VALUE;

  for (var i_v1 = 0; i_v1 < vertices.length; i_v1++) {
    let hasIntersection = false;
    for (var j = 0; j < vertices.length; j++) {
      let i_v2 = j%vertices.length;
      let i_v3 = (j+1)%vertices.length;

      if(i_v3 < i_v2) {
        let t = i_v2;
        i_v2 = i_v3;
        i_v3 = t;
      }

      if(i_v1 != i_v2 && i_v1 != i_v3 && intersect(eye, vertices[i_v1], vertices[i_v2], vertices[i_v3])) {
        hasIntersection = true;
      }
    }

    vertexDistance = distanceBetweenTwoVertices(eye, vertices[i_v1]);
    if(!hasIntersection && minDistance > vertexDistance) {
      closest = i_v1;
      minDistance = vertexDistance;
    }
  }

  return closest;
}
// Given three colinear points p, q, r, the function checks if
// point q lies on line segment 'pr'
function onSegment(p, q, r) {
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
       return true;

    return false;
}

// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are colinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function orientation(p, q, r) {
    // See https://www.geeksforgeeks.org/orientation-3-ordered-points/
    // for details of below formula.
    val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

    if (val == 0) return 0;  // colinear

    return (val > 0)? 1: 2; // clock or counterclock wise
}

// The main function that returns true if line segment 'p1q1'
// and 'p2q2' intersect.
function intersect(p1, q1, p2, q2) {
    // Find the four orientations needed for general and
    // special cases
    o1 = orientation(p1, q1, p2);
    o2 = orientation(p1, q1, q2);
    o3 = orientation(p2, q2, p1);
    o4 = orientation(p2, q2, q1);

    // General case
    if (o1 != o2 && o3 != o4)
        return true;

    // Special Cases
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;

    // p1, q1 and p2 are colinear and q2 lies on segment p1q1
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;

    // p2, q2 and p1 are colinear and p1 lies on segment p2q2
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;

     // p2, q2 and q1 are colinear and q1 lies on segment p2q2
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;

    return false; // Doesn't fall in any of the above cases
}

function checkLineIntersection(p1, q1, p2, q2) {
  // http://jsfiddle.net/justin_c_rounds/Gd2S2/light/

  line1StartX = p1.x;
  line1StartY = p1.y;
  line1EndX = q1.x;
  line1EndY = q1.y;
  line2StartX = p2.x;
  line2StartY = p2.y;
  line2EndX = q2.x;
  line2EndY = q2.y;

    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false
    };
    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator == 0) {
      return false;
      return result;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));
/*
        // it is worth noting that this should be the same as:
        x = line2StartX + (b * (line2EndX - line2StartX));
        y = line2StartX + (b * (line2EndY - line2StartY));
        */
    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
        result.onLine1 = true;
        return {x: result.x, y: result.y};
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
        result.onLine2 = true;
        return {x: result.x, y: result.y};
    }
    // if line1 and line2 are segments, they intersect if both of the above are true
    return false;
};

function distanceBetweenTwoVertices(v1, v2) {
  //return Math.sqrt(Math.pow((v1.x-v2.x), 2) + Math.pow((v1.y-v2.y), 2));
  return Math.pow((v1.x-v2.x), 2) + Math.pow((v1.y-v2.y), 2);
}
