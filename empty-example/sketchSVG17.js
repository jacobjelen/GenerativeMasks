var gui;
// gui params
var eyeSpace = 40;
var forehead = -200;
var sides = 0;
var cheeks = -220
var complexity = 1;
var randomness = 20;

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

  sliderRange(-300, -150, 1);
  gui.addGlobals('forehead');

  sliderRange(-300, -70, 1);
  gui.addGlobals('sides');

  sliderRange(-300, -180, 1);
  gui.addGlobals('cheeks');

  sliderRange(0, 8, 1);
  gui.addGlobals('complexity');

  sliderRange(0, 100, 1);
  gui.addGlobals('randomness');

  // gui.addGlobals('saveMask');
  // noLoop(); // Only call draw when then gui is changed
}


function draw() { //#############################################################################################################
// nothing is happening
  if (state == 'hold') { 
  
  }

// when clicked, take variables and recreate the mask
  if (state == 'set') {

    // half of the mask
    resCurve = [ [0,forehead], [0,forehead], [0,forehead], [120 ,forehead], [300 + sides/20, sides], [300 + cheeks/3, 400 + cheeks], [80, 160] ]; // reset the mask, add control points
    print(resCurve);
    resCurve = deform(resCurve,randomness);
    print(resCurve);
    resCurve = resampleCurve(resCurve,10, complexity, true); // adds 'complexity' points between the control points
    
    noseCurve = [[80, 160],[80, 160],[40, 65],[15, 28],[0, 20]];
    noseCurve = resampleCurve( noseCurve ,10); 
    
    for (var i = 0; i < noseCurve.length; i++) {  // add noseCurve
      resCurve.push(noseCurve[i]);
    }

    resCurve = mirrorCurve(resCurve,0,true); 
    resCurve = shiftCurve(resCurve,windowWidth/2,windowHeight/2); // align to the centre of the screen

    updateBoundingBox(); // bounding box around the mask

    eyeCurve = [[eyeSpace, 0],
                [eyeSpace, 0],
                [eyeSpace, - 5],
                [eyeSpace, - 5], 
                [eyeSpace + 70, - 50],
                [eyeSpace + 140, sides/5], 
                [eyeSpace + 70,  50], 
                [eyeSpace, 5],
                [eyeSpace, 0],
                [eyeSpace, 0],
                ];

    eyeCurve = shiftCurve(eyeCurve,windowWidth/2,windowHeight/2);
    eyeCurve = resampleCurve( eyeCurve, 10, complexity/2);
    
    allEdges = addArrays( resCurve, eyeCurve, mirrorCurve(eyeCurve,windowWidth/2,false));

    circles = []; // reset the circles array
    state = 'run';
    
  }
  
// generating shapes inside the mask
  if (state == 'run') { 

    if (runCount >= runMax) {   
      // exportSVG();
      print('runcount reached :' + runCount);
      state = 'save';        // stop making circles
      runCount = 0;
      
    } else { 
      runCount = runCount + 1; 
    }
    
    background(100);
    maskDraw();       // draw the entire mask outline
    makeCircle();     // draw/grow the circes
  }

}  // end of draw() //#############################################################################################################


function mirrorCurve(array, axisX=windowWidth/2, copy=false){ // mirror the shape & add new points to the array
  let inArray = array;
  let outArray = [];  //array.slice().reverse(); // slice() makes a copy, reverse() flips it. Can't use just reverse() - it changes the original 

  // mirror inArray values and add to outArray
  for (var i = 0; i < inArray.length; i++) {      
    let dx = axisX - inArray[i][0];                 // difference of axisX and pointX
    outArray.push([ axisX + dx, inArray[i][1] ] );  
  }
  
  outArray.reverse();  // reverse order of values

  // copy or not
  if (copy) {
    return addArrays(inArray,outArray);  // return inArray.concat(outArray); //adds outArray at the end of inArray
  } else {
    return outArray;
  }
}


function shiftCurve(array,x=0,y=0){ // moves the entire shape by x and y. 
  var inArray = array;
  for (var i = 0; i < inArray.length; i++) {
    inArray[i][0] = inArray[i][0] + x;
    inArray[i][1] = inArray[i][1] + y;
  }
  return inArray;
}


function addArrays(...arrays){
  var addedArray = [];
  
  for (var i = 0; i < arrays.length; i++) {
    for (var j = 0; j < arrays[i].length; j++) {
      addedArray.push( arrays[i][j] )
    }
  }
  return addedArray;
}


