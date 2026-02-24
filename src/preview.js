// File: src/preview.js
import { BLOCKS } from './blocks/index.js';
import { initZoomRuntime } from './zoomRuntime.js';
import { initFadeRuntime } from './fadeRuntime.js';
import { initCinematicScrollRuntime } from './cinematicScrollRuntime.js';
import { calculateExpectedTime, getEffectiveExpectedTime } from './lib/expectedTime.js';
import { resolveAllMediaPaths } from './utils.js';

/* ---------- helpers ---------- */
function initStickyReveal(root) {
  const containers = root.querySelectorAll('.sb-sticky-reveal');
  containers.forEach((c) => {
    const lines = Array.from(c.querySelectorAll('.reveal-line'));
    lines.forEach((el, i) =>
      setTimeout(() => el.classList.add('visible'), 250 + i * 350)
    );
  });
}

function hydrateInlineScripts(root) {
  const scripts = root.querySelectorAll('script');
  scripts.forEach((old) => {
    const s = document.createElement('script');
    [...old.attributes].forEach((a) => {
      if (a.name !== 'type') s.setAttribute(a.name, a.value);
    });
    s.textContent = old.textContent || '';
    old.replaceWith(s);
  });
}

/* ============================================================
   F A D E   T R A N S I T I O N (pair-based only when _wipeOverPrev)
   ============================================================ */
function buildBlocksWithFadePairs({ state, isPreview }) {
  const out = [];
  const blocks = state.blocks || [];

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const mod = BLOCKS[b.type];
    if (!mod) continue;

    const rawHtml = isPreview
      ? (mod.preview ? mod.preview({ block: b, project: state.project || '', blocks }) : '')
      : (mod.exportHTML ? mod.exportHTML({ block: b, blocks }) : '');

    // Wrap with data-block-index for preview scrolling
    const html = isPreview
      ? `<div data-block-index="${i}">${rawHtml}</div>`
      : rawHtml;

    if (!b._wipeOverPrev || out.length === 0) {
      out.push(html);
      continue;
    }

    // Pair this block over the previous
    const heightVh = Math.max(100, Number(b._wipeHeight || 200));
    const prevHtml = out.pop() || '';
    const pair = `
      <div class="sb-fadepair" style="--fadeH:${heightVh}vh">
        <section class="sb-fade-prev">${prevHtml}</section>
        <section class="sb-fade-next">${html}</section>
      </div>
    `;
    out.push(pair);
  }
  return out;
}

