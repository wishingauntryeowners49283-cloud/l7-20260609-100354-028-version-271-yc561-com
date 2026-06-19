(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  var toggle = qs('.menu-toggle');
  var panel = qs('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var hero = qs('[data-hero]');
  if (hero) {
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-target')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function initFiltering() {
    var input = qs('.movie-filter-input');
    var cards = qsa('.movie-card');
    if (!input || !cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (query) {
      input.value = query;
    }

    var activeKey = 'all';
    var activeValue = 'all';
    var chips = qsa('.filter-chip');

    function matches(card, term) {
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-tags') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();
      var okText = !term || haystack.indexOf(term.toLowerCase()) !== -1;
      var okChip = true;
      if (activeKey !== 'all') {
        var value = card.getAttribute('data-' + activeKey) || '';
        okChip = value.indexOf(activeValue) !== -1;
      }
      return okText && okChip;
    }

    function apply() {
      var term = input.value.trim();
      cards.forEach(function (card) {
        card.hidden = !matches(card, term);
      });
    }

    input.addEventListener('input', apply);
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        activeKey = chip.getAttribute('data-filter-key') || 'all';
        activeValue = chip.getAttribute('data-filter-value') || 'all';
        if (activeValue === 'all') {
          activeKey = 'all';
        }
        apply();
      });
    });
    apply();
  }

  function initVideos() {
    qsa('.video-shell').forEach(function (box) {
      var source = box.getAttribute('data-source');
      var video = qs('video', box);
      var cover = qs('.video-cover', box);
      if (!source || !video) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      }

      function play() {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          box.classList.remove('is-playing');
        }
      });
      video.addEventListener('ended', function () {
        box.classList.remove('is-playing');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFiltering();
    initVideos();
  });
})();
