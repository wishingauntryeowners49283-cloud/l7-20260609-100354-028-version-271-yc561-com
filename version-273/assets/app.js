(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function initMobileMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initHero() {
        var slides = selectAll('.hero-slide');
        var dots = selectAll('.hero-dot');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute('data-slide') || 0));
                start();
            });
        });

        show(0);
        start();
    }

    function initFilters() {
        var panels = selectAll('.filter-panel');
        panels.forEach(function (panel) {
            var section = panel.closest('.section-block') || document;
            var cards = selectAll('.movie-card, .ranking-row', section);
            var keyword = panel.querySelector('.filter-input');
            var type = panel.querySelector('.filter-type');
            var region = panel.querySelector('.filter-region');
            var year = panel.querySelector('.filter-year');
            var category = panel.querySelector('.filter-category');
            var count = panel.querySelector('.result-count');

            function apply() {
                var q = normalize(keyword && keyword.value);
                var t = normalize(type && type.value);
                var r = normalize(region && region.value);
                var y = normalize(year && year.value);
                var c = normalize(category && category.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre')
                    ].join(' '));
                    var match = true;
                    if (q && haystack.indexOf(q) === -1) {
                        match = false;
                    }
                    if (t && normalize(card.getAttribute('data-type')).indexOf(t) === -1) {
                        match = false;
                    }
                    if (r && normalize(card.getAttribute('data-region')).indexOf(r) === -1) {
                        match = false;
                    }
                    if (y && normalize(card.getAttribute('data-year')) !== y) {
                        match = false;
                    }
                    if (c && normalize(card.getAttribute('data-category')) !== c) {
                        match = false;
                    }
                    card.classList.toggle('is-filtered-out', !match);
                    if (match) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = String(visible);
                }
            }

            [keyword, type, region, year, category].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q && keyword) {
                keyword.value = q;
            }
            apply();
        });
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById('moviePlayer');
        var overlay = document.getElementById('playerOverlay');
        var hlsInstance = null;
        var started = false;

        if (!video || !overlay || !streamUrl) {
            return;
        }

        function playVideo() {
            if (started) {
                video.play();
                return;
            }
            started = true;
            overlay.classList.add('is-hidden');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                video.play();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play();
                });
                return;
            }

            video.src = streamUrl;
            video.play();
        }

        overlay.addEventListener('click', playVideo);
        video.addEventListener('click', function () {
            if (!started) {
                playVideo();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initFilters();
    });
})();