/* ---------- BASE CSS ---------- */
const BASE_CSS = `
*{box-sizing:border-box}
html,body{
  min-height:100%;
  height:auto;
  margin:0;
  overflow-x:hidden;
  overflow-y:auto;
  background:#000;
  overscroll-behavior:auto;
}
img,video{display:block;max-width:100%;height:auto}

.text-shadow{text-shadow:0 2px 8px rgba(0,0,0,.55)}
.reveal-line{opacity:0;transform:translateY(6px);transition:.35s ease}
.reveal-line.visible{opacity:1;transform:translateY(0)}
.fullbleed{width:100vw!important;max-width:100vw!important;margin-left:calc(50% - 50vw)!important;margin-right:calc(50% - 50vw)!important}
.breakout-large{width:56rem;max-width:calc(100vw - 2rem);position:relative;left:50%;transform:translateX(-50%)}

/* ========================================
   MUTE BUTTON - SHARED STYLES
   ======================================== */
.mute-btn{
  position:absolute;
  bottom:20px;
  left:20px;
  width:44px;
  height:44px;
  background:rgba(0,0,0,0.7);
  border:none;
  border-radius:50%;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:100;
  transition:background 0.2s ease;
}
.mute-btn:hover{background:rgba(0,0,0,0.9)}
.mute-btn:active{transform:scale(0.95)}

/* Desktop: show desktop mute btn, hide mobile */
.desktop-mute-btn{display:flex}
.mobile-mute-btn{display:none}

/* ========================================
   HERO BLOCK
   ======================================== */
.sb-hero{position:relative}
.sb-hero .hero-image-section{position:relative;height:100vh;min-height:480px}
.sb-hero .media{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.sb-hero .hero-gradient{display:none}
.sb-hero .overlay{position:absolute;inset:0;display:flex;flex-direction:column;z-index:10;padding:1rem}
.sb-hero .overlay.items-start{justify-content:flex-start}
.sb-hero .overlay.items-end{justify-content:flex-end}
.sb-hero .overlay.items-center{justify-content:center}
.sb-hero .overlay.justify-start{align-items:flex-start}
.sb-hero .overlay.justify-end{align-items:flex-end}
.sb-hero .overlay.justify-center{align-items:center}
.pt-20{padding-top:5rem}.pb-20{padding-bottom:5rem}.pl-20{padding-left:5rem}.pr-20{padding-right:5rem}

/* Hero Desktop: show desktop overlay, hide mobile elements */
.sb-hero .desktop-overlay{display:flex}
.sb-hero .mobile-overlay{display:none}
.hero-mobile-deck-section{display:none}

/* Hero Mobile Media Support */
.sb-hero .media-picture{position:absolute;inset:0;width:100%;height:100%}
.sb-hero .media-picture img{width:100%;height:100%;object-fit:cover}
.sb-hero .desktop-media{display:block}
.sb-hero .mobile-media{display:none}

/* ========================================
   PHOTO LEDE SIDE - DESKTOP
   ======================================== */
.pls-desktop{display:flex;gap:0}
.pls-mobile{display:none}
.pls-image{height:100vh;flex-shrink:0}
.pls-media{width:100%;height:100%;object-fit:cover}
.pls-text{height:100vh;display:flex;align-items:center;justify-content:center;padding:0 1.5rem;box-sizing:border-box}

/* ========================================
   PHOTO LEDE - DESKTOP
   ======================================== */
.photo-lede-photo{margin:0 auto 3rem auto;border-radius:0.5rem;overflow:hidden}
.photo-lede-photo[data-desktop-width="max-w-2xl"]{max-width:42rem}
.photo-lede-photo[data-desktop-width="max-w-4xl"]{max-width:56rem}
.photo-lede-photo[data-desktop-width="max-w-6xl"]{max-width:72rem}
.photo-lede-photo[data-desktop-width="w-full"]{max-width:100%}
.photo-lede-photo img{border-radius:0.5rem}
.photo-lede-caption{margin-top:1rem;text-align:center}
.photo-lede-text{margin:0 auto;padding:0 1.5rem;box-sizing:border-box}
.photo-lede-text[data-desktop-width="max-w-md"]{max-width:28rem}
.photo-lede-text[data-desktop-width="max-w-lg"]{max-width:32rem}
.photo-lede-text[data-desktop-width="max-w-4xl"]{max-width:56rem}
.photo-lede-text[data-desktop-width="max-w-6xl"]{max-width:72rem}

/* ========================================
   SPLIT PANEL - DESKTOP
   ======================================== */
@media (min-width: 1025px) {
  .split-panel-wrapper{width:100%;position:relative}
  .split-panel-container{position:relative;min-height:200vh}
  .split-panel-row{position:absolute !important;width:100%;min-height:100vh;display:block !important;flex-direction:row !important}
  .split-panel-row:first-child{top:0}
  .split-panel-row:last-child{top:100vh}
  .split-panel-row::after{content:"";display:table;clear:both}
  .split-image-sticky{position:fixed !important;top:0;width:50% !important;height:100vh !important;z-index:1;opacity:0;clip-path:inset(100% 0 0 0);transition:clip-path 0s linear,opacity 0.3s ease;will-change:clip-path;transform:translateZ(0);backface-visibility:hidden}
  
  .split-panel-row:first-child .split-image-sticky{left:0 !important;right:auto !important}
  .split-panel-row:last-child .split-image-sticky{right:0 !important;left:auto !important}
  
  .split-panel-reversed .split-panel-row:first-child .split-image-sticky{left:auto !important;right:0 !important}
  .split-panel-reversed .split-panel-row:last-child .split-image-sticky{right:auto !important;left:0 !important}
  
  .split-image-content{width:100%;height:100%}
  .split-image-content img,.split-image-content video{width:100%;height:100%;object-fit:cover;display:block}
  .split-text-scroll{width:50% !important;min-height:100vh !important;float:left !important;display:flex !important;align-items:center;justify-content:center;padding:3rem;box-sizing:border-box;position:relative !important;z-index:2;-webkit-font-smoothing:antialiased}
  
  .split-panel-row:first-child .split-text-scroll{float:right !important}
  .split-panel-row:last-child .split-text-scroll{float:left !important}
  
  .split-panel-reversed .split-panel-row:first-child .split-text-scroll{float:left !important}
  .split-panel-reversed .split-panel-row:last-child .split-text-scroll{float:right !important}
  
  .split-text-inner{width:100%;max-width:800px}
  .split-panel-wrapper ~ *{position:relative;z-index:3;background:inherit}
}

/* Desktop/Mobile visibility toggles */
.split-desktop-only { display: block; }
.split-mobile-only { display: none; }

/* ========================================
   SPLIT PANEL - MOBILE STRUCTURE
   ======================================== */
.split-mobile-wrapper {
  position: relative;
  width: 100%;
}

.split-mobile-images {
  display: none;
}

.split-mobile-image {
  position: relative;
  width: 100%;
  height: 75vh;
  min-height: 350px;
  max-height: 550px;
  overflow: hidden;
}

.split-mobile-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.split-mobile-text {
  position: relative;
  z-index: 2;
}

.split-mobile-text-section {
  padding: 1.5rem;
  min-height: auto;
}

.split-mobile-panel {
  display: block;
}

.split-mobile-panel-image {
  width: 100%;
  height: 75vh;
  min-height: 350px;
  max-height: 550px;
  overflow: hidden;
}

.split-mobile-panel-image img,
.split-mobile-panel-image video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.split-mobile-panel-text {
  padding: 1.5rem;
}

.split-mobile-text-inner {
  width: 100%;
  margin: 0 auto;
}

/* ========================================
   ZOOM PHOTO - DESKTOP
   ======================================== */
.sb-zoomsec{position:relative;height:250vh;overflow:visible}
.sb-zoom-pin{position:sticky;top:0;height:100vh;width:100%;overflow:hidden}
.sb-zoom-photo{position:absolute;top:50%;left:50%;min-width:100%;min-height:100%;width:auto;height:auto;transform:translate(-50%,-50%);object-fit:cover;will-change:transform;transition:none}
.sb-zoom-vignette{position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 150px 60px rgba(0,0,0,0.5);opacity:0;transition:opacity 0.3s ease}
.sb-zoom-panel{position:absolute;bottom:40px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:#fff;padding:1rem 1.5rem;border-radius:8px;max-width:400px;text-align:center;opacity:0;transition:opacity 0.3s ease}
.sb-zoom-spacer{position:relative;z-index:1}

/* ========================================
   CINEMATIC SCROLL - DESKTOP
   ======================================== */
.sb-cinematic-scroll{position:relative;z-index:1}
.cs-media-wrap{position:absolute;top:0;left:0;right:0;height:100vh;overflow:hidden;z-index:1}
.cs-media-wrap.is-fixed{position:fixed}
.cs-media-wrap.is-bottom{position:absolute;top:auto;bottom:0}
.cs-media-slide{position:absolute;inset:0;opacity:0;transition:opacity 0.4s ease}
.cs-media-slide.active{opacity:1}
.cs-media-slide img,.cs-media-slide video{width:100%;height:100%;object-fit:cover;display:block}
.cs-placeholder{width:100%;height:100%;background:#1a1a1a;display:flex;align-items:center;justify-content:center;color:#666;font-size:24px}
.cs-text-wrap{position:relative;z-index:10;pointer-events:none;padding-top:100vh}
.cs-text-slide{padding:0 5vw}
.cs-text-inner{padding:40px;pointer-events:auto}
.cs-subhead{margin:0 0 1rem 0}
.cs-text-inner h2{margin:0 0 1rem 0}
.cs-text-inner div{margin:0}

/* Cinematic Scroll Mobile */
.sb-cinematic-mobile{display:none}
.cs-mob-slide{position:relative;min-height:100vh}
.cs-mob-media{position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden}
.cs-mob-media img,.cs-mob-media video{width:100%;height:100%;object-fit:cover;display:block}
.cs-mob-text{position:relative;z-index:10;min-height:100vh;display:flex;flex-direction:column;justify-content:flex-end;padding:2rem 1.5rem 3rem;background:linear-gradient(to top,rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.3) 50%,transparent 100%)}
.cs-mob-text h2{margin:0 0 1rem 0}
.cs-mob-text div{margin:0}

/* ========================================
   PAIR FADE EFFECT
   ======================================== */
.sb-fadepair{position:relative;height:var(--fadeH,200vh)}
.sb-fade-prev{position:relative;height:100vh}
.sb-fade-next{position:sticky;top:0;height:100vh;opacity:var(--fadeOpacity,0);transition:opacity 0.1s linear;will-change:opacity}
.sb-fade-prev>*{min-height:100vh}.sb-fade-next>*{min-height:100vh}

[data-fade-scroll="true"]{
  transition:opacity .6s ease-out;
}


/* ========================================
   MOBILE STYLES (max-width: 1024px)
   ======================================== */

@media (max-width: 1024px), (max-aspect-ratio: 3/4) {

  .desktop-mute-btn { display: none !important; }
  .mobile-mute-btn { display: flex !important; }
  
  .sb-hero .mobile-mute-btn {
    bottom: 160px !important;
    left: 1.5rem !important;
  }
  
  .pls-mobile-image .mobile-mute-btn,
  .split-mobile-panel-image .mobile-mute-btn {
    bottom: 20px !important;
    left: 20px !important;
  }
  
  .gallery-mute-btn {
    display: flex !important;
    bottom: 20px !important;
    left: 20px !important;
  }
  
  .gallery-media-cell {
    position: relative !important;
  }

  /* Cinematic Scroll - keep desktop version on all screens */
  .sb-cinematic-mobile { display: none !important; }
  .cs-text-slide { padding: 0 1rem; }
  .cs-text-inner { padding: 1.5rem; }

  .cs-mob-media .mobile-mute-btn {
    bottom: 20px !important;
    left: 20px !important;
  }

  .split-desktop-only { display: none !important; }
  .split-mobile-only { display: block !important; }
  
  .sb-hero.has-mobile-media .desktop-media{display:none}
  .sb-hero.has-mobile-media .mobile-media{display:block}

  .sb-hero {
    height: 200vh !important;
    min-height: 200vh !important;
    max-height: none !important;
    display: block !important;
    position: relative !important;
    clip: rect(0, auto, auto, 0) !important;
    clip-path: inset(0) !important;
  }
  
  .sb-hero .hero-image-section {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    height: 100vh !important;
    overflow: hidden !important;
    z-index: 1 !important;
  }
  
  .sb-hero .hero-image-section .media,
  .sb-hero .hero-image-section .media-picture,
  .sb-hero .hero-image-section video.media,
  .sb-hero .hero-image-section img.media {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    display: block !important;
  }
  
  .sb-hero .hero-image-section .media-picture img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
  }
  
  .sb-hero .hero-gradient {
    display: block !important;
    position: absolute !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    height: 60% !important;
    background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, transparent 100%) !important;
    z-index: 5 !important;
    pointer-events: none !important;
  }
  
  .sb-hero .desktop-overlay {
    display: none !important;
  }
  
  .sb-hero .mobile-overlay {
    display: flex !important;
    position: absolute !important;
    inset: 0 !important;
    z-index: 10 !important;
    padding: 0 !important;
    padding-bottom: 100px !important;
    flex-direction: column !important;
    justify-content: flex-end !important;
    align-items: flex-start !important;
  }
  
  .hero-mobile-headline-container {
    padding: 1.5rem !important;
    max-width: 90% !important;
  }
  
  .hero-mobile-headline {
    font-size: clamp(2.5rem, 10vw, 3.5rem) !important;
    line-height: 1.05 !important;
    margin: 0 !important;
    text-shadow: 0 2px 12px rgba(0,0,0,0.8) !important;
    text-align: left !important;
  }
  
  .sb-hero .sb-hero-desktop-deck {
    display: none !important;
  }
  
  .hero-mobile-deck-section {
    display: block !important;
    position: absolute !important;
    top: 100vh !important;
    left: 0 !important;
    right: 0 !important;
    z-index: 20 !important;
    height: 100vh !important;
    background: #000 !important;
    box-sizing: border-box !important;
  }
  
  .hero-mobile-deck-text {
    position: relative !important;
    top: 50vh !important;
    transform: translateY(-50%) !important;
    padding: 0 3rem !important;
    font-size: 1.375rem !important;
    line-height: 1.6 !important;
    text-align: center !important;
    text-shadow: none !important;
  }

  .split-mobile-text-inner.max-w-md { max-width: 100%; }
  .split-mobile-text-inner.max-w-lg { max-width: 100%; }
  .split-mobile-text-inner.max-w-4xl { max-width: 100%; }
  .split-mobile-text-inner.max-w-6xl { max-width: 100%; }
  
  .split-mobile-text-section h2 {
    font-size: clamp(1.5rem, 6vw, 2rem) !important;
    margin-bottom: 0.75rem !important;
  }
  
  .split-mobile-text-section h3 {
    font-size: clamp(1.25rem, 4vw, 1.5rem) !important;
  }
  
  .split-mobile-text-section p {
    font-size: 1.0625rem !important;
    line-height: 1.65 !important;
  }
  
  [class*="split-panel-drop-cap"]::first-letter {
    font-size: 3rem !important;
    line-height: 2.5rem !important;
    padding-right: 8px !important;
  }
  
  [class*="split-panel-drop-cap"]::first-line {
    font-size: 1.25rem !important;
  }
  
  .split-mobile-panel-image {
    position: relative !important;
  }
  
  .split-mobile-subhead-overlay {
    position: absolute !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%) !important;
    padding: 3rem 1.5rem 0.75rem 1.5rem !important;
    pointer-events: none !important;
  }
  
  .split-mobile-subhead-text {
    font-size: 1.125rem !important;
    text-shadow: 0 1px 4px rgba(0,0,0,0.8) !important;
    text-align: left !important;
  }
  
  .split-mobile-byline-overlay {
    position: absolute !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%) !important;
    padding: 3rem 1.5rem 0.75rem 1.5rem !important;
    pointer-events: none !important;
  }
  
  .split-mobile-byline-text {
    font-size: 0.875rem !important;
    text-shadow: 0 1px 4px rgba(0,0,0,0.8) !important;
    text-align: left !important;
  }

  .pls-desktop {
    display: none !important;
  }
  
  .pls-mobile {
    display: block !important;
  }
  
  .pls-mobile-image {
    position: relative !important;
    width: 100% !important;
    height: 75vh !important;
    min-height: 350px !important;
    max-height: 550px !important;
    overflow: hidden !important;
  }
  
  .pls-mobile-image .pls-media,
  .pls-mobile-image img,
  .pls-mobile-image video {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
  }
  
  .pls-mobile-subhead-overlay {
    position: absolute !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%) !important;
    padding: 3rem 1.5rem 0.75rem 1.5rem !important;
    pointer-events: none !important;
  }
  
  .pls-mobile-subhead-text {
    font-size: 1.125rem !important;
    text-shadow: 0 1px 4px rgba(0,0,0,0.8) !important;
    text-align: left !important;
  }
  
  .pls-mobile-byline-overlay {
    position: absolute !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%) !important;
    padding: 3rem 1.5rem 0.75rem 1.5rem !important;
    pointer-events: none !important;
  }
  
  .pls-mobile-byline-text {
    font-size: 1rem !important;
    text-shadow: 0 1px 4px rgba(0,0,0,0.8) !important;
    text-align: left !important;
  }
  
  .pls-mobile-text {
    padding: 1.5rem !important;
  }
  
  .pls-mobile-text .max-w-md,
  .pls-mobile-text .max-w-lg,
  .pls-mobile-text .max-w-4xl,
  .pls-mobile-text .max-w-6xl {
    max-width: 100% !important;
  }
  
  .photo-lede-side-drop-cap::first-letter {
    font-size: 3rem !important;
    line-height: 2.5rem !important;
    padding-right: 8px !important;
  }
  
  .photo-lede-side-drop-cap::first-line {
    font-size: 1.25rem !important;
  }

  .photo-lede-section {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
  
  .photo-lede-section.px-6 {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
  
  .photo-lede-photo {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    border-radius: 0 !important;
  }
  
  .photo-lede-photo img,
  .photo-lede-photo video {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    border-radius: 0 !important;
    display: block !important;
  }
  
  .photo-lede-caption {
    padding: 0.5rem 1.5rem !important;
    text-align: left !important;
  }
  
  .photo-lede-text {
    padding: 0 1.5rem !important;
  }
  
  .photo-lede-drop-cap::first-letter {
    font-size: 3rem !important;
    line-height: 2.5rem !important;
    padding-right: 8px !important;
  }
  
  .photo-lede-drop-cap::first-line {
    font-size: 1.25rem !important;
  }

  .fullbleed {
    margin-left: 0 !important;
    margin-right: 0 !important;
    width: 100% !important;
  }
  
  .fullbleed img,
  .fullbleed video {
    width: 100% !important;
    height: auto !important;
    border-radius: 0 !important;
  }
  
  .fullbleed .rounded {
    border-radius: 0 !important;
  }

  .sb-zoomsec {
    height: auto !important;
    min-height: auto !important;
  }
  
  .sb-zoom-spacer {
    height: 2rem !important;
  }
  
  .sb-zoom-pin {
    position: relative !important;
    height: auto !important;
  }
  
  .sb-zoom-photo {
    position: relative !important;
    top: auto !important;
    left: auto !important;
    transform: none !important;
    width: 100% !important;
    height: auto !important;
    min-width: auto !important;
    min-height: auto !important;
  }
  
  .sb-zoom-vignette {
    display: none !important;
  }
  
  .sb-zoom-panel {
    position: relative !important;
    bottom: auto !important;
    left: auto !important;
    transform: none !important;
    opacity: 1 !important;
    margin: 1rem;
    max-width: 100% !important;
    text-align: left !important;
  }

  [style*="display:grid"][style*="grid-template-columns"] {
    display: flex !important;
    flex-direction: column !important;
    gap: 0.5rem !important;
  }
  
  [style*="display:grid"] > div {
    width: 100% !important;
    height: auto !important;
    min-height: 250px !important;
    max-height: 70vh !important;
    grid-column: auto !important;
    grid-row: auto !important;
  }
  
  [style*="display:grid"] > div img,
  [style*="display:grid"] > div video {
    width: 100% !important;
    height: 100% !important;
    min-height: 250px !important;
    object-fit: cover !important;
  }

  h1 {
    font-size: clamp(1.75rem, 6vw, 2.5rem) !important;
    line-height: 1.15 !important;
  }
  
  h2 {
    font-size: clamp(1.5rem, 5vw, 2rem) !important;
    line-height: 1.2 !important;
  }
  
  h3 {
    font-size: clamp(1.25rem, 4vw, 1.5rem) !important;
    line-height: 1.25 !important;
  }
  
  p, .leading-relaxed {
    font-size: 1.0625rem !important;
    line-height: 1.65 !important;
  }

  .px-6 {
    padding-left: 1.5rem !important;
    padding-right: 1.5rem !important;
  }
  
  .p-12 {
    padding: 1.5rem !important;
  }
  
  .pt-16, .pt-24 {
    padding-top: 1.5rem !important;
  }
  
  .pb-16, .pb-24 {
    padding-bottom: 1.5rem !important;
  }
  
  .pt-4 { padding-top: 1rem !important; }
  .pb-4 { padding-bottom: 1rem !important; }
  .pt-8 { padding-top: 1.25rem !important; }
  .pb-8 { padding-bottom: 1.25rem !important; }

  .max-w-md, .max-w-lg, .max-w-4xl, .max-w-6xl {
    max-width: 100% !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  [style*="border-left:4px"] {
    padding: 1.25rem 1.5rem !important;
    margin: 1.5rem 0 !important;
  }
  
  [style*="border-left:4px"] p {
    font-size: 1.125rem !important;
    line-height: 1.6 !important;
  }

  button, a[role="button"] {
    min-width: 44px !important;
    min-height: 44px !important;
  }

  body, html {
    overflow-x: hidden !important;
  }
  
  img, video {
    max-width: 100% !important;
  }
  
  .breakout-large {
    width: 100% !important;
    max-width: 100% !important;
    left: auto !important;
    transform: none !important;
  }
}

/* ========================================
   TABLET OVERRIDES (769px - 1024px)
   Larger text, margins, and image heights for tablets
   ======================================== */
@media (min-width: 769px) and (max-width: 1024px) {
  
  /* Hero headline larger for tablets */
  .hero-mobile-headline {
    font-size: clamp(3.5rem, 9vw, 5rem) !important;
  }
  
  /* Hero deck text larger */
  .hero-mobile-deck-text {
    font-size: 1.625rem !important;
    line-height: 1.7 !important;
    padding: 0 6rem !important;
  }
  
  /* PhotoLedeSide mobile text container - flex center */
  .pls-mobile-text {
    display: flex !important;
    justify-content: center !important;
    padding: 2rem 1.5rem !important;
  }
  
  /* PhotoLedeSide inner div - constrain width */
  .pls-mobile-text > .max-w-md,
  .pls-mobile-text > .max-w-lg,
  .pls-mobile-text > .max-w-4xl,
  .pls-mobile-text > .max-w-6xl {
    max-width: 720px !important;
    width: 100% !important;
  }
  
  /* PhotoLedeSide byline overlay - match text width */
  .pls-mobile-byline-overlay {
    display: flex !important;
    justify-content: center !important;
    padding-left: 1.5rem !important;
    padding-right: 1.5rem !important;
  }
  
  .pls-mobile-byline-overlay .pls-mobile-byline-text {
    max-width: 720px !important;
    width: 100% !important;
  }
  
  /* Split panel mobile text container - the actual class used */
  .split-mobile-panel-text {
    display: flex !important;
    justify-content: center !important;
    padding-left: 1.5rem !important;
    padding-right: 1.5rem !important;
  }
  
  /* Split panel inner content */
  .split-mobile-panel-text > .split-mobile-text-inner {
    max-width: 720px !important;
    width: 100% !important;
  }
  
  .split-mobile-text-inner.max-w-md,
  .split-mobile-text-inner.max-w-lg,
  .split-mobile-text-inner.max-w-4xl,
  .split-mobile-text-inner.max-w-6xl {
    max-width: 720px !important;
  }
  
  /* PhotoLede text - add top padding for spacing from image */
  .photo-lede-text {
    padding: 1.5rem !important;
    max-width: 720px !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
  
  .photo-lede-caption {
    padding: 0.75rem 1.5rem !important;
    max-width: 720px !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
  
  /* Body text larger */
  p, .leading-relaxed {
    font-size: 1.25rem !important;
    line-height: 1.75 !important;
  }
  
  /* Subhead/headline text larger */
  h2 {
    font-size: clamp(1.875rem, 5vw, 2.5rem) !important;
  }
  
  h3 {
    font-size: clamp(1.5rem, 4vw, 2rem) !important;
    margin-top: 1.5rem !important;
  }
  
  /* Byline text */
  .pls-mobile-byline-text,
  .split-mobile-byline-text {
    font-size: 1.125rem !important;
  }
  
  /* Image/video heights for tablets - allow portrait content to be tall */
  .pls-mobile-image {
    height: 85vh !important;
    min-height: 600px !important;
    max-height: none !important;
  }
  
  .split-mobile-panel-image {
    height: 85vh !important;
    min-height: 600px !important;
    max-height: none !important;
  }
  
  /* Subhead overlay text */
  .pls-mobile-subhead-text,
  .split-mobile-subhead-text {
    font-size: 1.375rem !important;
  }
  
  /* Split panel text content */
  .split-mobile-panel-text p,
  .split-mobile-text-inner p {
    font-size: 1.25rem !important;
    line-height: 1.75 !important;
  }
  
  .split-mobile-panel-text h2,
  .split-mobile-text-inner h2 {
    font-size: clamp(1.875rem, 5vw, 2.5rem) !important;
  }
  
  .split-mobile-panel-text h3,
  .split-mobile-text-inner h3 {
    font-size: clamp(1.5rem, 4vw, 2rem) !important;
  }
  
  /* Gallery items taller */
  [style*="display:grid"] > div {
    min-height: 450px !important;
    max-height: none !important;
  }
  
  [style*="display:grid"] > div img,
  [style*="display:grid"] > div video {
    min-height: 450px !important;
  }
  
  /* Photo lede - full width image, constrained text */
  .photo-lede-section {
    padding: 0 !important;
  }
  
  /* Drop cap slightly larger */
  .photo-lede-drop-cap::first-letter,
  .photo-lede-side-drop-cap::first-letter,
  [class*="split-panel-drop-cap"]::first-letter {
    font-size: 4rem !important;
    line-height: 3rem !important;
  }

  /* Cinematic scroll mobile - larger media on tablets */
  .cs-mob-media {
    height: 85vh !important;
    min-height: 600px !important;
    max-height: none !important;
  }

  .cs-mob-text {
    padding: 2.5rem !important;
  }
}

@supports (-webkit-touch-callout: none) {
  @media (max-width: 1024px) {
    .sb-hero .hero-image-section {
      height: 100vh !important;
      height: -webkit-fill-available !important;
    }
    
    .hero-mobile-deck-section {
      height: 100vh !important;
      height: -webkit-fill-available !important;
      min-height: 100vh !important;
      min-height: -webkit-fill-available !important;
      max-height: 100vh !important;
      max-height: -webkit-fill-available !important;
    }
    
    .split-mobile-images {
      height: 80vh !important;
      height: -webkit-fill-available !important;
      max-height: 800px !important;
    }
  }
}

/* ========================================
   ORIENTATION LOCK FOR PHONES
   Lock to portrait on small screens (phones)
   ======================================== */
@media screen and (max-width: 600px) and (orientation: landscape) {
  html {
    transform: rotate(-90deg);
    transform-origin: left top;
    width: 100vh;
    height: 100vw;
    overflow-x: hidden;
    position: absolute;
    top: 100%;
    left: 0;
  }
}
`;

