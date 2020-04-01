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

    console.log('Loading model...');
    // const net = await bodyPix.load({
    //     architecture: 'ResNet50',
    //     outputStride: 16,
    //     quantBytes: 2
    // });

    const net = await bodyPix.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 1.00,
        quantBytes: 2
      });
    console.log('Successfully loaded model');

    const webcam = await tf.data.webcam(videoElement);
    document.getElementById("loader").style.display = "none";
    
    while(true){
        const img = await webcam.capture();
        var segmentation = await net.segmentPerson(img, {
            flipHorizontal: false,
            internalResolution: 'medium',
            segmentationThreshold: slider.value / 100
        });
        img.dispose();

        const maskBackground = true;
        // var backgroundDarkeningMask = bodyPix.toMaskImageData(segmentation, maskBackground);
        const coloredPartImage = bodyPix.toMask(segmentation);
        colorFilter(segmentation, coloredPartImage);
        const opacity = 0.25;
        const maskBlurAmount = 0;
        const flipHorizontal = false;
        bodyPix.drawMask(
            canvas, videoElement, coloredPartImage, opacity, maskBlurAmount, flipHorizontal);
        }
}

app();
