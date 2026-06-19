(function () {
  var players = {};

  function attach(video, streamUrl) {
    if (video.getAttribute("data-ready") === "1") {
      return Promise.resolve();
    }

    video.setAttribute("data-ready", "1");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      players[video.id] = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        window.setTimeout(resolve, 1400);
      });
    }

    video.src = streamUrl;
    return Promise.resolve();
  }

  function init(videoId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !streamUrl) {
      return;
    }

    function start() {
      overlay.classList.add("is-hidden");
      attach(video, streamUrl).then(function () {
        return video.play();
      }).catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }

    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  }

  window.SitePlayer = {
    init: init
  };
})();
