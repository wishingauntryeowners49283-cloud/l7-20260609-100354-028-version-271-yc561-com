
import { H as Hls } from './hls-vendor-dru42stk.js';

export function initializePlayer(options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var source = options.source;
    var hls = null;
    var pendingPlay = false;

    if (!video || !source) {
        return;
    }

    function hideButton() {
        if (button) {
            button.classList.add('is-hidden');
        }
    }

    function showButton() {
        if (button && video.paused) {
            button.classList.remove('is-hidden');
        }
    }

    function playVideo() {
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                showButton();
            });
        }
    }

    function attachNative() {
        if (video.getAttribute('src') !== source) {
            video.setAttribute('src', source);
        }

        playVideo();
    }

    function attachHls() {
        if (!hls) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                if (pendingPlay) {
                    playVideo();
                    pendingPlay = false;
                }
            });
        } else {
            playVideo();
        }
    }

    function start() {
        hideButton();

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            attachNative();
            return;
        }

        if (Hls && Hls.isSupported()) {
            pendingPlay = true;
            attachHls();
        }
    }

    if (button) {
        button.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener('play', hideButton);
    video.addEventListener('pause', function () {
        if (video.currentTime < 0.2 || video.ended) {
            showButton();
        }
    });
}