/* ---------- RUNTIME SCRIPTS ---------- */
const STICKY_RUNTIME = `
(function(){
  function initStickyReveal(root){
    var containers = (root||document).querySelectorAll('.sb-sticky-reveal');
    containers.forEach(function(c){
      var lines = Array.from(c.querySelectorAll('.reveal-line'));
      lines.forEach(function(el,i){ setTimeout(function(){ el.classList.add('visible'); }, 250 + i*350); });
    });
  }
  document.addEventListener('DOMContentLoaded', function(){ initStickyReveal(document); });
})();`;

const ZOOM_RUNTIME = `
(function(){
  function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
  function lerp(a,b,t){return a+(b-a)*t}
  function easeOut(t){return 1-Math.pow(1-t,2)}
  function easeInOut(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
  function wire(sec){
    var pin=sec.querySelector('.sb-zoom-pin');
    var img=sec.querySelector('.sb-zoom-photo');
    var panel=sec.querySelector('.sb-zoom-panel');
    var maxScale=parseFloat(sec.dataset.scaleEnd||'2.6');
    var fadeInCut=parseFloat(sec.dataset.fadeIn||'0.18');
    var fadeOutCut=parseFloat(sec.dataset.fadeOut||'0.18');
    var panelStart=parseFloat(sec.dataset.panelStart||'0.3');
    var panelEnd=parseFloat(sec.dataset.panelEnd||'0.72');
    var fx=parseFloat(sec.dataset.focusX||'0.5');
    var fy=parseFloat(sec.dataset.focusY||'0.5');
    var ticking=false;
    function onScroll(){if(!ticking){requestAnimationFrame(update);ticking=true;}}
    function update(){
      ticking=false;
      var r=sec.getBoundingClientRect();
      var vh=window.innerHeight;
      if(r.bottom<=-vh||r.top>=vh*1.5){pin.style.display='none';return;}
      var p=clamp((vh-r.top)/(r.height+vh),0,1);
      pin.style.display='block';
      var opacity=1;
      if(p<fadeInCut){opacity=easeOut(p/Math.max(fadeInCut,0.0001));}
      else if(p>1-fadeOutCut){var t=(1-p)/Math.max(fadeOutCut,0.0001);opacity=easeOut(t);}
      var midStart=fadeInCut;
      var midEnd=1-fadeOutCut;
      var scaleProgress=clamp((p-midStart)/Math.max(midEnd-midStart,0.0001),0,1);
      var easedProgress=easeInOut(scaleProgress);
      var s=lerp(1,maxScale,easedProgress);
      img.style.transformOrigin=(fx*100)+'% '+(fy*100)+'%';
      img.style.opacity=opacity.toFixed(4);
      img.style.transform='translate(-50%,-50%) scale('+s.toFixed(4)+')';
      if(panel){
        var showPanel=p>=panelStart&&p<=panelEnd;
        if(showPanel){
          var local=(p-panelStart)/Math.max(panelEnd-panelStart,0.0001);
          var inT=local<0.5?local/0.5:1;
          var outT=local>0.7?(local-0.7)/0.3:0;
          var alpha=clamp(easeOut(inT)*(1-outT),0,1);
          panel.style.opacity=alpha.toFixed(4);
          var y=lerp(12,0,easeInOut(local));
          panel.style.transform='translateX(-50%) translateY('+y+'px)';
        }else{panel.style.opacity='0';}
      }
    }
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',onScroll);
    window.addEventListener('load',update);
    update();
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){document.querySelectorAll('.sb-zoomsec').forEach(wire);});}
  else{document.querySelectorAll('.sb-zoomsec').forEach(wire);}
})();`;

