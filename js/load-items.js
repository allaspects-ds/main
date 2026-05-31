/**
 * Dynamically loads items from a JSON file and renders them into the page.
 * Used by thedecor.html, thegames.html and personal.html.
 *
 * Container attributes:
 *   data-items-src    Path to the JSON file
 *   data-items-type   "items" (default) or "personal"
 *   data-search-input id of an <input> used to filter items live
 */
(function () {
  'use strict';

  function escapeHtml(text) {
    if (text == null) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(text)));
    return div.innerHTML;
  }

  function nl2br(text) {
    return escapeHtml(text).replace(/\n/g, '<br>');
  }

  var IMG_PREFIX = '';
  function resolveImg(src) {
    if (!src) return '';
    if (IMG_PREFIX && /^images\//i.test(src)) return IMG_PREFIX + src;
    return src;
  }

  function buildItemCard(item, index) {
    var delay = index < 2 ? 100 : 200;
    var search = ((item.title || '') + ' ' + (item.description || '') + ' ' + (item.tags || '')).toLowerCase();
    return (
      '<div class="col-md-12 col-lg-6 mb-12 js-filter-item" data-search="' + escapeHtml(search) +
        '" data-aos="fade-up" data-aos-delay="' + delay + '">' +
        '<div class="media-29191 text-center h-100">' +
          '<img src="' + escapeHtml(resolveImg(item.image)) + '" alt="' + escapeHtml(item.title) + '" class="img-fluid">' +
          '<h3>' + escapeHtml(item.title) + '</h3>' +
          '<p>' + nl2br(item.description) + '</p>' +
          '<h3>Cost<p>' + nl2br(item.cost) + '</p></h3>' +
        '</div>' +
      '</div>'
    );
  }

  function buildPersonalEntry(item, index) {
    if (item.type === 'intro') {
      return (
        '<div class="col-md-12 col-lg-12 mb-12 js-filter-keep" data-aos="fade-up">' +
          '<div class="media-29191 text-center h-100">' +
            '<h2>' + escapeHtml(item.title) + '</h2>' +
            '<p>' + nl2br(item.description) + '</p>' +
          '</div>' +
        '</div>'
      );
    }
    if (item.type === 'heading') {
      return (
        '<div class="col-md-12 col-lg-12 mb-12 js-filter-keep" data-aos="fade-up">' +
          '<div class="media-29191 text-center h-100">' +
            '<p>' + escapeHtml(item.title) + '</p>' +
          '</div>' +
        '</div>'
      );
    }
    var col = item.size === 'full' ? 'col-md-12 col-lg-12' : 'col-md-12 col-lg-6';
    var imgStyle = item.size === 'full' ? ' style="width: 90%; height: auto;"' : '';
    var search = ((item.title || '') + ' ' + (item.description || '') + ' ' + (item.category || '') + ' ' + (item.tags || '')).toLowerCase();
    return (
      '<div class="' + col + ' mb-12 js-filter-item" data-search="' + escapeHtml(search) +
        '" data-aos="fade-up" data-aos-delay="200">' +
        '<div class="media-29191 text-center h-100">' +
          (item.title && item.size === 'half' ? '<h4 class="mb-2">' + escapeHtml(item.title) + '</h4>' : '') +
          '<img src="' + escapeHtml(resolveImg(item.image)) + '" alt="' + escapeHtml(item.title) + '" class="img-fluid"' + imgStyle + '>' +
          (item.size === 'full' && item.title ? '<h4 class="mt-3">' + escapeHtml(item.title) + '</h4>' : '') +
          '<p>' + nl2br(item.description) + '</p>' +
        '</div>' +
      '</div>'
    );
  }

  function renderItems(container, items, type) {
    var html = '';
    var builder = type === 'personal' ? buildPersonalEntry : buildItemCard;
    for (var i = 0; i < items.length; i++) {
      html += builder(items[i], i);
    }
    container.innerHTML = html;
    if (window.AOS) AOS.refresh();
    wireSearch(container);
  }

  function wireSearch(container) {
    var inputId = container.getAttribute('data-search-input');
    if (!inputId) return;
    var input = document.getElementById(inputId);
    if (!input) return;

    function apply() {
      var q = (input.value || '').trim().toLowerCase();
      var items = container.querySelectorAll('.js-filter-item');
      var anyVisible = false;
      items.forEach(function (el) {
        if (!q || (el.getAttribute('data-search') || '').indexOf(q) !== -1) {
          el.style.display = '';
          anyVisible = true;
        } else {
          el.style.display = 'none';
        }
      });
      var empty = container.querySelector('.js-filter-empty');
      if (empty) empty.remove();
      if (!anyVisible) {
        var div = document.createElement('div');
        div.className = 'col-12 text-center js-filter-empty';
        div.innerHTML = '<p style="padding:30px 0;opacity:.7">No items match &ldquo;' + escapeHtml(q) + '&rdquo;.</p>';
        container.appendChild(div);
      }
    }
    input.addEventListener('input', apply);
  }

  function loadItems() {
    var container = document.getElementById('items-container');
    if (!container) return;

    var src = container.getAttribute('data-items-src');
    if (!src) return;
    var type = container.getAttribute('data-items-type') || 'items';
    IMG_PREFIX = container.getAttribute('data-image-prefix') || '';

    if (window.jQuery) {
      jQuery.getJSON(src)
        .done(function (items) { renderItems(container, items, type); })
        .fail(function () {
          container.innerHTML = '<div class="col-12 text-center"><p>Unable to load items. Please try again later.</p></div>';
        });
    } else if (window.fetch) {
      fetch(src)
        .then(function (res) { return res.json(); })
        .then(function (items) { renderItems(container, items, type); })
        .catch(function () {
          container.innerHTML = '<div class="col-12 text-center"><p>Unable to load items. Please try again later.</p></div>';
        });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadItems);
  } else {
    loadItems();
  }
})();
