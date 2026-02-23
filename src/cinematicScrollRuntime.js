// File: src/cinematicScrollRuntime.js
// Cinematic scroll: media stays fixed while in view, text scrolls naturally over it

export function initCinematicScrollRuntime(root = document) {
  const sections = (root || document).querySelectorAll('.sb-cinematic-scroll');

  sections.forEach((section) => {
    if (section.__cinematicBound) return;
    section.__cinematicBound = true;

    const mediaWrap = section.querySelector('.cs-media-wrap');
    const mediaSlides = section.querySelectorAll('.cs-media-slide');
    const textSlides = section.querySelectorAll('.cs-text-slide');

    if (!mediaWrap || !mediaSlides.length) return;

    const slideCount = parseInt(section.dataset.slideCount || '1');
    let currentSlide = 0;
    let ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    function update() {
      ticking = false;

      const vh = window.innerHeight;
      const sectionRect = section.getBoundingClientRect();

      // Control media wrap position based on scroll
      // Phase 1: Section entering - media scrolls with page (absolute top)
      // Phase 2: Section in view - media fixed at viewport top
      // Phase 3: Section exiting - media scrolls with page (absolute bottom)

      if (sectionRect.top > 0) {
        // Section hasn't reached top yet - media at top of section
        mediaWrap.classList.remove('is-fixed', 'is-bottom');
      } else if (sectionRect.bottom > vh) {
        // Section top is above viewport, bottom is below - media fixed
        mediaWrap.classList.add('is-fixed');
        mediaWrap.classList.remove('is-bottom');
      } else {
        // Section is exiting - media at bottom of section
        mediaWrap.classList.remove('is-fixed');
        mediaWrap.classList.add('is-bottom');
      }

      // Multi-slide: handle crossfades based on which text is in view
      if (slideCount > 1) {
        let bestSlide = 0;
        let bestVisibility = -1;

        textSlides.forEach((textSlide, i) => {
          const textInner = textSlide.querySelector('.cs-text-inner');
          if (!textInner) return;

          const innerRect = textInner.getBoundingClientRect();

          // Calculate how much of the text inner is in the viewport
          const top = Math.max(0, innerRect.top);
          const bottom = Math.min(vh, innerRect.bottom);
          const visibleHeight = Math.max(0, bottom - top);
          const visibility = visibleHeight / innerRect.height;

          // Also consider position - prefer text that's in the middle/lower part of screen
          const centerY = (innerRect.top + innerRect.bottom) / 2;
          const idealCenter = vh * 0.6;
          const positionScore = 1 - Math.abs(centerY - idealCenter) / vh;

          const score = visibility * 0.7 + positionScore * 0.3;

          if (score > bestVisibility && visibility > 0.1) {
            bestVisibility = score;
            bestSlide = i;
          }
        });

        // Check if text has scrolled past (for transitioning to next slide)
        textSlides.forEach((textSlide, i) => {
          const textInner = textSlide.querySelector('.cs-text-inner');
          if (!textInner) return;

          const innerRect = textInner.getBoundingClientRect();

          if (innerRect.bottom < vh * 0.3 && i < slideCount - 1) {
            const nextText = textSlides[i + 1]?.querySelector('.cs-text-inner');
            if (nextText) {
              const nextRect = nextText.getBoundingClientRect();
              if (nextRect.top < vh) {
                bestSlide = Math.max(bestSlide, i + 1);
              }
            }
          }
        });

        // Update media if slide changed
        if (bestSlide !== currentSlide) {
          currentSlide = bestSlide;

          mediaSlides.forEach((slide, i) => {
            if (i === currentSlide) {
              slide.classList.add('active');
            } else {
              slide.classList.remove('active');
            }
          });
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    // Initial state
    mediaSlides[0].classList.add('active');
    onScroll();
  });
}
