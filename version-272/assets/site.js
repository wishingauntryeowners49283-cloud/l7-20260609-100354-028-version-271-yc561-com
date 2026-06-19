(function () {
  var body = document.body;
  var menuToggle = document.querySelector(".menu-toggle");
  var navMenu = document.getElementById("nav-menu");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", function () {
      var opened = body.classList.toggle("nav-open");
      menuToggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var thumbs = Array.prototype.slice.call(document.querySelectorAll("[data-hero-thumb]"));
  var current = 0;
  var timer = null;

  function setHero(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });
    thumbs.forEach(function (thumb, thumbIndex) {
      thumb.classList.toggle("active", thumbIndex === current);
    });
  }

  function scheduleHero() {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        setHero(current + 1);
      }, 5200);
    }
  }

  thumbs.forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      var index = parseInt(thumb.getAttribute("data-hero-thumb"), 10);
      setHero(index);
      scheduleHero();
    });
  });

  setHero(0);
  scheduleHero();

  var pageSearch = document.getElementById("page-search");
  var yearFilter = document.getElementById("year-filter");
  var typeFilter = document.getElementById("type-filter");
  var clearFilter = document.getElementById("clear-filter");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

  function getCardText(card) {
    return [
      card.getAttribute("data-title"),
      card.getAttribute("data-region"),
      card.getAttribute("data-type"),
      card.getAttribute("data-year"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-category"),
      card.textContent
    ].join(" ").toLowerCase();
  }

  function applyFilters() {
    var keyword = pageSearch ? pageSearch.value.trim().toLowerCase() : "";
    var year = yearFilter ? yearFilter.value : "";
    var type = typeFilter ? typeFilter.value : "";

    cards.forEach(function (card) {
      var matchesKeyword = !keyword || getCardText(card).indexOf(keyword) !== -1;
      var matchesYear = !year || card.getAttribute("data-year") === year;
      var matchesType = !type || card.getAttribute("data-type") === type;
      card.classList.toggle("is-hidden", !(matchesKeyword && matchesYear && matchesType));
    });
  }

  if (pageSearch) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query) {
      pageSearch.value = query;
    }
    pageSearch.addEventListener("input", applyFilters);
  }

  if (yearFilter) {
    yearFilter.addEventListener("change", applyFilters);
  }

  if (typeFilter) {
    typeFilter.addEventListener("change", applyFilters);
  }

  if (clearFilter) {
    clearFilter.addEventListener("click", function () {
      if (pageSearch) {
        pageSearch.value = "";
      }
      if (yearFilter) {
        yearFilter.value = "";
      }
      if (typeFilter) {
        typeFilter.value = "";
      }
      applyFilters();
    });
  }

  applyFilters();
})();
