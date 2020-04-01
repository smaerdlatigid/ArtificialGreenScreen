if (typeof(Worker) !== "undefined") {
    if (typeof(w) == "undefined") {
      w = new Worker("static/js/webcam_worker.js");
    }
    w.onmessage = function(event) {
        console.log( event.data);
    };
  } else {
    console.log("Sorry! No Web Worker support.");
  }

