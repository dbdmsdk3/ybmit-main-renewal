/* =========================================================
   시험활용 채용정보 (career-live)
   - 탭 전환 : 채용정보 / 기업 / 대학
   - 실시간 롤링 : 일정 간격으로 맨 위 줄이 올라가고 맨 아래에 새 줄이 들어옴
   - 마우스를 올리거나 포커스가 들어오면 멈춤, 화면 밖으로 나가면 멈춤
   ========================================================= */
(function () {
  const ROLL_INTERVAL = 2800; // 다음 줄로 넘어가는 간격(ms)
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('.career-live').forEach(function (root) {
    const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
    const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));
    let timer = null;
    let paused = false;
    let inView = true;


    /* 보이는 줄 수보다 항목이 적으면 복제해서 계속 돌 수 있게 함 */
    function ensureLoop(list) {
      const rows = parseInt(getComputedStyle(root).getPropertyValue('--career-rows'), 10) || 4;
      const items = Array.from(list.children).filter(function (li) { return !li.hasAttribute('data-clone'); });
      if (list.querySelector('[data-clone]') || items.length > rows) return;
      let i = 0;
      while (list.children.length <= rows) {
        const clone = items[i % items.length].cloneNode(true);
        clone.setAttribute('data-clone', '');
        clone.setAttribute('aria-hidden', 'true');
        clone.querySelectorAll('a').forEach(function (a) { a.tabIndex = -1; });
        list.appendChild(clone);
        i++;
      }
    }

    function activeList() {
      const panel = panels.find(function (p) { return !p.hidden; });
      return panel ? panel.querySelector('.career-live__list') : null;
    }

    /* 한 줄 올리기 : 이동이 끝나면 맨 위 줄을 맨 아래로 옮기고 위치를 되돌림 */
    function roll() {
      const list = activeList();
      if (!list || paused || !inView || reduceMotion.matches) return;
      list.classList.add('is-rolling');
      // transitionend 는 탭이 백그라운드일 때 등 오지 않을 수 있어 이동 시간만큼 기다린 뒤 처리
      const rollMs = parseFloat(getComputedStyle(root).getPropertyValue('--career-roll-ms')) || 450;
      window.setTimeout(function () {
        const first = list.firstElementChild;
        list.classList.remove('is-rolling');
        first.classList.remove('is-new'); // 옮겨진 줄에서 강조가 다시 재생되지 않게
        list.appendChild(first);
        // 새로 화면에 들어온 맨 아래 줄 강조 (시안 E 는 main-e.css 에서 끔)
        const rows = parseInt(getComputedStyle(root).getPropertyValue('--career-rows'), 10) || 4;
        const entered = list.children[rows - 1];
        if (entered) {
          entered.classList.remove('is-new');
          void entered.offsetWidth; // 애니메이션 재시작
          entered.classList.add('is-new');
          window.setTimeout(function () { entered.classList.remove('is-new'); }, 1700);
        }
      }, rollMs + 30);
    }

    function start() {
      stop();
      timer = window.setInterval(roll, ROLL_INTERVAL);
    }
    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    /* 탭 전환 */
    function select(tab, focus) {
      tabs.forEach(function (t) {
        const on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
      const list = activeList();
      if (list) ensureLoop(list);
      start();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      // 좌우 화살표로 탭 이동
      tab.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        select(next, true);
      });
    });

    /* 일시정지 : 마우스 오버 · 포커스 */
    let hovering = false;
    let keyboardFocus = false;
    function syncPause() { paused = hovering || keyboardFocus; }
    root.addEventListener('mouseenter', function () { hovering = true; syncPause(); });
    root.addEventListener('mouseleave', function () { hovering = false; syncPause(); });
    // 키보드로 들어온 포커스일 때만 멈춤 (마우스로 탭을 눌러 생긴 포커스로는 멈추지 않음)
    root.addEventListener('focusin', function (e) { keyboardFocus = e.target.matches(':focus-visible'); syncPause(); });
    root.addEventListener('focusout', function (e) { if (!root.contains(e.relatedTarget)) { keyboardFocus = false; syncPause(); } });

    /* 화면 밖에 있을 때는 롤링하지 않음 */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { inView = entries[0].isIntersecting; }).observe(root);
    }

    select(tabs.find(function (t) { return t.classList.contains('is-active'); }) || tabs[0], false);
  });
})();
