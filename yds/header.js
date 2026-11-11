(function () {
  const header = document.getElementById('header');
  const headerWrap = header.querySelector('.header-wrap');
  const gnb = document.getElementById('gnb');
  const gnbItems = gnb.querySelectorAll('.gnb-item');
  const related = header.querySelector('.util-related');
  const relatedBtn = header.querySelector('.util-related-btn');
  const menuBtn = header.querySelector('.menu-btn');

  // 반응형 구간 / 터치 기기 판별
  const mobileQuery = window.matchMedia('(max-width: 768px)');
  const touchQuery = window.matchMedia('(hover: none)');

  // 하위 메뉴가 있는 항목 표시 (모바일 화살표용)
  gnbItems.forEach(function (item) {
    if (item.querySelector('.gnb-sub')) item.classList.add('has-sub');
  });

  /* ---------- 메가메뉴 (데스크톱 · 태블릿) ----------
     열 때 소메뉴까지 포함한 실제 높이로 늘리고, 닫을 때 CSS 기본 높이로 되돌림
     (높이 전환 자체는 style.css 의 .header-wrap transition) */
  function openMega() {
    if (mobileQuery.matches) return;
    closeRelated();
    header.classList.add('is-open');
    headerWrap.style.height = headerWrap.scrollHeight + 'px';
  }

  function closeMega() {
    header.classList.remove('is-open');
    headerWrap.style.height = '';
  }

  gnb.addEventListener('mouseenter', openMega);
  gnb.addEventListener('mouseleave', closeMega);

  // 키보드 탐색: GNB 안으로 포커스가 들어오면 열고, 밖으로 나가면 닫음
  gnb.addEventListener('focusin', openMega);
  gnb.addEventListener('focusout', function (e) {
    if (!gnb.contains(e.relatedTarget)) closeMega();
  });

  gnbItems.forEach(function (item) {
    const link = item.querySelector('.gnb-link');

    link.addEventListener('click', function (e) {
      if (!item.classList.contains('has-sub')) return;

      // 모바일: 상위 메뉴를 누르면 아코디언 토글
      if (mobileQuery.matches) {
        e.preventDefault();
        toggleAccordion(item);
        return;
      }

      // 터치 태블릿: 첫 탭은 메뉴 열기, 열린 뒤 탭하면 이동
      if (touchQuery.matches && !header.classList.contains('is-open')) {
        e.preventDefault();
        openMega();
      }
    });
  });

  /* ---------- 관련사이트 드롭다운 ---------- */
  function closeRelated() {
    related.classList.remove('is-open');
    relatedBtn.setAttribute('aria-expanded', 'false');
    // 펼친 창은 YDS Popover : 메가메뉴가 열릴 때처럼 스크립트로 닫을 때도 함께 숨긴다
    const relatedPop = document.getElementById(relatedBtn.getAttribute('aria-controls'));
    if (relatedPop) relatedPop.hidden = true;
  }

  relatedBtn.addEventListener('click', function () {
    const willOpen = !related.classList.contains('is-open');
    related.classList.toggle('is-open', willOpen);
    relatedBtn.setAttribute('aria-expanded', String(willOpen));
  });

  /* ---------- 모바일 전체 메뉴 ---------- */
  function setMenuOpen(open) {
    header.classList.toggle('is-menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? '전체 메뉴 닫기' : '전체 메뉴 열기');
  }

  function toggleAccordion(target) {
    const willExpand = !target.classList.contains('is-expanded');
    // 한 번에 하나의 하위 메뉴만 열림
    gnbItems.forEach(function (item) {
      item.classList.remove('is-expanded');
    });
    target.classList.toggle('is-expanded', willExpand);
  }

  menuBtn.addEventListener('click', function () {
    setMenuOpen(!header.classList.contains('is-menu-open'));
  });

  // 모바일 → 태블릿/데스크톱 전환 시 모바일 상태 초기화
  mobileQuery.addEventListener('change', function () {
    setMenuOpen(false);
    closeMega();
    gnbItems.forEach(function (item) {
      item.classList.remove('is-expanded');
    });
  });

  /* ---------- 공통 닫기 ---------- */
  // 바깥 영역 클릭 시 드롭다운 / 터치로 연 메가메뉴 닫기
  document.addEventListener('click', function (e) {
    if (!related.contains(e.target)) closeRelated();
    if (!gnb.contains(e.target)) closeMega();
  });

  // ESC 키로 열린 메뉴 모두 닫기
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeRelated();
    closeMega();
  });
})();

