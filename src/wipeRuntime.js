// File: src/wipeRuntime.js
export function initWipeRuntime(root = document) {
  const pairs = root.querySelectorAll('.sb-wipepair');
  if (!pairs.length) return;

  const scroller = root === document ? window : root;

  pairs.forEach((wrap) => {
    if (wrap.__wipeBound) return;
    wrap.__wipeBound = true;

    const next = wrap.querySelector('.sb-wipe-next');
    if (!next) return;

    let ticking = false;

    function update() {
      ticking = false;

      const r = wrap.getBoundingClientRect();
      const vh = (root === document ? window.innerHeight : root.clientHeight);

      // Calculate progress through the scroll area
      const progress = Math.max(0, Math.min(1, -r.top / (r.height - vh)));

      // Convert to clip-path percentage
      const topPct = (100 - progress * 100) + '%';
      next.style.setProperty('--wipeTop', topPct);
    }

    const onScroll = () => { 
      if (!ticking) { 
        ticking = true; 
        requestAnimationFrame(update); 
      } 
    };

    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    
    // Initial update
    update();
  });
}