(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  window.initMoviePlayer = function (options) {
    onReady(function () {
      var video = document.querySelector(options.videoSelector);
      var overlay = document.querySelector(options.overlaySelector);
      var hlsInstance = null;
      var initialized = false;

      if (!video || !options.url) {
        return;
      }

      function mountVideo() {
        if (initialized) {
          return;
        }

        initialized = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = options.url;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(options.url);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
              hlsInstance = null;
              video.src = options.url;
            }
          });
          return;
        }

        video.src = options.url;
      }

      function beginPlayback() {
        mountVideo();
        if (overlay) {
          overlay.classList.add("hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            if (overlay) {
              overlay.classList.remove("hidden");
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", function (event) {
          event.preventDefault();
          beginPlayback();
        });
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          beginPlayback();
        }
      });

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("hidden");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };
})();
