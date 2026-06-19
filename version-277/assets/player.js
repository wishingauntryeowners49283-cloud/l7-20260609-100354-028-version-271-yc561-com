import { H as Hls } from "./hls-vendor.js";

(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var panel = document.querySelector("[data-player]");

    if (!panel) {
      return;
    }

    var video = panel.querySelector("video");
    var startButton = panel.querySelector(".player-start");
    var message = panel.querySelector("[data-player-message]");
    var source = panel.getAttribute("data-video-url");
    var hlsInstance = null;
    var hasLoaded = false;

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function attachSource() {
      if (!video || !source) {
        setMessage("没有找到可用播放源。");
        return;
      }

      if (hasLoaded) {
        video.play().catch(function () {
          setMessage("浏览器阻止了自动播放，请再次点击视频播放按钮。");
        });
        return;
      }

      hasLoaded = true;
      video.controls = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        setMessage("已使用浏览器原生 HLS 能力加载播放源。");
      } else if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setMessage("播放源加载失败，请稍后重试或检查 m3u8 地址。");
          }
        });
        setMessage("已初始化 HLS 播放器，正在加载视频。");
      } else {
        video.src = source;
        setMessage("当前浏览器不支持 HLS.js，已尝试直接加载播放源。");
      }

      panel.classList.add("is-playing");
      video.play().catch(function () {
        setMessage("播放源已加载，请点击视频控件开始播放。");
      });
    }

    if (startButton) {
      startButton.addEventListener("click", attachSource);
    }

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
})();
