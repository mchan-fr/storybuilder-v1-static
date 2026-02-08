// fadeRuntime.js - Only fade elements that start below the fold
// Theory: Setting opacity:0 on already-visible elements causes layout thrashing

export function initFadeRuntime(root = document) {
  requestAnimationFrame(() => {
    const fadeBlocks = root.querySelectorAll('[data-fade-scroll="true"]');
    if (!fadeBlocks.length) return;

    const scrollTarget = root === document ? window : root;
    const viewportHeight = root === document ? window.innerHeight : root.clientHeight;

    // Only hide blocks that are BELOW the viewport initially
    const blocksToFade = [];
    
    fadeBlocks.forEach((block) => {
      const rect = block.getBoundingClientRect();
      
      // Only fade if block is below viewport
      if (rect.top > viewportHeight) {
        block.style.opacity = '0';
        block.style.transform = 'translateY(20px)';
        blocksToFade.push(block);
        console.log('[FADE] Will fade block:', block.tagName, 'top:', rect.top);
      } else {
        // Block is already visible, leave it alone
        console.log('[FADE] Skipping already-visible block:', block.tagName, 'top:', rect.top);
      }
    });

    if (blocksToFade.length === 0) {
      console.log('[FADE] No blocks need fading (all already visible)');
      return;
    }

    console.log('[FADE] Will observe', blocksToFade.length, 'blocks');

    // Create observer only for blocks that need fading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const block = entry.target;
            block.classList.add('sb-fade-visible');
            observer.unobserve(block);
            console.log('[FADE] Faded in block:', block.tagName);
          }
        });
      },
      {
        root: root === document ? null : root,
        threshold: 0.1,
        rootMargin: '0px'
      }
    );

    // Observe only the blocks that need fading
    requestAnimationFrame(() => {
      blocksToFade.forEach((block) => observer.observe(block));
      console.log('[FADE] Now observing', blocksToFade.length, 'blocks');
    });
  });
}

// Auto-initialize on page load
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initFadeRuntime());
  } else {
    initFadeRuntime();
  }
}