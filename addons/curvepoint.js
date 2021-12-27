var maskCurve = [[250,350],[50,50],[200,100],[275,150],[180,200],[180,120],[50,50],[200,100]];
function setup() {
createCanvas(windowWidth, windowHeight);
background(100);
}
 
function draw() {
maskDraw();
resampleMask()
noLoop()
}

function maskDraw(){    
    beginShape();
    noFill()
    for(var i = 0; i < maskCurve.length; i++)
        {
            curveVertex(maskCurve[i][0],maskCurve[i][1]);
        }
    endShape();
}

function resampleMask(){
//distance between two points
var sampleDivs = 5;
for(var j = 0; j < (maskCurve.length/2)+1; j++){
  var j1 = remap(j);
  var j2 = remap(j+1);
  var j3 = remap(j+2);
  var j4 = remap(j+3);
  var steps = dist(maskCurve[j2][0],maskCurve[j2][1],maskCurve[j3][0],maskCurve[j3][1])/sampleDivs;
for (var i = 0; i <= steps; i++) {
  var t = i / float(steps);
  var x = curvePoint(maskCurve[j1][0], maskCurve[j2][0], maskCurve[j3][0], maskCurve[j4][0], t);
  var y = curvePoint(maskCurve[j1][1], maskCurve[j2][1], maskCurve[j3][1], maskCurve[j4][1], t);
  ellipse(x, y, 5, 5);
}
}
}

function remap(curveIndex){
    if(curveIndex < 1)
    {
        return 0;
    }
    if(curveIndex >= (maskCurve.length-1))
    {
        return int(maskCurve.length-1);
    }
    return curveIndex;
}