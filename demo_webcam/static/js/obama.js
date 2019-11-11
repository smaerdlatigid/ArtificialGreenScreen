let net;
var outputStride = 8;
var segmentationThreshold = 0.5;
const videoElement = document.getElementById('image');
var slider = document.getElementById("segmentationRange");
const canvas = document.getElementById('canvas');

function load_low(){
    net = bodyPix.load(0.25);
    outputStride = 32;
}
function load_high() {
    net = bodyPix.load(1.00);
    outputStride = 8;
}

function colorFilter(segmentation, imgData) {
    var data = imgData.data;
    var red = new Array();
    var green = new Array();
    var blue = new Array();
    var alpha = new Array();

    //Read image and make changes on the fly 
    for (i = 0; i < data.length; i += 4) {
        red[i] = imgData.data[i];
        if (red[i] == 0) red[i] = 255;
        green[i] = imgData.data[i + 1];
        if (green[i] == 0) green[i] = 255;
        blue[i] = imgData.data[i + 2]; 
        alpha[i] = imgData.data[i + 3]; 
    }

    // Write the image back to the canvas
    for (i = 0; i < data.length; i += 4) {
        imgData.data[i] = red[i] * segmentation[i/4];
        imgData.data[i + 1] = green[i];
        imgData.data[i + 2] = blue[i] * segmentation[i/4];
        imgData.data[i + 3] = alpha[i];
    } 
}

async function app() {
    console.log('Loading body pix...');
    net = await bodyPix.load(1.00);
    outputStride = 8;
    console.log('Successfully loaded model');

    //const img = await webcam.capture();
    var segmentation = await net.estimatePersonSegmentation(videoElement, outputStride, slider.value / 100);
    //img.dispose();

    // draw the mask onto the image on a canvas.  With opacity set to 0.7 and maskBlurAmount set to 3, this will darken the background and blur the darkened background's edge.
    const maskBackground = true;
    var backgroundDarkeningMask = bodyPix.toMaskImageData(segmentation, maskBackground);
    colorFilter(segmentation, backgroundDarkeningMask);
    const opacity = 1;
    const maskBlurAmount = 3;
    const flipHorizontal = false;
    bodyPix.drawMask(
        canvas, videoElement, backgroundDarkeningMask, opacity, maskBlurAmount, flipHorizontal);

}

// Update the current slider value (each time you drag the slider handle)
slider.oninput = async function () {

    //const img = await webcam.capture();
    var segmentation = await net.estimatePersonSegmentation(videoElement, outputStride, slider.value / 100);
    //img.dispose();

    // draw the mask onto the image on a canvas.  With opacity set to 0.7 and maskBlurAmount set to 3, this will darken the background and blur the darkened background's edge.
    const maskBackground = true;
    var backgroundDarkeningMask = bodyPix.toMaskImageData(segmentation, maskBackground);
    colorFilter(segmentation, backgroundDarkeningMask);
    const opacity = 1;
    const maskBlurAmount = 3;
    const flipHorizontal = false;
    bodyPix.drawMask(
        canvas, videoElement, backgroundDarkeningMask, opacity, maskBlurAmount, flipHorizontal);
}

app();
