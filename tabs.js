/* =========================================================
   공용 탭 전환 ([data-tabs] 컨테이너)
   - role="tab" 버튼의 aria-controls 로 연결된 패널만 보이게 함
   - 좌우 화살표 키로 탭 이동
   ※ 시험활용 채용정보(career-live)는 career.js 에서 따로 처리
   ========================================================= */
(function () {
  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    const tabs = Array.from(root.querySelectorAll('[role="tab"]'));

    function select(tab, focus) {
      tabs.forEach(function (t) {
        const on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        select(next, true);
      });
    });
  });
})();