const CINEMATIC_SCROLL_RUNTIME = `
(function(){
  function wire(section){
    if(section.__cinematicBound)return;
    section.__cinematicBound=true;

    var mediaWrap=section.querySelector('.cs-media-wrap');
    var mediaSlides=section.querySelectorAll('.cs-media-slide');
    var textSlides=section.querySelectorAll('.cs-text-slide');

    if(!mediaWrap||!mediaSlides.length)return;

    var slideCount=parseInt(section.dataset.slideCount||'1');
    var currentSlide=0;
    var ticking=false;

    function onScroll(){if(!ticking){requestAnimationFrame(update);ticking=true;}}

    function update(){
      ticking=false;
      var vh=window.innerHeight;
      var rect=section.getBoundingClientRect();

      // Control media position: absolute(top) -> fixed -> absolute(bottom)
      if(rect.top>0){
        mediaWrap.classList.remove('is-fixed','is-bottom');
      }else if(rect.bottom>vh){
        mediaWrap.classList.add('is-fixed');
        mediaWrap.classList.remove('is-bottom');
      }else{
        mediaWrap.classList.remove('is-fixed');
        mediaWrap.classList.add('is-bottom');
      }

      // Multi-slide crossfades
      if(slideCount>1){
        var bestSlide=0;
        var bestScore=-1;

        for(var i=0;i<textSlides.length;i++){
          var textInner=textSlides[i].querySelector('.cs-text-inner');
          if(!textInner)continue;

          var r=textInner.getBoundingClientRect();
          var top=Math.max(0,r.top);
          var bottom=Math.min(vh,r.bottom);
          var visibleHeight=Math.max(0,bottom-top);
          var visibility=visibleHeight/r.height;

          var centerY=(r.top+r.bottom)/2;
          var positionScore=1-Math.abs(centerY-vh*0.6)/vh;
          var score=visibility*0.7+positionScore*0.3;

          if(score>bestScore&&visibility>0.1){
            bestScore=score;
            bestSlide=i;
          }

          if(r.bottom<vh*0.3&&i<slideCount-1){
            var nextInner=textSlides[i+1]?textSlides[i+1].querySelector('.cs-text-inner'):null;
            if(nextInner&&nextInner.getBoundingClientRect().top<vh){
              bestSlide=Math.max(bestSlide,i+1);
            }
          }
        }

        if(bestSlide!==currentSlide){
          currentSlide=bestSlide;
          for(var j=0;j<mediaSlides.length;j++){
            if(j===currentSlide){mediaSlides[j].classList.add('active');}
            else{mediaSlides[j].classList.remove('active');}
          }
        }
      }
    }

    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',onScroll);
    mediaSlides[0].classList.add('active');
    onScroll();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){
      document.querySelectorAll('.sb-cinematic-scroll').forEach(wire);
    });
  }else{
    document.querySelectorAll('.sb-cinematic-scroll').forEach(wire);
  }
})();`;