function updateBoundingBox(){  // bounding box that the circles are randomly generated in
// reset bounding box
  minBound = [windowWidth, windowHeight];  //minimum first set to the hihest possible
  maxBound = [0,0]; //maximum first set to the lowest possible

  for (var i=0; i<resCurve.length; i++) {

     // find 'bounding box' of the mask
     if (resCurve[i][0] < minBound[0]) {  
        minBound[0] = resCurve[i][0];
      }  else if (resCurve[i][0] > maxBound[0]) {  
        maxBound[0] = resCurve[i][0];
      } 

      if (resCurve[i][1] < minBound[1]) {  
        minBound[1] = resCurve[i][1];
      }  else if (resCurve[i][1] > maxBound[1]) {  
        maxBound[1] = resCurve[i][1];
      } 
  }
  minBound = [minBound[0]+maskPadding, minBound[1]+maskPadding ];
  maxBound = [maxBound[0]-maskPadding, maxBound[1]-maskPadding ];
  
  centerPoint[0] = minBound[0] + ( maxBound[0] - minBound[0] )/2;
  centerPoint[1] = minBound[1] + ( maxBound[1] - minBound[1] )/2 + 30;
}

function deform(array,amo){ // moves the entire shape by x and y. 
  var inArray = array;
  for (var i = 2; i < inArray.length-1; i++) {
    inArray[i][0] = inArray[i][0] + random(amo);
    inArray[i][1] = inArray[i][1] - random(amo);
  }
  return inArray;
}

function resampleCurve(array,divs=10,chaos=0){  // adds points along a curve. takes arguments: array of curve points; distance between new points; random offset from the original curve
  let sampleDivs = divs; //distance between two points
  let inArray = array;
  let outArray = [];
  append(outArray,inArray[0],inArray[1]); //add the first controll point

  for(var j = 0; j < (inArray.length/2)+1; j++){

    var j1 = remap(j,inArray);
    var j2 = remap(j+1,inArray);
    var j3 = remap(j+2,inArray);
    var j4 = remap(j+3,inArray);
    var steps = dist(inArray[j2][0],inArray[j2][1],inArray[j3][0],inArray[j3][1])/sampleDivs;
    for (var i = 0; i <= steps; i++) {
      var t = i / float(steps);
      var x = curvePoint(inArray[j1][0], inArray[j2][0], inArray[j3][0], inArray[j4][0], t);
      var y = curvePoint(inArray[j1][1], inArray[j2][1], inArray[j3][1], inArray[j4][1], t); 
      
      if(x && y){
        append(outArray, [x + random(chaos*3) , y + random(chaos) ]);
      }    
    }
  }
  append(outArray,inArray[inArray.length-1],inArray[inArray.length-1]); //add the first controll point
  return outArray;
}



function remap(curveIndex,array){  // so that index doesn't run over an array, starts from begining instead
  let ar = array;
  if(curveIndex < 1)
  {
    return 0;
  }
  if(curveIndex >= (ar.length-1))
  {
    return int(ar.length-1);
  }
  return curveIndex;
}



function maskDraw(){
  fill(255);
  
  // mask outline ------------------------------------
  beginShape();
    for(var i = 0; i < resCurve.length; i++) {       // draw all points in the array
      vertex(resCurve[i][0],resCurve[i][1]); 
    }
  endShape();


  // eyes ------------------------------------
  fill(100);
  
  // first eye
  beginShape();
    for(var i = 0; i < eyeCurve.length; i++) {       // draw all points in the array
      vertex(eyeCurve[i][0],eyeCurve[i][1]); 
    }
  endShape();

  // second eye
  eyeCurve = mirrorCurve(eyeCurve,windowWidth/2,false); //
  beginShape();
    for(var i = 0; i < eyeCurve.length; i++) {       // draw all points in the array
      vertex(eyeCurve[i][0],eyeCurve[i][1]); 
    }
  endShape();

  // maskPath points
  // for (var i = 0; i < allEdges.length; i++) {
  //   ellipse(allEdges[i][0], allEdges[i][1], 5,5);
  // }

  }



// dynamically adjust the canvas to the window
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
    // button.position(saveButtonMin[0], saveButtonMin[1]);

}


function keyPressed() {
if( (key == 's' || key == 'S') && state == 'save'){
    print('save');
    save('MyMask_'+maskNo);
    maskNo = maskNo+1;
    state='hold';
  }
}

