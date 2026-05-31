/* v3 site.js — loads JSON catalogues and supports live search filter */
(function(){
  'use strict';
  function esc(t){ if(t==null) return ''; var d=document.createElement('div'); d.textContent=String(t); return d.innerHTML; }
  function nl(t){ return esc(t).replace(/\n/g,'<br>'); }
  var IMG_PREFIX = '';
  function img(src){
    if(!src) return '';
    if(IMG_PREFIX && /^images\//i.test(src)) return IMG_PREFIX + src;
    return src;
  }

  function buildItem(item, i){
    var search = ((item.title||'')+' '+(item.description||'')+' '+(item.tags||'')+' '+(item.cost||'')).toLowerCase();
    var n = String(i+1).padStart(2,'0');
    return '<article class="entry js-filter-item" data-search="'+esc(search)+'">'+
      '<div class="img"><img src="'+esc(img(item.image))+'" alt="'+esc(item.title)+'"></div>'+
      '<div class="body">'+
        '<div class="num">— Nº '+n+' —</div>'+
        '<h3>'+esc(item.title)+'</h3>'+
        '<p>'+nl(item.description)+'</p>'+
        (item.cost ? '<div class="cost"><b>Hire</b>'+nl(item.cost)+'</div>' : '')+
      '</div>'+
    '</article>';
  }

  function buildPersonal(item){
    if(item.type === 'intro'){
      return '<div class="p-intro js-filter-keep"><h2>A note on <em>'+esc(item.title)+'</em></h2><p>'+nl(item.description)+'</p></div>';
    }
    if(item.type === 'heading'){
      return '<div class="p-heading js-filter-keep">'+esc(item.title)+'</div>';
    }
    var cls = item.size === 'full' ? 'p-card full js-filter-item' : 'p-card js-filter-item';
    var search = ((item.title||'')+' '+(item.description||'')+' '+(item.category||'')+' '+(item.tags||'')).toLowerCase();
    return '<div class="'+cls+'" data-search="'+esc(search)+'">'+
      '<div class="imgw"><img src="'+esc(img(item.image))+'" alt="'+esc(item.title)+'"></div>'+
      '<h4>'+esc(item.title)+'</h4>'+
      '<p>'+nl(item.description)+'</p>'+
    '</div>';
  }

  function wireSearch(container){
    var inputId = container.getAttribute('data-search-input');
    if(!inputId) return;
    var input = document.getElementById(inputId);
    if(!input) return;
    input.addEventListener('input', function(){
      var q = (input.value||'').trim().toLowerCase();
      var items = container.querySelectorAll('.js-filter-item');
      var anyVisible = false;
      items.forEach(function(el){
        if(!q || (el.getAttribute('data-search')||'').indexOf(q) !== -1){
          el.style.display = '';
          anyVisible = true;
        } else { el.style.display = 'none'; }
      });
      var empty = container.querySelector('.js-filter-empty');
      if(empty) empty.remove();
      if(!anyVisible){
        var div = document.createElement('div');
        div.className = 'js-filter-empty';
        div.style.cssText = 'grid-column:1/-1;text-align:center;padding:60px 0;color:var(--gold-deep);font-family:Marcellus,serif;font-style:italic;font-size:18px;letter-spacing:.1em';
        div.innerHTML = '— No items match &ldquo;'+esc(q)+'&rdquo; —';
        container.appendChild(div);
      }
    });
  }

  function load(container){
    var src = container.getAttribute('data-items-src');
    var type = container.getAttribute('data-items-type') || 'items';
    IMG_PREFIX = container.getAttribute('data-image-prefix') || '';
    if(!src) return;
    fetch(src).then(function(r){return r.json();}).then(function(items){
      var html = '';
      var fn = type === 'personal' ? buildPersonal : buildItem;
      for(var i=0;i<items.length;i++) html += fn(items[i], i);
      container.innerHTML = html;
      wireSearch(container);
    }).catch(function(){
      container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--gold-deep);font-family:Marcellus,serif;font-style:italic">Unable to load items.</p>';
    });
  }

  function init(){
    var c = document.getElementById('items-container');
    if(c) load(c);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