const SPLIT_PANEL_RUNTIME = `
function toggleMute(videoId, button) {
  var video = document.getElementById(videoId);
  if (!video) return;
  video.muted = !video.muted;
  var mutedLine = button.querySelector('.muted-line');
  var unmutedPath = button.querySelector('.unmuted-path');
  if (video.muted) {
    if (mutedLine) mutedLine.style.display = 'block';
    if (unmutedPath) unmutedPath.style.opacity = '0.3';
  } else {
    if (mutedLine) mutedLine.style.display = 'none';
    if (unmutedPath) unmutedPath.style.opacity = '1';
  }
}
(function(){
  var wrappers=document.querySelectorAll('.split-panel-wrapper');
  if(!wrappers.length)return;
  
  wrappers.forEach(function(wrapper){
    var container=wrapper.querySelector('.split-panel-container');
    if(!container)return;
    
    var rows=container.querySelectorAll('.split-panel-row');
    if(rows.length<2)return;
    
    var firstRow=rows[0];
    var secondRow=rows[1];
    
    var firstImage=firstRow.querySelector('.split-image-sticky');
    var secondImage=secondRow.querySelector('.split-image-sticky');
    if(!firstImage||!secondImage)return;
    
    function applyMobileStyles(){
      firstImage.style.display='block';
      firstImage.style.clipPath='none';
      firstImage.style.opacity='1';
      firstImage.style.position='relative';
      firstImage.style.transform='none';
      
      secondImage.style.display='block';
      secondImage.style.clipPath='none';
      secondImage.style.opacity='1';
      secondImage.style.position='relative';
      secondImage.style.transform='none';
      
      firstRow.style.opacity='1';
      firstRow.style.visibility='visible';
      secondRow.style.opacity='1';
      secondRow.style.visibility='visible';
    }
    
    function checkAndApply(){
      var isMobile = window.innerWidth <= 1024;

      if(isMobile){
        applyMobileStyles();
        return;
      }

      var windowHeight=window.innerHeight;
      var firstRowRect=firstRow.getBoundingClientRect();
      var secondRowRect=secondRow.getBoundingClientRect();

      // If split panel is below viewport, hide both images
      if(firstRowRect.top>=windowHeight){
        firstImage.style.display='none';
        secondImage.style.display='none';
        return;
      }
      
      if(firstRowRect.top<windowHeight&&firstRowRect.bottom>windowHeight*0.01){
        firstImage.style.display='block';
        var revealAmount=Math.max(0,Math.min(windowHeight,windowHeight-firstRowRect.top));
        var clipPercent=(revealAmount/windowHeight)*100;
        firstImage.style.clipPath='inset('+(100-clipPercent)+'% 0 0 0)';
        firstImage.style.opacity='1';
      } else {
        firstImage.style.display='none';
      }
      
      if(secondRowRect.top<windowHeight&&secondRowRect.bottom>windowHeight*0.01){
        secondImage.style.display='block';
        var revealAmount2=Math.max(0,Math.min(windowHeight,windowHeight-secondRowRect.top));
        var clipPercent2=(revealAmount2/windowHeight)*100;
        secondImage.style.clipPath='inset('+(100-clipPercent2)+'% 0 0 0)';
        secondImage.style.opacity='1';
      } else {
        secondImage.style.display='none';
      }
    }
    
    firstImage.style.transition='opacity 0.4s ease';
    secondImage.style.transition='opacity 0.4s ease';
    
    window.addEventListener('scroll',checkAndApply,{passive:true});
    window.addEventListener('resize',checkAndApply);
    window.addEventListener('load',checkAndApply);
    checkAndApply();
  });
})();`;

