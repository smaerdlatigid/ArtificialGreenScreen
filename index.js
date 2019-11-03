let net;
const outputStride = 16;
const segmentationThreshold = 0.5;
const videoElement = document.getElementById('webcam');
const canvas = document.getElementById('canvas');

async function app() {
    console.log('Loading body pix...');
    net = await bodyPix.load(0.25);
    console.log('Successfully loaded model');
    const webcam = await tf.data.webcam(videoElement);

    while (true) {
    const img = await webcam.capture();
    var segmentation = await net.estimatePersonSegmentation(img, outputStride, segmentationThreshold);
    img.dispose();

    // draw the mask onto the image on a canvas.  With opacity set to 0.7 and maskBlurAmount set to 3, this will darken the background and blur the darkened background's edge.
    const maskBackground = true;
    const backgroundDarkeningMask = bodyPix.toMaskImageData(segmentation, maskBackground);

    const opacity = 0.7;
    const maskBlurAmount = 3;
    const flipHorizontal = true;
    bodyPix.drawMask(
        canvas, videoElement, backgroundDarkeningMask, opacity, maskBlurAmount, flipHorizontal);
    }
}

app();