function mouseClicked() { // called when mouse is pressed and released
    state = 'set';
}



///////////////////////////////////////////////

function newCircle(x, y, gr)  // adds a circle to circles array, if the circle is valid - not colliding
{
  let valid = true;
  for (var i=0; i<circles.length; i++) {
    c = circles[i];
     let d = dist(x, y, c.x, c.y);
     if(d - padding < c.r + startR)
     {
       valid = false;
       break;
     }
    }
  
  if(valid && ! XYedges(x,y))
  {
    circles.push(new Circle(x,y,gr)); // add new circle to the circles array
  }
}

function makeCircle(){  // tries to make a new circle and grows existing ones
newCircle(
        random(minBound[0]+padding+startR, maxBound[0]-padding-startR), random(minBound[1]+padding+startR, maxBound[1]-padding-startR), growRate
        );
  for (var i=0; i<circles.length; i++) {
    
    // print(circles.length + ' circles');
    
    c = circles[i];
    c.growing = ! c.edges();
    c.growing = ! c.maskEdge();
    if(c.growing)
     {
       for(var j=0; j<circles.length; j++){
       other = circles[j];
       if( c != other){
       var d = dist(c.x, c.y, other.x, other.y);
       if(d - padding < c.r + other.r)
       {
         c.growing = false;
       }
       }
       }
           c.grow();
    }
     c.show();
    }

}

function XYedges(xx,yy){ //true return means collision with edges
     var hit = false;
     // check collision with mask 
     for (var i=0; i<allEdges.length; i++)
     {
      if(dist(xx,yy,allEdges[i][0],allEdges[i][1]) < padding + maskPadding){
       hit = true;
      }
     }


     // if(brightness(get(xx,yy)) != 100) // only draw on white ; brightness 100
     // {
     //    hit = true;
     // }
     return(hit);
}

//circle Class

function Circle(x,y,growRate){
        this.x = x;
        this.y = y;
        this.r = startR;
        this.growRate;
        this.growing = true;
        this.hit =false;
        
        // each shape is ratated towards the center of the mask - just because it looks better
        this.rotation = 230 + Math.atan2(this.y - centerPoint[1], this.x - centerPoint[0]) * 180 / Math.PI; // offset (230) + angle between the center point of this circle and center of the mask
        
        // thetas are angles of the vector between center of the given circle and a point on the circle
        // add more for different polygons
        this.thetas=[
          this.rotation, 
          120 + this.rotation+random(1), 
          240 + this.rotation + random(1), 
          this.rotation]; // create point on the circle to draw a polygon
        
        // to hold [x,y] values for each point on the circle and draw a polygon from them
        this.curve=[];
        
        
      this.grow = function()
    {
      if(this.growing){
       this.r = this.r + growRate;
      }
    }
      
      this.edges = function()
    {
      return (this.x + this.r > width - padding || this.x - this.r < padding || this.y + this.r > height - padding || this.y - this.r < padding);
    }
    
       this.maskEdge = function()
    {
      this.hit = false;
       for (var i=0; i<allEdges.length; i++)
       {
       if(dist(this.x,this.y,allEdges[i][0],allEdges[i][1])< padding+maskPadding+this.r){
           this.hit = true;
       }
      }
      return(this.hit)
    }

      this.shape = function(){
        this.curve=[];

        for (var i = 0; i < this.thetas.length; i++) { 
          let px = this.r * cos(this.thetas[i]);
          let py = this.r * sin(this.thetas[i]);
          this.curve.push( [px + this.x, py + this.y] );
          
          if (i == 0 || i == this.thetas.length-1) { // duplicate first and last point -> control points
            this.curve.push( [px + this.x, py + this.y] );
          }
        }

        this.curve = resampleCurve(this.curve,10,complexity/3);
        fill(100);
        
        beginShape();
        for (var i = 0; i < this.curve.length; i++) {
          vertex(this.curve[i][0], this.curve[i][1]);
          // vertex(this.curve[i][0], this.curve[i][1]);
        }
        endShape(CLOSE);
      }

    this.show = function(){
      fill(100);
      
      //// GENERATE CIRCLES  /////// 
      // ellipse(this.x, this.y, this.r*2, this.r*2);
      
      //// GENERATE SHAPES BASED ON CIRCLES /////// 
      this.shape();

      }

}

