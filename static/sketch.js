// casey conchinha - @kcconch ( https://github.com/kcconch )
// more p5.js + shader examples: https://itp-xstory.github.io/p5js-shaders/

/* See the blog post about BodyPix here: https://medium.com/tensorflow/introducing-bodypix-real-time-person-segmentation-in-the-browser-with-tensorflow-js-f1948126c2a0 */
/* This is a modified version of a bodypix example by Dan Oved https://twitter.com/oveddan */
/* github.com/pearsonkyle 10/31/19 */


// the video capture
let capture;
let videoFrame;

// the most recent resulting mask image generated from estimating person segmentation on the video 
let model;
let segmentation;
let maskImage;
let seg2d;
let statusText = '';

// the output canvas
let canvas;
let CANVAS;

// pass segmentation mask to camera shader
let camShader;
let shaderLayer;

let w, h;

function preload() {
    // load the shader
    camShader = loadShader('static/chroma.vert', 'static/chroma.frag');
}

function setup() {
    
    w = 640*1.5;
    h = 480*1.5;
    // save the created canvas so it can be drawn on with bodypix later.
    // createCanvas(windowWidth, windowHeight);
    CANVAS = createCanvas(w, h);
    canvas = CANVAS.canvas;
   

    // capture from the webcam
    capture = createCapture(VIDEO);
    capture.hide();
    
    // loop independently of draw calls
    loadModelAndStartEstimating();
    
    // shader
    shaderLayer = createGraphics(w, h, WEBGL);
    shaderLayer.noStroke();
}

/* the arguments to the function which draws the mask onto the canvas.  See the documentation for full descriptions:
https://github.com/tensorflow/tfjs-models/tree/master/body-pix#drawmask
*/
// opacity of the segmentation mask to be drawn on top of the image.
const maskOpacity = 1.0;
// if the output should be flip horizontally.  This should be set to true for user facing cameras.
const flipHorizontal = true;
// how much to blur the mask background by.  This affects the softness of the edge.
const maskBlurAmount = 0;

function draw() {
    background(0, 255, 0);
    textSize(16);
    text(statusText, 0, 30);
    if (capture && capture.loadedmetadata && maskImage) {
        const videoFrame = capture.get(0, 0, w, h);
        // use bodyPix to draw the estimated video with the most recent mask on top of it onto the canvas.
        bodyPix.drawMask(canvas, videoFrame.canvas, maskImage, 1-int(mouseIsPressed), maskBlurAmount, flipHorizontal);
    }

    // get masked out frame 
    let c = get(); 

    // pass parameters to shader
    shaderLayer.shader(camShader);
    camShader.setUniform('tex0', c);
    camShader.setUniform('mouseDown', int(mouseIsPressed));    
    
    shaderLayer.rect(0, 0, w, h);
    image(shaderLayer, 0, 0, w, h);
}

async function loadModelAndStartEstimating() {
    setStatusText('loading the model...');
    
    model = await bodyPix.load(1.00);
    
    setStatusText('');
    // start the estimation loop, separately from the drawing loop.  
    // This allows drawing to happen at a high number of frame per
    // second, independent from the speed of estimation.
    startEstimationLoop();
}

function startEstimationLoop() {
    estimateFrame();
}

async function estimateFrame() {
    if (capture && capture.loadedmetadata) {
        await performEstimation();
    }

    // at the end of estimating, start again after the current frame is complete.
    requestAnimationFrame(estimateFrame);
}


/* the arguments to the functions which estimate the person segmentation and convert the results
to a mask to draw onto the canvas.  See the documentation for both methods:
https://github.com/tensorflow/tfjs-models/tree/master/body-pix#person-segmentation
https://github.com/tensorflow/tfjs-models/tree/master/body-pix#tomaskimagedata
*/
// set the output stride to 16 or 32 for faster performance but lower accuracy.
const outputStride = 8;
// affects the crop size around the person.  Higher number is tighter crop and visa
const segmentationThreshold = 0.42;
// if the background or the person should be masked.  If set to false, masks the person.
const maskBackground = true;

async function performEstimation() {
    videoFrame = capture.get(0, 0,w,h);
    segmentation = await model.estimatePersonSegmentation(
        videoFrame.canvas, outputStride, segmentationThreshold);
    maskImage = bodyPix.toMaskImageData(segmentation, maskBackground, flipHorizontal);
}


function setStatusText(text) {
    statusText = text;
}