const SPLIT_MOBILE_RUNTIME = `
(function(){
  function isMobile() {
    return window.innerWidth <= 1024;
  }
  
  function initMobileSplitPanels() {
    if (!isMobile()) return;
    
    var wrappers = document.querySelectorAll('.split-mobile-wrapper');
    if (!wrappers.length) return;
    
    wrappers.forEach(function(wrapper) {
      var imagesContainer = wrapper.querySelector('.split-mobile-images');
      var images = wrapper.querySelectorAll('.split-mobile-image');
      var textSections = wrapper.querySelectorAll('.split-mobile-text-section');
      
      if (!imagesContainer || !images.length || !textSections.length) return;
      
      var currentPanel = 0;
      var ticking = false;
      
      function updateActiveImage() {
        if (!isMobile()) return;
        
        var imagesRect = imagesContainer.getBoundingClientRect();
        var triggerPoint = imagesRect.bottom;
        
        var activePanel = 0;
        
        for (var i = 0; i < textSections.length; i++) {
          var section = textSections[i];
          var rect = section.getBoundingClientRect();
          
          if (rect.top <= triggerPoint) {
            activePanel = i;
          }
        }
        
        if (activePanel !== currentPanel) {
          currentPanel = activePanel;
          
          for (var j = 0; j < images.length; j++) {
            images[j].style.opacity = (j === activePanel) ? '1' : '0';
          }
        }
      }
      
      function onScroll() {
        if (!ticking) {
          requestAnimationFrame(function() {
            updateActiveImage();
            ticking = false;
          });
          ticking = true;
        }
      }
      
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', updateActiveImage);
      
      setTimeout(updateActiveImage, 100);
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileSplitPanels);
  } else {
    initMobileSplitPanels();
  }
})();`;

