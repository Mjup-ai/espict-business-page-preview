// エスピクトスクール 事業所向けページ（試作）
// ・狭い画面のメニュー開閉
// ・専用アプリ実画面のタブ（WAI-ARIA のタブの作法：矢印キー／Home／End で移動）
// JSが動かない場合は、メニューは常に表示、実画面は4枚とも縦に並ぶ。
(function () {
  'use strict';

  // ---- メニュー ----
  var header = document.querySelector('.site-header');
  var toggle = header && header.querySelector('.menu-toggle');
  var menu = document.getElementById('site-menu');
  var wide = window.matchMedia('(min-width: 1300px)');

  function setMenu(open, returnFocus) {
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.menu-toggle__label').textContent = open ? '閉じる' : 'メニュー';
    if (open) header.setAttribute('data-menu-open', '');
    else header.removeAttribute('data-menu-open');
    if (!open && returnFocus) toggle.focus();
  }

  if (toggle && menu) {
    toggle.hidden = false;
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setMenu(false, true);
    });
    // メニューの外をクリックしたら閉じる
    document.addEventListener('click', function (e) {
      if (toggle.getAttribute('aria-expanded') === 'true' && !header.contains(e.target)) setMenu(false);
    });
    // 広い画面に切り替わったら状態を戻す
    wide.addEventListener('change', function () { setMenu(false); });
  }

  // ---- 実画面のタブ ----
  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    var list = root.querySelector('[data-tablist]');
    if (!list) return;
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[data-tab]'));
    var panels = tabs.map(function (tab) { return document.getElementById(tab.getAttribute('data-tab')); });
    if (panels.some(function (p) { return !p; })) return;

    list.setAttribute('role', 'tablist');
    tabs.forEach(function (tab, i) {
      var panel = panels[i];
      tab.id = tab.id || 'tab-' + panel.id;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.setAttribute('tabindex', '0');
    });

    function select(index, moveFocus) {
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
      });
      if (moveFocus) tabs[index].focus();
    }

    list.addEventListener('click', function (e) {
      var tab = e.target.closest('[role="tab"]');
      if (tab) select(tabs.indexOf(tab), false);
    });
    list.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var next = null;
      if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      e.preventDefault();
      select(next, true);
    });

    list.hidden = false;
    select(0, false);
  });
})();
