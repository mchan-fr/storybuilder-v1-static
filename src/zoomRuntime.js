// File: src/zoomRuntime.js
// Attach scroll-based zoom behavior to any .sb-zoomsec in a given ROOT.
// If ROOT is a scrolling element (like #preview), we wire to that scroller;
// otherwise we fall back to window.

export function initZoomRuntime(root = document) {
    // Determine the actual scrolling element
    let scroller = window;

    if (root && root !== document && root.nodeType === 1) {
        // Check if this element is actually scrollable
        const style = window.getComputedStyle(root);
        const isScrollable = style.overflow === 'auto' ||
            style.overflow === 'scroll' ||
            style.overflowY === 'auto' ||
            style.overflowY === 'scroll';

        if (isScrollable) {
            scroller = root;
        }
    }

    const secs = (root || document).querySelectorAll('.sb-zoomsec');

    secs.forEach((sec) => {
        if (sec.__zoomBound) return; // avoid double-binding after re-render
        sec.__zoomBound = true;

        const pin = sec.querySelector('.sb-zoom-pin');
        const img = sec.querySelector('.sb-zoom-photo');
        const panel = sec.querySelector('.sb-zoom-panel');
        if (!pin || !img) return;

        // Find the spacer that comes before this section
        const spacer = sec.previousElementSibling;
        const hasValidSpacer = spacer && spacer.classList.contains('sb-zoom-spacer');

        const maxScale = parseFloat(sec.dataset.scaleEnd || '2.6');
        const fadeInCut = parseFloat(sec.dataset.fadeIn || '0.18');
        const fadeOutCut = parseFloat(sec.dataset.fadeOut || '0.18');
        const panelStart = parseFloat(sec.dataset.panelStart || '0.30');
        const panelEnd = parseFloat(sec.dataset.panelEnd || '0.72');
        const fx = parseFloat(sec.dataset.focusX || '0.5');
        const fy = parseFloat(sec.dataset.focusY || '0.5');

        const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
        const lerp = (a, b, t) => a + (b - a) * t;
        const easeOut = (t) => 1 - Math.pow(1 - t, 2);
        const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

        let ticking = false;

        const getVH = () =>
            scroller === window ? window.innerHeight : scroller.clientHeight;

        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }

        function update() {
            ticking = false;

            const vh = getVH();

            // We need to track progress across BOTH spacer + section
            let totalHeight, scrollProgress;

            if (hasValidSpacer) {
                const spacerRect = spacer.getBoundingClientRect();
                const secRect = sec.getBoundingClientRect();

                // Adjust for custom scroller
                let spacerTop = spacerRect.top;
                let secBottom = secRect.bottom;

                if (scroller !== window) {
                    const scrollerRect = scroller.getBoundingClientRect();
                    spacerTop = spacerRect.top - scrollerRect.top;
                    secBottom = secRect.bottom - scrollerRect.top;
                }

                // Combined height of spacer + section
                totalHeight = spacerRect.height + secRect.height;

                // ADD THIS DEBUG LOG HERE:
                console.log('Preview Debug:', {
                    spacerTop,
                    secBottom,
                    vh,
                    shouldShow: !(spacerTop > vh || secBottom < 0)
                });

                // Hide only when completely out of view
                if (spacerTop > vh || secBottom < 0) {
                    pin.style.display = 'none';
                    return;
                }

                // Hide only when completely out of view
                if (spacerTop > vh || secBottom < 0) {
                    pin.style.display = 'none';
                    return;
                }

                pin.style.display = 'block';

                // Calculate progress - delay start until 80% through spacer
                const spacerScrolled = Math.max(0, -spacerTop); // How much of spacer has scrolled past
                const delayAmount = spacerRect.height * 0.8; // Wait until 80% through spacer

                // ADD THIS DEBUG:
                console.log('Delay check:', {
                    spacerScrolled,
                    delayAmount,
                    shouldShow: spacerScrolled >= delayAmount
                });

                // Don't show pin until we're past the delay point
                if (spacerScrolled < delayAmount) {
                    pin.style.display = 'none';
                    return;
                }

                const effectiveScrolled = Math.max(0, spacerScrolled - delayAmount);
                scrollProgress = clamp(effectiveScrolled / (totalHeight * 0.5 + vh), 0, 1);

                // ADD THIS:
                console.log('Final values:', {
                    scrollProgress,
                    opacity: scrollProgress < fadeInCut ? 'fading: ' + (scrollProgress / fadeInCut).toFixed(2) : 'visible',
                    pinDisplay: pin.style.display
                });

                pin.style.display = 'block';

            } else {
                // No spacer - use section only (legacy behavior)
                const r = sec.getBoundingClientRect();
                let adjustedTop = r.top;
                let adjustedBottom = r.bottom;

                if (scroller !== window) {
                    const scrollerRect = scroller.getBoundingClientRect();
                    adjustedTop = r.top - scrollerRect.top;
                    adjustedBottom = r.bottom - scrollerRect.top;
                }

                const overlaps = !(adjustedBottom <= 0 || adjustedTop >= vh);
                if (!overlaps) {
                    pin.style.display = 'none';
                    return;
                }

                totalHeight = r.height;
                scrollProgress = clamp((vh - adjustedTop) / (totalHeight + vh), 0, 1);
            }



            // Fade in/out
            let opacity = 1;
            if (scrollProgress < fadeInCut) {
                opacity = easeOut(scrollProgress / Math.max(fadeInCut, 0.0001));
            } else if (scrollProgress > 1 - fadeOutCut) {
                const t = (1 - scrollProgress) / Math.max(fadeOutCut, 0.0001);
                opacity = easeOut(t);
            }

            // Scale - only during the middle section
            const midStart = fadeInCut;
            const midEnd = 1 - fadeOutCut;
            const midT = clamp(
                (scrollProgress - midStart) / Math.max(midEnd - midStart, 0.0001),
                0,
                1
            );
            const s = lerp(1, maxScale, easeInOut(midT));

            // Apply transforms
            img.style.transformOrigin = `${fx * 100}% ${fy * 100}%`;
            img.style.opacity = opacity.toFixed(4);
            img.style.transform = `translate3d(0,0,0) scale(${s.toFixed(4)})`;

            // Panel
            if (panel) {
                const showPanel = scrollProgress >= panelStart && scrollProgress <= panelEnd;
                if (showPanel) {
                    const local = (scrollProgress - panelStart) / Math.max(panelEnd - panelStart, 0.0001);
                    const inT = local < 0.5 ? local / 0.5 : 1;
                    const outT = local > 0.7 ? (local - 0.7) / 0.3 : 0;
                    const alpha = clamp(easeOut(inT) * (1 - outT), 0, 1);
                    panel.style.opacity = alpha.toFixed(4);
                    const y = lerp(12, 0, easeInOut(local));
                    panel.style.transform = `translateX(-50%) translateY(${y}px)`;
                } else {
                    panel.style.opacity = '0';
                    panel.style.transform = 'translateX(-50%) translateY(12px)';
                }
            }
        }

        // Listen on the right scroller
        scroller.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);

        // Initial paint
        onScroll();
    });
}