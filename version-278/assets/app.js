(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var form = document.querySelector("[data-filter-form]");
    if (!form) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");
    var fields = Array.prototype.slice.call(form.querySelectorAll("input, select"));

    function getValue(name) {
      var field = form.querySelector("[name='" + name + "']");
      return field ? field.value.trim().toLowerCase() : "";
    }

    function apply() {
      var query = getValue("query");
      var region = getValue("region");
      var type = getValue("type");
      var year = getValue("year");
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        var match = true;
        if (query && haystack.indexOf(query) === -1) {
          match = false;
        }
        if (region && haystack.indexOf(region) === -1) {
          match = false;
        }
        if (type && haystack.indexOf(type) === -1) {
          match = false;
        }
        if (year && haystack.indexOf(year) === -1) {
          match = false;
        }
        card.style.display = match ? "" : "none";
        if (match) {
          shown += 1;
        }
      });

      if (empty) {
        empty.style.display = shown ? "none" : "block";
      }
    }

    fields.forEach(function (field) {
      field.addEventListener("input", apply);
      field.addEventListener("change", apply);
    });
    apply();
  }

  function setupPlayer() {
    var video = document.querySelector("[data-player-video]");
    var layer = document.querySelector("[data-play-layer]");
    var button = document.querySelector("[data-play-button]");
    if (!video || !button) {
      return;
    }
    var source = video.getAttribute("data-stream");
    var prepared = false;

    function prepare() {
      if (prepared || !source) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      prepare();
      if (layer) {
        layer.classList.add("hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (layer) {
            layer.classList.remove("hidden");
          }
        });
      }
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (layer) {
        layer.classList.add("hidden");
      }
    });
    video.addEventListener("pause", function () {
      if (layer && video.currentTime === 0) {
        layer.classList.remove("hidden");
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
