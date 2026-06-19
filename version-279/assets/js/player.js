(function () {
  var frames = Array.prototype.slice.call(document.querySelectorAll('[data-video-frame]'));

  frames.forEach(function (frame) {
    var video = frame.querySelector('video[data-stream]');
    var button = frame.querySelector('[data-play-button]');
    var hls = null;

    if (!video) {
      return;
    }

    function attachVideo() {
      var stream = video.getAttribute('data-stream');

      if (!stream) {
        return Promise.resolve();
      }

      if (video.getAttribute('data-ready') === 'true') {
        return Promise.resolve();
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.setAttribute('data-ready', 'true');
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(stream);
        hls.attachMedia(video);
        video.setAttribute('data-ready', 'true');
        return Promise.resolve();
      }

      video.src = stream;
      video.setAttribute('data-ready', 'true');
      return Promise.resolve();
    }

    function playVideo() {
      attachVideo().then(function () {
        video.controls = true;
        if (button) {
          button.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      });
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        playVideo();
      });
    }

    frame.addEventListener('click', function (event) {
      if (event.target === video || event.target === frame) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('emptied', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
})();
