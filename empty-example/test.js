/*  TO DO:
- save() not working
- bubbles not working

- limit the bubble size 
- generate shapes inside the bubbles
- SVG export 
*/

var gui;
// gui params
var eyeSpace = 40;
var A = -200;
var B = 0;
var C = -220
var complexity = 1;
var randomness = 1;

// circle parameters
var circles = [];
var padding = 7;  // space to leave between circles
var maskPadding = 20;
var growRate = 3;  
var startR = 15;  // starting radius

var resCurve = [];  // to hold points of the mask shape
var noseCurve = []; 
var eyeCuve = [];
var allEdges = []; // points of all curves to test collisions

// bounding box of the mask
var minBound = [];  
var maxBound = []; 
var centerPoint = [0,20];

var state = 'hold';
var runCount = 0;
var runMax = 100; //150 - 350
var maskNo = 1;

function setup() {  //#############################################################################################################

  createCanvas(windowWidth, windowHeight, SVG);
  angleMode(DEGREES);
  background(100);
  stroke(255,0,0);
  noFill();
  // translate(0,-100);

  gui = createGui('p5.gui');  // Create the GUI

  sliderRange(-350, -150, 1);
  gui.addGlobals('A');

  sliderRange(-300, -70, 1);
  gui.addGlobals('B');

  sliderRange(-300, -180, 1);
  gui.addGlobals('C');

  sliderRange(0, 8, 1);
  gui.addGlobals('complexity');

  sliderRange(0, 500, 1);
  gui.addGlobals('randomness');

  // gui.addGlobals('saveMask');
  // noLoop(); // Only call draw when then gui is changed
}


function draw() { //#############################################################################################################


    // half of the mask
    resCurve = [ [0,50], [0,70], [0,90], [120 ,50], [300 , 30], [300 , 400], [80, 160] ]; // reset the mask, add control points
    deform(resCurve,100);

    // resCurve = deform(resCurve,randomness);
    print(resCurve);
    // resCurve = resampleCurve(resCurve,10, complexity, true); // adds 'complexity' points between the control points


}  // end of draw() //#############################################################################################################

function deform(array,amo){ // moves the entire shape by x and y. 
  var inArray = array;
  for (var i = 2; i < inArray.length-2; i++) {
    inArray[i][0] = inArray[i][0] + random(amo);
    inArray[i][1] = inArray[i][1] + random(amo);
  }
  return inArray;
}




