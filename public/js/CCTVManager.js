function CCTVManager(domElement) {
  this.domElement = domElement;
  this.streams = [];
  this.app = new Clarifai.App({
    apiKey: "cffc743a183c43c1b03364ae02de0a7a"
  });

  setInterval(() => {
    for (let { video } of this.streams) {
      const { width, height } = window.getComputedStyle(video);
      const canvas = document.createElement("canvas");
      canvas.width = parseInt(width);
      canvas.height = parseInt(height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      const b64Img = canvas.toDataURL("image/png");
      faceDetection(this, video, b64Img.replace("data:image/png;base64,", ""));
    }
  }, 500);
}

CCTVManager.prototype.flush = function flush() {
  while (this.domElement.hasChildNodes())
    this.domElement.removeChild(this.domElement.lastChild);
}

CCTVManager.prototype.alarm = function alarm(video) {
  video.parentNode.style.borderColor = "hsla(0, 100%, 50%, 1)";
}

CCTVManager.prototype.unalarm = function unalarm(video) {
  video.parentNode.style.borderColor = "#aaa";
}

CCTVManager.prototype.addVideo = function addVideo(stream) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("item");

  const video = document.createElement("video");
  video.autoplay = "autoplay";
  if ("srcObject" in video) {
    video.srcObject = stream;
  } else {
    // Avoid using this in new browsers, as it is going away.
    video.src = URL.createObjectURL(stream);
  }

  wrapper.appendChild(video);
  this.domElement.appendChild(wrapper);

  // set the height
  // wrapper.style.height = window.getComputedStyle(video).width;

  this.streams.push({ stream, video });
};

function faceDetection(manager, video, b64Img) {
  manager.app.models.predict(Clarifai.FACE_DETECT_MODEL, {
    base64: b64Img
  })
  .then(
    function(res) {
      var data = res.outputs[0].data.regions;
      if (data != null && data.length) {
        for (var i = 0; i < data.length; i++) {
          // imageDetails.clarifaiFaces.push(data[i].region_info.bounding_box);
        }
        manager.alarm(video);
      } else {
        manager.unalarm(video);
      }
    },
    function(err) {
      console.log(err);
    }
  )
}
