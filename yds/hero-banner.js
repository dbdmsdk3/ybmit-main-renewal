/* =========================================================
   메인 배너 넘버링 (시안 E · F)
   - 모바일에서 손가락으로 배너를 넘기면(스크롤 스냅) 현재 번호를 갱신
   - 데스크톱은 가로 스크롤이 없으므로 번호가 바뀌지 않음
   ========================================================= */
(function () {
  const list = document.querySelector('.hero-banner__list');
  const current = document.querySelector('.hero-banner__count strong');
  if (!list || !current) return;

  let ticking = false;
  list.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      const item = list.querySelector('li');
      const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
      const step = item ? item.getBoundingClientRect().width + gap : 0;
      if (step > 0) current.textContent = String(Math.round(list.scrollLeft / step) + 1);
      ticking = false;
    });
  }, { passive: true });
})();
