(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-main-nav]");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    setupHero();
    setupFilters();
  });

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var input = document.querySelector("[data-filter-input]");
    var list = document.querySelector("[data-filter-list]");

    if (!input || !list) {
      return;
    }

    var items = Array.prototype.slice.call(list.children);
    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
    var emptyState = document.querySelector("[data-empty-state]");

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function matchesSelect(item, select) {
      var key = select.getAttribute("data-filter-select");
      var value = normalize(select.value);

      if (!value) {
        return true;
      }

      return normalize(item.getAttribute("data-" + key)).indexOf(value) !== -1;
    }

    function applyFilter() {
      var keyword = normalize(input.value);
      var visibleCount = 0;

      items.forEach(function (item) {
        var text = normalize(item.textContent + " " + Array.prototype.map.call(item.attributes, function (attribute) {
          return attribute.value;
        }).join(" "));
        var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
        var selectsMatched = selects.every(function (select) {
          return matchesSelect(item, select);
        });
        var isVisible = keywordMatched && selectsMatched;

        item.hidden = !isVisible;

        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    }

    input.addEventListener("input", applyFilter);
    selects.forEach(function (select) {
      select.addEventListener("change", applyFilter);
    });
    applyFilter();
  }
})();