/* ---------- 채용정보 배너 ---------- */
(function () {
  const banner = document.getElementById('recruit-banner');
  if (!banner) return;

  const toggleBtn = banner.querySelector('.recruit-banner-toggle');
  const toggleText = banner.querySelector('.recruit-banner-badge-text');
  const body = banner.querySelector('.recruit-banner-body');
  const viewport = banner.querySelector('.recruit-slider-viewport');
  const track = banner.querySelector('.recruit-slider-track');
  const cards = track.children;
  const prevBtn = banner.querySelector('.recruit-slider-prev');
  const nextBtn = banner.querySelector('.recruit-slider-next');
  const closeBtn = banner.querySelector('.recruit-banner-close');
  const todayCheck = banner.querySelector('.recruit-banner-today-check');
  const HIDDEN_KEY = 'ybm_banner_hidden_until';

  // 오늘 하루 닫기를 선택한 경우 자정까지 숨김
  try {
    const hiddenUntil = Number(localStorage.getItem(HIDDEN_KEY));
    if (hiddenUntil && Date.now() < hiddenUntil) banner.classList.add('is-hidden');
  } catch (e) {
    // 저장소를 쓸 수 없는 환경이면 항상 표시
  }

  /* 펼치기 / 접기 */
  body.classList.add('is-settled');

  toggleBtn.addEventListener('click', function () {
    const willOpen = !body.classList.contains('is-open');
    body.classList.remove('is-settled');
    body.classList.toggle('is-open', willOpen);
    banner.classList.toggle('is-collapsed', !willOpen);
    toggleBtn.setAttribute('aria-expanded', String(willOpen));
    toggleText.textContent = willOpen ? '닫기' : '열기';

    // 움직임 줄이기 설정 등으로 전환이 없으면 transitionend 가 오지 않으므로 바로 처리
    if (willOpen && parseFloat(getComputedStyle(body).transitionDuration) === 0) {
      body.classList.add('is-settled');
    }
  });

  // 펼침 전환이 끝나면 바깥 화살표가 보이도록 overflow 해제
  body.addEventListener('transitionend', function (e) {
    if (e.propertyName === 'max-height' && body.classList.contains('is-open')) {
      body.classList.add('is-settled');
    }
  });

  /* 슬라이더: 한 번에 한 기업씩 이동, 끝에 닿으면 반대쪽 끝으로 순환
     한 화면 카드 수는 CSS(반응형)에서 정한 카드 폭으로 계산 */
  let index = 0;

  function getStep() {
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return cards[0].offsetWidth + gap;
  }

  function getMaxIndex() {
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const visible = Math.round((viewport.clientWidth + gap) / getStep());
    return Math.max(cards.length - visible, 0);
  }

  function render() {
    track.style.transform = 'translateX(' + (-index * getStep()) + 'px)';
  }

  function move(dir) {
    const maxIndex = getMaxIndex();
    index += dir;
    if (index > maxIndex) index = 0;
    if (index < 0) index = maxIndex;
    render();
  }

  prevBtn.addEventListener('click', function () { move(-1); });
  nextBtn.addEventListener('click', function () { move(1); });

  // 화면 폭이 바뀌면 카드 폭이 달라지므로 위치 다시 계산
  window.addEventListener('resize', function () {
    index = Math.min(index, getMaxIndex());
    render();
  });

  /* 배너 닫기 */
  closeBtn.addEventListener('click', function () {
    if (todayCheck.checked) {
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      try {
        localStorage.setItem(HIDDEN_KEY, String(midnight.getTime()));
      } catch (e) {
        // 저장 실패 시 이번 화면에서만 닫힘
      }
    }
    banner.classList.add('is-hidden');
  });
})();
