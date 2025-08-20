// Minimal, smooth slider με touch gestures και arrow hint

(function () {
  const slidesEl = document.getElementById('slides');
  const hintEl = document.getElementById('hint');

  const state = {
    index: 0,            // 0 ή 1
    startX: 0,
    currentX: 0,
    dragging: false,
    width: () => window.innerWidth
  };

  const clampIndex = (i) => Math.max(0, Math.min(1, i));
  const setIndex = (i, opts = { animate: true }) => {
    state.index = clampIndex(i);
    if (opts.animate) {
      slidesEl.style.transition = 'transform 300ms cubic-bezier(.22,.61,.36,1)';
    } else {
      slidesEl.style.transition = 'none';
    }
    const x = -state.index * state.width();
    slidesEl.style.transform = `translateX(${x}px)`;

    // Hint: κρύψ’ το αν ο χρήστης άλλαξε slide ή έκανε αλληλεπίδραση
    if (state.index > 0) {
      hideHint();
    }
  };

  const hideHint = () => {
    if (!hintEl) return;
    hintEl.classList.add('hide');
    // Προληπτικά: αφαιρούμε μετά από λίγο από το flow
    setTimeout(() => {
      if (hintEl && hintEl.parentNode) {
        // Μπορείς να το αφήσεις αν προτιμάς
        // hintEl.parentNode.removeChild(hintEl);
      }
    }, 600);
  };

  // Τouch handlers
  const onTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    state.dragging = true;
    state.startX = e.touches[0].clientX;
    state.currentX = state.startX;
    slidesEl.style.transition = 'none';
  };

  const onTouchMove = (e) => {
    if (!state.dragging) return;
    state.currentX = e.touches[0].clientX;
    const delta = state.currentX - state.startX;

    // Εφαρμόζουμε αντίσταση στα άκρα (rubber band)
    let offset = -state.index * state.width() + delta;
    const atFirst = state.index === 0 && delta > 0;
    const atLast = state.index === 1 && delta < 0;
    if (atFirst || atLast) {
      offset *= 0.35;
    }
    slidesEl.style.transform = `translateX(${offset}px)`;
  };

  const onTouchEnd = () => {
    if (!state.dragging) return;
    state.dragging = false;

    const delta = state.currentX - state.startX;
    const threshold = Math.min(120, state.width() * 0.25); // ευαίσθητο αλλά όχι υπερβολικό

    if (Math.abs(delta) > threshold) {
      if (delta < 0) {
        setIndex(state.index + 1); // swipe left => επόμενο
      } else {
        setIndex(state.index - 1); // swipe right => προηγούμενο
      }
    } else {
      // επιστροφή στη θέση του
      setIndex(state.index, { animate: true });
    }

    hideHint();
  };

  // Mouse drag (προαιρετικό, για desktop)
  let mouseDown = false;
  const onMouseDown = (e) => {
    mouseDown = true;
    state.dragging = true;
    state.startX = e.clientX;
    state.currentX = e.clientX;
    slidesEl.style.transition = 'none';
  };
  const onMouseMove = (e) => {
    if (!mouseDown || !state.dragging) return;
    state.currentX = e.clientX;
    const delta = state.currentX - state.startX;

    let offset = -state.index * state.width() + delta;
    const atFirst = state.index === 0 && delta > 0;
    const atLast = state.index === 1 && delta < 0;
    if (atFirst || atLast) offset *= 0.35;

    slidesEl.style.transform = `translateX(${offset}px)`;
  };
  const onMouseUp = () => {
    if (!mouseDown) return;
    mouseDown = false;
    onTouchEnd();
  };
  const onMouseLeave = () => {
    if (mouseDown) onMouseUp();
  };

  // Resize: επανατοποθέτηση για νέα width
  const onResize = () => {
    setIndex(state.index, { animate: false });
  };

  // Πρώτη τοποθέτηση
  setIndex(0, { animate: false });

  // Listeners
  slidesEl.addEventListener('touchstart', onTouchStart, { passive: true });
  slidesEl.addEventListener('touchmove', onTouchMove, { passive: true });
  slidesEl.addEventListener('touchend', onTouchEnd);
  slidesEl.addEventListener('touchcancel', onTouchEnd);

  slidesEl.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  slidesEl.addEventListener('mouseleave', onMouseLeave);

  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);

  // Κρύψε hint μετά από Χ δευτερόλεπτα αν δεν αλληλεπιδρά ο χρήστης
  setTimeout(hideHint, 4500);
})();