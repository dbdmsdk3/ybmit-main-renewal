/* =========================================================
   시안 뷰어 : 탭을 누르면 아래 iframe 의 시안 페이지를 바꿈
   ========================================================= */
(function () {
  const frame = document.getElementById('viewer-frame');
  const tabs = document.querySelectorAll('.viewer-tab');
  if (!frame || !tabs.length) return;

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });
      frame.src = tab.dataset.src;
    });
  });
})();
