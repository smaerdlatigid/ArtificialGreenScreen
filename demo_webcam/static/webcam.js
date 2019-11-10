let net;
var outputStride = 16;
var segmentationThreshold = 0.5;
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

async function app() {

    console.log('Loading body pix...');
    net = await bodyPix.load(0.25);
    console.log('Successfully loaded model');
    const webcam = await tf.data.webcam(videoElement);

    while(true){
        const img = await webcam.capture();
        var segmentation = await net.estimatePersonSegmentation(img, outputStride, slider.value / 100);
        img.dispose();

        const maskBackground = true;
        var backgroundDarkeningMask = bodyPix.toMaskImageData(segmentation, maskBackground);
        colorFilter(segmentation, backgroundDarkeningMask);

        const opacity = 1;
        const maskBlurAmount = 0;
        const flipHorizontal = false;
        bodyPix.drawMask(
            canvas, videoElement, backgroundDarkeningMask, opacity, maskBlurAmount, flipHorizontal);
    }
}

app();
