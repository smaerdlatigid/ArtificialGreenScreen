// if (typeof(Worker) !== "undefined") {
//     if (typeof(w) == "undefined") {
//       w = new Worker("static/js/webcam_worker.js");
//       console.log("started new worker");
//     }
//     w.onmessage = function(event) {
//         console.log( event.data);
//     };
//   } else {
//     console.log("Sorry! No Web Worker support.");
//   }

let net;
var outputStride = 16;
var quantBytes = 4;
var segmentationThreshold = 0.5;

const opacity = 1;
const maskBlurAmount = 0;
const flipHorizontal = false;
let coloredPartImage; 


const videoElement = document.getElementById('webcam');
var slider = document.getElementById("segmentationRange");
const canvas = document.getElementById('canvas');

function colorFilter(segmentation, imgData) {
    var data = imgData.data;
    var red = new Array();
    var green = new Array();
    var blue = new Array();
    var alpha = new Array();

    //Read image and make changes on the fly 
    for (i = 0; i < data.length; i += 4) {
        red[i] = imgData.data[i];
        green[i] = imgData.data[i + 1];
        if (green[i] == 0) green[i] = 255;
        blue[i] = imgData.data[i + 2];
        alpha[i] = imgData.data[i + 3];
    }

    // Write the image back to the canvas
    for (i = 0; i < data.length; i += 4) {
        imgData.data[i] = red[i] * segmentation[i / 4];
        imgData.data[i + 1] = green[i];
        imgData.data[i + 2] = blue[i] * segmentation[i / 4];
        imgData.data[i + 3] = alpha[i];
    }
}

let webcam; 
let img; 
async function load_model(){
    console.log('Loading model...');
    net = await bodyPix.load({
        architecture: 'ResNet50',
        outputStride: outputStride,
        quantBytes: quantBytes
    });
    console.log('Successfully loaded model');
    document.getElementById("loader").style.display = "none";

    webcam = await tf.data.webcam(videoElement);
    img = await webcam.capture();
    var segmentation = await net.segmentPerson(img, {
        flipHorizontal: false,
        internalResolution: 'medium',
        segmentationThreshold: slider.value / 100
    });
    img.dispose();

    coloredPartImage = bodyPix.toMask(segmentation);
    colorFilter(segmentation, coloredPartImage);

    startEstimate();
}

async function startEstimate()
{
    while(true)
    {
        await estimate();
        bodyPix.drawMask(canvas, videoElement, coloredPartImage, opacity, maskBlurAmount, flipHorizontal);
    }
}

async function estimate() {
    
    img = await webcam.capture();
    var segmentation = await net.segmentPerson(img, {
        flipHorizontal: false,
        internalResolution: 'medium',
        segmentationThreshold: slider.value / 100
    });
    img.dispose();

    coloredPartImage = bodyPix.toMask(segmentation);
    // colorFilter(segmentation, coloredPartImage);

    // bodyPix.drawMask(canvas, videoElement, coloredPartImage, opacity, maskBlurAmount, flipHorizontal);
    //estimate();
}

load_model();