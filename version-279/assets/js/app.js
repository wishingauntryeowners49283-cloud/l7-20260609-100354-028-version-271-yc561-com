(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-slide-dot]'));
    var next = hero.querySelector('[data-slide-next]');
    var prev = hero.querySelector('[data-slide-prev]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function resetTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        resetTimer();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        resetTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide-dot') || 0));
        resetTimer();
      });
    });

    startTimer();
  }

  var searchForm = document.querySelector('[data-search-form]');
  var searchResults = document.querySelector('[data-search-results]');
  var filterRow = document.querySelector('[data-filter-row]');

  if (searchForm && searchResults && window.MOVIE_INDEX) {
    var input = searchForm.querySelector('input[name="q"]');
    var params = new URLSearchParams(window.location.search);
    var currentFilter = '';

    function createCard(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
        '    <span class="poster-shell">',
        '      <img src="' + movie.poster + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '      <span class="poster-gradient"></span>',
        '    </span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="movie-meta"><a href="search.html?q=' + encodeURIComponent(movie.category) + '">' + escapeHtml(movie.category) + '</a><span>' + escapeHtml(movie.year) + '</span></div>',
        '    <h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="tag-row">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    function movieText(movie) {
      return [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category,
        movie.oneLine,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase();
    }

    function render() {
      var keyword = (input.value || '').trim().toLowerCase();
      var filter = currentFilter.toLowerCase();
      var result = window.MOVIE_INDEX.filter(function (movie) {
        var source = movieText(movie);
        var keywordMatched = !keyword || source.indexOf(keyword) !== -1;
        var filterMatched = !filter || source.indexOf(filter) !== -1;
        return keywordMatched && filterMatched;
      }).slice(0, 120);

      if (!result.length) {
        searchResults.innerHTML = '<div class="empty-card">暂未匹配到影片，请尝试其他关键词。</div>';
        return;
      }

      searchResults.innerHTML = result.map(createCard).join('');
    }

    if (params.get('q')) {
      input.value = params.get('q');
    }

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });

    input.addEventListener('input', render);

    if (filterRow) {
      filterRow.addEventListener('click', function (event) {
        var button = event.target.closest('button[data-filter]');
        if (!button) {
          return;
        }
        currentFilter = button.getAttribute('data-filter') || '';
        Array.prototype.slice.call(filterRow.querySelectorAll('button')).forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        render();
      });
    }

    render();
  }
})();
