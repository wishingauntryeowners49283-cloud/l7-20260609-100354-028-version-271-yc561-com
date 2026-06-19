
(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var sliders = document.querySelectorAll('[data-hero-slider]');

    sliders.forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
                showSlide(index);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    });

    var filterGrids = document.querySelectorAll('[data-filter-grid]');

    filterGrids.forEach(function (grid) {
        var section = grid.closest('.content-section') || document;
        var input = section.querySelector('[data-filter-input]');
        var yearSelect = section.querySelector('[data-year-filter]');
        var items = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card], .rank-row'));

        function textOf(item) {
            if (item.hasAttribute('data-title')) {
                return [
                    item.getAttribute('data-title') || '',
                    item.getAttribute('data-year') || '',
                    item.getAttribute('data-region') || '',
                    item.getAttribute('data-genre') || '',
                    item.getAttribute('data-tags') || '',
                    item.textContent || ''
                ].join(' ').toLowerCase();
            }

            return (item.textContent || '').toLowerCase();
        }

        function applyFilter() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';

            items.forEach(function (item) {
                var haystack = textOf(item);
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchYear = !year || haystack.indexOf(year) !== -1;
                item.classList.toggle('is-hidden', !(matchQuery && matchYear));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }
    });
})();