const BOOT_FADE = `
(function(){
  var els = document.querySelectorAll('[data-fade-scroll="true"]');
  if(!els.length) return;
  
  var ticking = false;
  var scrollCount = 0;
  
  function checkVisibility(){
    if(ticking) return;
    ticking = true;
    
    requestAnimationFrame(function(){
      var vh = window.innerHeight;
      
      for(var i = 0; i < els.length; i++){
        var el = els[i];
        if(el.style.opacity === '1') continue;
        
        var rect = el.getBoundingClientRect();
        if(rect.top < vh * 0.85){
          el.style.opacity = '1';
        }
      }
      
      ticking = false;
    });
  }
  
  function onScroll(){
    if(scrollCount === 1){
      setTimeout(checkVisibility, 50);
    } else {
      checkVisibility();
    }
    scrollCount++;
  }
  
  setTimeout(function(){
    var vh = window.innerHeight;
    for(var i = 0; i < els.length; i++){
      var el = els[i];
      var rect = el.getBoundingClientRect();
      if(rect.top > vh * 0.5){
        el.style.opacity = '0';
      }
    }
  }, 100);
  
  window.addEventListener('scroll', onScroll, {passive: true});
})();`;

const AUTO_MUTE_RUNTIME = `
(function(){
  var videos = document.querySelectorAll('video');
  if (!videos.length) return;
  
  // Firefox autoplay fix - force play on muted autoplay videos
  videos.forEach(function(v) {
    if (v.hasAttribute('autoplay') && v.muted) {
      v.play().catch(function(e) {
        // Autoplay was prevented, try again on user interaction
        document.addEventListener('click', function playOnce() {
          v.play();
          document.removeEventListener('click', playOnce);
        }, { once: true });
      });
    }
  });
  
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) {
        var video = entry.target;
        video.muted = true;
        // Update any associated mute button
        var container = video.closest('.hero-image-section, .pls-mobile-image, .pls-image, .split-mobile-panel-image, .split-image-content, .gallery-media-cell');
        if (container) {
          var btn = container.querySelector('.mute-btn');
          if (btn) {
            var mutedLine = btn.querySelector('.muted-line');
            var unmutedPath = btn.querySelector('.unmuted-path');
            if (mutedLine) mutedLine.style.display = 'block';
            if (unmutedPath) unmutedPath.style.opacity = '0.3';
          }
        }
      }
    });
  }, { threshold: 0.1 });
  
  videos.forEach(function(v) { observer.observe(v); });
})();`;

