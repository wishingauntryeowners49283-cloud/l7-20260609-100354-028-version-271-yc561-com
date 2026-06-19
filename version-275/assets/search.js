
(function () {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-page-input]');
    var results = document.querySelector('[data-search-results]');
    var empty = document.querySelector('[data-search-empty]');
    var tagButtons = document.querySelectorAll('[data-search-tag]');
    var records = window.MovieSearchIndex || [];

    function getQuery() {
        var params = new URLSearchParams(window.location.search);
        return (params.get('q') || '').trim();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function recordText(record) {
        return [
            record.title,
            record.year,
            record.region,
            record.type,
            record.genre,
            (record.tags || []).join(' '),
            record.summary
        ].join(' ').toLowerCase();
    }

    function card(record) {
        var tags = (record.tags || []).slice(0, 3).map(function (tag) {
            return '<span class="tag">' + escapeHtml(tag) + '</span>';
        }).join('');

        return '<article class="movie-card">' +
            '<a class="poster-link" href="' + escapeHtml(record.url) + '">' +
            '<img src="' + escapeHtml(record.cover) + '" alt="' + escapeHtml(record.title) + '" loading="lazy">' +
            '<span class="poster-shade"></span>' +
            '<span class="poster-play">▶</span>' +
            '<span class="year-badge">' + escapeHtml(record.year) + '</span>' +
            '</a>' +
            '<div class="movie-card-body">' +
            '<h2><a href="' + escapeHtml(record.url) + '">' + escapeHtml(record.title) + '</a></h2>' +
            '<p>' + escapeHtml(record.summary) + '</p>' +
            '<div class="movie-meta-row"><span>' + escapeHtml(record.region) + '</span><span>' + escapeHtml(record.type) + '</span></div>' +
            '<div class="movie-tags">' + tags + '</div>' +
            '</div>' +
            '</article>';
    }

    function render(query) {
        var keyword = (query || '').trim().toLowerCase();

        if (input) {
            input.value = query || '';
        }

        if (!keyword) {
            if (results) {
                results.innerHTML = '';
            }
            if (empty) {
                empty.style.display = '';
                empty.textContent = '输入关键词后显示匹配影片。';
            }
            return;
        }

        var matches = records.filter(function (record) {
            return recordText(record).indexOf(keyword) !== -1;
        }).slice(0, 120);

        if (results) {
            results.innerHTML = matches.map(card).join('');
        }

        if (empty) {
            empty.style.display = matches.length ? 'none' : '';
            empty.textContent = matches.length ? '' : '没有找到匹配影片。';
        }
    }

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = input ? input.value.trim() : '';
            var url = './search.html' + (query ? '?q=' + encodeURIComponent(query) : '');
            window.history.replaceState(null, '', url);
            render(query);
        });
    }

    tagButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            var tag = button.getAttribute('data-search-tag') || '';
            var url = './search.html?q=' + encodeURIComponent(tag);
            window.history.replaceState(null, '', url);
            render(tag);
        });
    });

    render(getQuery());
})();
