/**
 * Dynamically loads items from a JSON file and renders them into the page.
 * Used by thedecor.html and thegames.html to avoid manual HTML updates.
 *
 * Usage: add data-items-src="data/decor.json" to the container element
 *        e.g. <div id="items-container" data-items-src="data/decor.json"></div>
 */
(function () {
  'use strict';

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  function buildItemCard(item, index) {
    var delay = index < 2 ? 100 : 200;
    // Convert newlines in description and cost to <br> tags
    var descriptionHtml = escapeHtml(item.description).replace(/\n/g, '<br>');
    var costHtml = escapeHtml(item.cost).replace(/\n/g, '<br>');

    return (
      '<div class="col-md-12 col-lg-6 mb-12" data-aos="fade-up" data-aos-delay="' + delay + '">' +
        '<div class="media-29191 text-center h-100">' +
          '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" class="img-fluid">' +
          '<h3>' + escapeHtml(item.title) + '</h3>' +
          '<p>' + descriptionHtml + '</p>' +
          '<h3>Cost<p>' + costHtml + '</p></h3>' +
        '</div>' +
      '</div>'
    );
  }

  function loadItems() {
    var container = document.getElementById('items-container');
    if (!container) return;

    var src = container.getAttribute('data-items-src');
    if (!src) return;

    // Use jQuery if available (it's already on the page), otherwise fetch
    if (window.jQuery) {
      jQuery.getJSON(src)
        .done(function (items) {
          renderItems(container, items);
        })
        .fail(function () {
          container.innerHTML = '<div class="col-12 text-center"><p>Unable to load items. Please try again later.</p></div>';
        });
    } else if (window.fetch) {
      fetch(src)
        .then(function (res) { return res.json(); })
        .then(function (items) {
          renderItems(container, items);
        })
        .catch(function () {
          container.innerHTML = '<div class="col-12 text-center"><p>Unable to load items. Please try again later.</p></div>';
        });
    }
  }

  function renderItems(container, items) {
    var html = '';
    for (var i = 0; i < items.length; i++) {
      html += buildItemCard(items[i], i);
    }
    container.innerHTML = html;

    // Re-initialise AOS so the new elements animate in
    if (window.AOS) {
      AOS.refresh();
    }
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadItems);
  } else {
    loadItems();
  }
})();