/* ---------- FULL HTML for PREVIEW IFRAME ---------- */
function buildFullHtmlPage(bodyContent) {
  // Use origin as base URL so relative paths resolve correctly in iframe
  const baseUrl = typeof window !== 'undefined' ? window.location.origin + '/' : '/';
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <base href="${baseUrl}">
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Preview</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <style>${BASE_CSS}</style>
  </head>
  <body>
    ${bodyContent}
    <script>${STICKY_RUNTIME}<\/script>
    <script>${ZOOM_RUNTIME}<\/script>
    <script>${CINEMATIC_SCROLL_RUNTIME}<\/script>
    <script>${SPLIT_PANEL_RUNTIME}<\/script>
    <script>${SPLIT_MOBILE_RUNTIME}<\/script>
    <script>${AUTO_MUTE_RUNTIME}<\/script>
  </body>
</html>`;
}

/* ---------- Public API ---------- */
export async function renderPreview({ state, mount, mode = 'iframe', selectedBlockIndex = null }) {
  // Pre-resolve all media paths to blob URLs if File System API is connected
  await resolveAllMediaPaths(state.blocks, state.project);

  if (mode === 'iframe') {
    const parts = buildBlocksWithFadePairs({ state, isPreview: true });
    const previewHtml = buildFullHtmlPage(parts.join('\n'));

    mount.style.transform = 'none';
    mount.style.width = '100%';
    mount.style.height = '100%';

    mount.innerHTML = '<iframe style="width:100%;height:100%;border:none;"></iframe>';
    const iframe = mount.querySelector('iframe');
    iframe.contentDocument.open();
    iframe.contentDocument.write(previewHtml);
    iframe.contentDocument.close();

    iframe.addEventListener('load', () => {
      setTimeout(() => {
        initFadeRuntime(iframe.contentDocument);
        // Scroll to and highlight selected block
        if (selectedBlockIndex !== null) {
          scrollToBlock(iframe.contentDocument, selectedBlockIndex);
        }
      }, 150);
    });
  } else {
    const parts = buildBlocksWithFadePairs({ state, isPreview: true });
    mount.innerHTML = parts.join('\n');

    initZoomRuntime(mount);
    initCinematicScrollRuntime(mount);
    initFadeRuntime(mount);
    hydrateInlineScripts(mount);
    initStickyReveal(mount);

    // Scroll to and highlight selected block
    if (selectedBlockIndex !== null) {
      setTimeout(() => scrollToBlock(mount, selectedBlockIndex), 100);
    }
  }
}

function scrollToBlock(container, index) {
  const block = container.querySelector(`[data-block-index="${index}"]`);
  if (!block) return;

  // Scroll to block
  block.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Add highlight effect
  block.style.outline = '3px solid #3b82f6';
  block.style.outlineOffset = '2px';
  block.style.transition = 'outline-color 0.3s ease';

  // Fade out highlight after 1.5 seconds
  setTimeout(() => {
    block.style.outlineColor = 'transparent';
    // Clean up styles after transition
    setTimeout(() => {
      block.style.outline = '';
      block.style.outlineOffset = '';
      block.style.transition = '';
    }, 300);
  }, 1500);
}

export function buildExportHtml({ state }) {
  function calculateReadTime(state) {
    let totalText = '';
    (state.blocks || []).forEach(b => {
      if (b.bodyText) totalText += b.bodyText;
      if (b.text) totalText += b.text;
      if (b.headline) totalText += b.headline;
      if (b.subhead) totalText += b.subhead;
      if (b.panels) {
        b.panels.forEach(p => {
          if (p.text) totalText += p.text;
          if (p.headline) totalText += p.headline;
        });
      }
    });
    const wordCount = totalText.split(/\s+/).filter(w => w.length > 0).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }
  
  const readTime = calculateReadTime(state);
  
  (state.blocks || []).forEach(b => {
    if (b.showByline) {
      b.readTime = readTime;
    }
  });
  
  const parts = [];
  const blocks = state.blocks || [];
  blocks.forEach((b, index) => {
    const mod = BLOCKS[b.type];
    if (!mod?.exportHTML) return;
    // Wrap block with tracking attributes including expected time
    const blockHtml = mod.exportHTML({ block: b, blocks });
    const expectedTime = getEffectiveExpectedTime(b);
    const standardizedTime = calculateExpectedTime(b);
    parts.push(`<div data-sb-block="${index}" data-sb-type="${b.type}" data-sb-expected="${expectedTime}" data-sb-expected-std="${standardizedTime}">${blockHtml}</div>`);
  });
  const body = parts.join('\n');

  // Generate analytics runtime if configured
  let analyticsScript = '';
  if (state.analyticsConfig?.supabaseUrl && state.analyticsConfig?.storyId) {
    analyticsScript = `
<script>
(function() {
  const SUPABASE_URL = '${state.analyticsConfig.supabaseUrl}';
  const SUPABASE_ANON_KEY = '${state.analyticsConfig.supabaseAnonKey}';
  const STORY_ID = '${state.analyticsConfig.storyId}';
  const SESSION_ID = 'ses_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  const blockTimes = new Map();
  let maxScrollDepth = 0;

  async function sendEvent(eventType, data = {}) {
    try {
      await fetch(SUPABASE_URL + '/rest/v1/analytics_events', {
        method: 'POST',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          story_id: STORY_ID,
          session_id: SESSION_ID,
          event_type: eventType,
          block_index: data.blockIndex ?? null,
          block_type: data.blockType ?? null,
          event_data: data.eventData ?? {},
          user_agent: navigator.userAgent,
          viewport_width: window.innerWidth,
          viewport_height: window.innerHeight,
          referrer: document.referrer || null
        })
      });
    } catch (e) { console.warn('[Analytics]', e); }
  }

  sendEvent('page_view');

  const blocks = document.querySelectorAll('[data-sb-block]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const block = entry.target;
      const index = parseInt(block.dataset.sbBlock);
      const type = block.dataset.sbType || 'unknown';
      if (!blockTimes.has(index)) {
        blockTimes.set(index, { startTime: null, totalTime: 0, visible: false, tracked: false });
      }
      const state = blockTimes.get(index);
      if (entry.isIntersecting) {
        state.visible = true;
        state.startTime = Date.now();
        if (!state.tracked) {
          state.tracked = true;
          sendEvent('block_view', { blockIndex: index, blockType: type });
        }
      } else {
        if (state.visible && state.startTime) {
          state.totalTime += Date.now() - state.startTime;
        }
        state.visible = false;
        state.startTime = null;
      }
    });
  }, { threshold: 0.5 });
  blocks.forEach(block => observer.observe(block));

  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollPct = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
      if (scrollPct > maxScrollDepth) maxScrollDepth = scrollPct;
    }, 100);
  }, { passive: true });

  function sendEngagement() {
    blockTimes.forEach((st, index) => {
      if (st.visible && st.startTime) st.totalTime += Date.now() - st.startTime;
    });
    const blockElements = document.querySelectorAll('[data-sb-block]');
    blockTimes.forEach((st, index) => {
      if (st.totalTime > 1000) {
        const block = blockElements[index];
        const expectedTime = parseInt(block?.dataset.sbExpected) || 0;
        const expectedTimeStd = parseInt(block?.dataset.sbExpectedStd) || 0;
        const engagementPct = expectedTime > 0 ? Math.round((st.totalTime / 1000 / expectedTime) * 100) : 0;
        const engagementPctStd = expectedTimeStd > 0 ? Math.round((st.totalTime / 1000 / expectedTimeStd) * 100) : 0;
        fetch(SUPABASE_URL + '/rest/v1/analytics_events', {
          method: 'POST', keepalive: true, credentials: 'omit',
          headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY, 'Prefer': 'return=minimal' },
          body: JSON.stringify({
            story_id: STORY_ID, session_id: SESSION_ID, event_type: 'block_engage',
            block_index: index, block_type: block?.dataset.sbType || 'unknown',
            event_data: {
              duration_ms: st.totalTime,
              expected_time_sec: expectedTime,
              expected_time_std_sec: expectedTimeStd,
              engagement_pct: engagementPct,
              engagement_pct_std: engagementPctStd
            },
            user_agent: navigator.userAgent, viewport_width: window.innerWidth,
            viewport_height: window.innerHeight, referrer: document.referrer || null
          })
        });
      }
    });
    if (maxScrollDepth > 0) {
      fetch(SUPABASE_URL + '/rest/v1/analytics_events', {
        method: 'POST', keepalive: true, credentials: 'omit',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY, 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          story_id: STORY_ID, session_id: SESSION_ID, event_type: 'scroll_depth',
          block_index: null, block_type: null, event_data: { scroll_pct: maxScrollDepth },
          user_agent: navigator.userAgent, viewport_width: window.innerWidth,
          viewport_height: window.innerHeight, referrer: document.referrer || null
        })
      });
    }
  }
  window.addEventListener('beforeunload', sendEngagement);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') sendEngagement(); });
})();
<\/script>`;
  }

  const needsZoom  = /class="[^"]*\bsb-zoomsec\b/.test(body);
  const needsSplit = /class="[^"]*\bsplit-panel-wrapper\b/.test(body) || /class="[^"]*\bsplit-mobile-wrapper\b/.test(body);
  const needsCinematic = /class="[^"]*\bsb-cinematic-scroll\b/.test(body);

  const doctype = '<!DOCTYPE html>';
  return `${doctype}
<html lang="en">
  <head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${state.pageTitle || state.project || 'Story Export'}</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⛰️</text></svg>">
  <meta property="og:title" content="${state.pageTitle || state.project || 'Story'}">
  <meta property="og:description" content="A multimedia story by Marcus Chan">
  <meta property="og:type" content="article">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="author" content="Marcus Chan">
  <meta name="reading-time" content="${readTime} min read">
    <script src="https://cdn.tailwindcss.com"><\/script>
    <style>${BASE_CSS}</style>
  </head>
  <body>
    <div id="progress-bar" style="position:fixed;top:0;left:0;height:3px;background:#fbbf24;width:0%;z-index:9999;transition:width 0.1s;"></div>
    ${body}
    <script>${BOOT_FADE}<\/script>
    ${needsZoom  ? `<script>${ZOOM_RUNTIME}<\/script>`  : ''}
    ${needsCinematic ? `<script>${CINEMATIC_SCROLL_RUNTIME}<\/script>` : ''}
    ${needsSplit ? `<script>${SPLIT_PANEL_RUNTIME}<\/script><script>${SPLIT_MOBILE_RUNTIME}<\/script>` : ''}
    <script>${AUTO_MUTE_RUNTIME}<\/script>
    <script>
window.addEventListener('scroll', function() {
  var h = document.documentElement;
  var b = document.body;
  var st = 'scrollTop';
  var sh = 'scrollHeight';
  var percent = (h[st]||b[st]) / ((h[sh]||b[sh]) - h.clientHeight) * 100;
  document.getElementById('progress-bar').style.width = percent + '%';
}, {passive: true});
<\/script>
    ${analyticsScript}
  </body>
</html>`;
}