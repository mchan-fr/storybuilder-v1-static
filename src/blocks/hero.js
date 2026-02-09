import { resolvePreviewPath, resolveExportPath, fontSelectHtml } from '../utils.js';

export const HeroBlock = {
  type: 'hero',
  title: 'Hero (image/video + headline)',

  defaults() {
    return {
      type: 'hero',
      label: '',
      image: '',
      imageMobile: '',
      video: '',
      videoMobile: '',
      headline: 'A bold headline',
      headlineStyle: { size: '48', weight: 'bold', italic: false, color: '#ffffff', font: 'system-ui', align: 'center', leading: '1.2' },
      deck: '',
      deckStyle: { size: '20', weight: 'normal', italic: false, color: '#ffffff', font: 'system-ui', align: 'center' },
      positionVertical: 'center',
      positionHorizontal: 'center',
      offsetVertical: 0,
      offsetHorizontal: 0,
      expectedViewTime: null
    };
  },

  editor({ block }) {
    const b = block;
    const posV = ['top', 'center', 'bottom'];
    const posH = ['left', 'center', 'right'];
    const weightOpts = ['normal', 'bold'];
    const alignOpts = ['left', 'center', 'right'];
    // Use shared bodyFonts from utils.js

    const getStyle = (styleObj, prop, fallback) => (styleObj && styleObj[prop]) || fallback;
    const headlineStyle = b.headlineStyle || {};
    const deckStyle = b.deckStyle || {};

    // Helper for collapsible sections (matches photoLedeSide)
    const section = (title, content, collapsed = false) => {
      return '<div class="collapsible-section' + (collapsed ? ' collapsed' : '') + '">' +
        '<div class="collapsible-header">' +
          '<span>' + title + '</span>' +
          '<span class="collapsible-chevron">▼</span>' +
        '</div>' +
        '<div class="collapsible-content">' + content + '</div>' +
      '</div>';
    };

    // Block Label (always visible, not collapsible)
    const labelFieldHtml = '<div class="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">' +
      '<label class="block text-sm font-semibold text-blue-900 mb-2">📝 Block Label (Optional)</label>' +
      '<input type="text" data-k="label" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" ' +
        'placeholder="e.g., Opening scene..." ' +
        'value="' + (b.label || '') + '" />' +
    '</div>';

    // Media section content
    const mediaContent = `
      <div class="mb-3">
        <div class="text-xs font-semibold mb-2 text-blue-700">Desktop Media</div>
        <label class="block font-medium text-sm">Image</label>
        <input data-k="image" value="${b.image || ''}" class="w-full border rounded px-2 py-1 mb-2">
        <label class="block font-medium text-sm">Video (optional)</label>
        <input data-k="video" value="${b.video || ''}" class="w-full border rounded px-2 py-1">
      </div>
      <div class="pt-3 border-t border-gray-200">
        <div class="text-xs font-semibold mb-2 text-purple-700">Mobile Media (optional)</div>
        <p class="text-xs text-gray-500 mb-2">If not provided, desktop media will be used.</p>
        <label class="block font-medium text-sm">Mobile Image</label>
        <input data-k="imageMobile" value="${b.imageMobile || ''}" class="w-full border rounded px-2 py-1 mb-2">
        <label class="block font-medium text-sm">Mobile Video (optional)</label>
        <input data-k="videoMobile" value="${b.videoMobile || ''}" class="w-full border rounded px-2 py-1">
      </div>
    `;

    // Headline section content (includes headline, deck, and position)
    const headlineContent = `
      <div class="mb-3">
        <label class="block font-semibold text-sm mb-1">Headline</label>
        <textarea data-k="headline" rows="2" class="w-full border rounded px-2 py-1 mb-2">${b.headline || ''}</textarea>
        <div class="p-2 border rounded bg-gray-50">
          <div class="text-xs font-semibold mb-2 text-gray-600">Headline Style</div>
          <div class="grid grid-cols-3 gap-2 mb-2">
            <div>
              <label class="block text-xs">Size (px)</label>
              <input data-k="headlineStyle.size" type="number" min="12" max="120" value="${getStyle(headlineStyle, 'size', '48')}" class="w-full border rounded px-2 py-1 text-sm">
            </div>
            <div>
              <label class="block text-xs">Weight</label>
              <select data-k="headlineStyle.weight" class="w-full border rounded px-2 py-1 text-xs">
                ${weightOpts.map(w => `<option ${getStyle(headlineStyle, 'weight', 'bold') === w ? 'selected' : ''} value="${w}">${w}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs">Color</label>
              <input type="color" data-k="headlineStyle.color" value="${getStyle(headlineStyle, 'color', '#ffffff')}" class="w-full h-8 border rounded">
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2 mb-2">
            <div>
              <label class="block text-xs">Font</label>
              <select data-k="headlineStyle.font" class="w-full border rounded px-2 py-1 text-xs">
                ${fontSelectHtml(getStyle(headlineStyle, 'font', 'system-ui'))}
              </select>
            </div>
            <div>
              <label class="block text-xs">Align</label>
              <select data-k="headlineStyle.align" class="w-full border rounded px-2 py-1 text-xs">
                ${alignOpts.map(a => `<option ${getStyle(headlineStyle, 'align', 'center') === a ? 'selected' : ''} value="${a}">${a}</option>`).join('')}
              </select>
            </div>
            <div class="flex items-end">
              <label class="flex items-center gap-1 text-xs">
                <input type="checkbox" data-k="headlineStyle.italic" ${getStyle(headlineStyle, 'italic', false) ? 'checked' : ''}>
                <span>Italic</span>
              </label>
            </div>
          </div>
          <div>
            <label class="block text-xs">Line Height</label>
            <input data-k="headlineStyle.leading" type="range" min="0.8" max="2.0" step="0.05" value="${getStyle(headlineStyle, 'leading', '1.2')}" class="w-full">
            <div class="text-xs text-center text-gray-500">${getStyle(headlineStyle, 'leading', '1.2')}</div>
          </div>
        </div>
      </div>

      <div class="mb-3 pt-3 border-t border-gray-200">
        <label class="block font-semibold text-sm mb-1">Deck (optional)</label>
        <textarea data-k="deck" rows="2" class="w-full border rounded px-2 py-1 mb-2">${b.deck || ''}</textarea>
        <div class="p-2 border rounded bg-gray-50">
          <div class="text-xs font-semibold mb-2 text-gray-600">Deck Style</div>
          <div class="grid grid-cols-3 gap-2 mb-2">
            <div>
              <label class="block text-xs">Size (px)</label>
              <input data-k="deckStyle.size" type="number" min="12" max="72" value="${getStyle(deckStyle, 'size', '20')}" class="w-full border rounded px-2 py-1 text-sm">
            </div>
            <div>
              <label class="block text-xs">Weight</label>
              <select data-k="deckStyle.weight" class="w-full border rounded px-2 py-1 text-xs">
                ${weightOpts.map(w => `<option ${getStyle(deckStyle, 'weight', 'normal') === w ? 'selected' : ''} value="${w}">${w}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs">Color</label>
              <input type="color" data-k="deckStyle.color" value="${getStyle(deckStyle, 'color', '#ffffff')}" class="w-full h-8 border rounded">
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-xs">Font</label>
              <select data-k="deckStyle.font" class="w-full border rounded px-2 py-1 text-xs">
                ${fontSelectHtml(getStyle(deckStyle, 'font', 'system-ui'))}
              </select>
            </div>
            <div>
              <label class="block text-xs">Align</label>
              <select data-k="deckStyle.align" class="w-full border rounded px-2 py-1 text-xs">
                ${alignOpts.map(a => `<option ${getStyle(deckStyle, 'align', 'center') === a ? 'selected' : ''} value="${a}">${a}</option>`).join('')}
              </select>
            </div>
            <div class="flex items-end">
              <label class="flex items-center gap-1 text-xs">
                <input type="checkbox" data-k="deckStyle.italic" ${getStyle(deckStyle, 'italic', false) ? 'checked' : ''}>
                <span>Italic</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="pt-3 border-t border-gray-200">
        <div class="text-xs font-semibold mb-2 text-gray-600">Position</div>
        <div class="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label class="block text-xs">Vertical</label>
            <select data-k="positionVertical" class="w-full border rounded px-2 py-1 text-xs">
              ${posV.map(p => `<option ${(b.positionVertical || 'center') === p ? 'selected' : ''} value="${p}">${p}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-xs">Horizontal</label>
            <select data-k="positionHorizontal" class="w-full border rounded px-2 py-1 text-xs">
              ${posH.map(p => `<option ${(b.positionHorizontal || 'center') === p ? 'selected' : ''} value="${p}">${p}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs">Vertical Offset (px)</label>
            <input data-k="offsetVertical" type="range" min="-100" max="100" value="${b.offsetVertical || 0}" class="w-full">
            <div class="text-xs text-center text-gray-500">${b.offsetVertical || 0}px</div>
          </div>
          <div>
            <label class="block text-xs">Horizontal Offset (px)</label>
            <input data-k="offsetHorizontal" type="range" min="-100" max="100" value="${b.offsetHorizontal || 0}" class="w-full">
            <div class="text-xs text-center text-gray-500">${b.offsetHorizontal || 0}px</div>
          </div>
        </div>
      </div>
    `;

    // Block Settings content
    const blockSettingsContent = `
      <div class="mb-3">
        <label class="flex items-center gap-2">
          <input type="checkbox" data-k="_fadeOnScroll" ${b._fadeOnScroll ? 'checked' : ''}>
          <span class="text-sm">Enable fade effect on scroll</span>
        </label>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Expected View Time (seconds)</label>
        <input type="number" data-k="expectedViewTime" min="1" max="300" step="1"
          value="${b.expectedViewTime || ''}"
          placeholder="Auto-calculated if empty"
          class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
        <p class="text-xs text-gray-500 mt-1">Override the auto-calculated time for analytics.</p>
      </div>
    `;

    return labelFieldHtml +
      section('⚙️ Block Settings', blockSettingsContent, true) +
      section('📰 Headline', headlineContent, true) +
      section('🖼️ Media', mediaContent, true);
  },

  preview({ block, project }) {
    const bg = block.video
      ? `<video class="absolute inset-0 w-full h-full object-cover" autoplay muted loop playsinline src="${resolvePreviewPath(block.video, project)}"></video>`
      : `<img class="absolute inset-0 w-full h-full object-cover" src="${resolvePreviewPath(block.image, project)}" alt="">`;

    const buildStyle = (styleObj, fallbacks) => {
      const color = (styleObj && styleObj.color) || fallbacks.color;
      const size = (styleObj && styleObj.size) || fallbacks.size;
      const font = (styleObj && styleObj.font) || fallbacks.font;
      const weight = (styleObj && styleObj.weight) || fallbacks.weight;
      const italic = (styleObj && styleObj.italic) || false;
      const align = (styleObj && styleObj.align) || fallbacks.align;
      const leading = (styleObj && styleObj.leading) || fallbacks.leading || '1.2';
      const fontStyle = italic ? 'italic' : 'normal';
      const fontWeight = weight === 'bold' ? '700' : '400';
      return {
        style: `color:${color};font-size:${size}px;font-family:${font};font-weight:${fontWeight};font-style:${fontStyle};line-height:${leading};text-shadow:0 2px 8px rgba(0,0,0,0.55);`,
        align: `text-${align}`
      };
    };

    const headline = buildStyle(block.headlineStyle, { color: '#ffffff', size: '48', font: 'system-ui', weight: 'bold', align: 'center', leading: '1.2' });
    const deck = buildStyle(block.deckStyle, { color: '#ffffff', size: '20', font: 'system-ui', weight: 'normal', align: 'center' });

    const posV = block.positionVertical || 'center';
    const posH = block.positionHorizontal || 'center';
    const offsetV = block.offsetVertical || 0;
    const offsetH = block.offsetHorizontal || 0;

    const vertClass = posV === 'top' ? 'items-start' : (posV === 'bottom' ? 'items-end' : 'items-center');
    const horizClass = posH === 'left' ? 'justify-start' : (posH === 'right' ? 'justify-end' : 'justify-center');
    const containerPadding = (posV === 'top' ? 'pt-20 ' : posV === 'bottom' ? 'pb-20 ' : '') + (posH === 'left' ? 'pl-20' : posH === 'right' ? 'pr-20' : '');
    const offsetStyle = `transform:translate(${offsetH}px,${offsetV}px);`;
    
    const fadeAttr = block._fadeOnScroll ? ' data-fade-scroll="true"' : '';

    return `<section class="relative h-[70vh] mb-6 rounded overflow-hidden"${fadeAttr}>${bg}
      <div class="absolute inset-0 z-10 flex ${vertClass} ${horizClass}">
        <div class="max-w-4xl px-4 ${containerPadding}" style="${offsetStyle}">
          <h1 class="${headline.align}" style="${headline.style}">${(block.headline || '').replace(/\n/g, '<br>')}</h1>
          ${block.deck ? `<div class="${deck.align} mt-3" style="${deck.style}">${String(block.deck).replace(/\n/g, '<br>')}</div>` : ''}
        </div>
      </div></section>`;
  },

  exportHTML({ block }) {
    // Determine if we have mobile-specific media
    const hasVideoMobile = block.videoMobile && block.videoMobile.trim();
    const hasImageMobile = block.imageMobile && block.imageMobile.trim();
    const hasVideo = block.video && block.video.trim();
    const hasImage = block.image && block.image.trim();
    
    let bg = '';
    
    if (hasVideo || hasVideoMobile) {
      // Video with optional mobile source
      const desktopSrc = hasVideo ? resolveExportPath(block.video) : '';
      const mobileSrc = hasVideoMobile ? resolveExportPath(block.videoMobile) : desktopSrc;
      
      const desktopVideoId = 'hero-video-desktop-' + Math.random().toString(36).substr(2, 9);
      const mobileVideoId = 'hero-video-mobile-' + Math.random().toString(36).substr(2, 9);
      
      const muteButtonSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" opacity="0.3" class="unmuted-path"/><line x1="2" y1="2" x2="22" y2="22" stroke="white" stroke-width="2" class="muted-line" style="display:none;"/></svg>';
      
      const desktopMuteBtn = `<button onclick="toggleMute('${desktopVideoId}', this)" class="mute-btn desktop-mute-btn" aria-label="Toggle mute">${muteButtonSvg}</button>`;
      const mobileMuteBtn = `<button onclick="toggleMute('${mobileVideoId}', this)" class="mute-btn mobile-mute-btn" aria-label="Toggle mute">${muteButtonSvg}</button>`;
      
      bg = `<video id="${desktopVideoId}" class="media desktop-media" autoplay muted loop playsinline src="${desktopSrc}"></video>${desktopMuteBtn}`;
      if (hasVideoMobile) {
        bg += `<video id="${mobileVideoId}" class="media mobile-media" autoplay muted loop playsinline src="${mobileSrc}"></video>${mobileMuteBtn}`;
      } else {
        // Use desktop video on mobile too, need mobile button for it
        bg += `<button onclick="toggleMute('${desktopVideoId}', this)" class="mute-btn mobile-mute-btn" aria-label="Toggle mute">${muteButtonSvg}</button>`;
      }
    } else if (hasImage || hasImageMobile) {
      // Image with optional mobile source using <picture> element
      const desktopSrc = hasImage ? resolveExportPath(block.image) : '';
      const mobileSrc = hasImageMobile ? resolveExportPath(block.imageMobile) : '';
      
      if (hasImageMobile) {
        // Updated breakpoint to 1024px for tablet support
        bg = `<picture class="media-picture">
          <source media="(max-width: 1024px)" srcset="${mobileSrc}">
          <img class="media" src="${desktopSrc}" alt="">
        </picture>`;
      } else {
        bg = `<img class="media" src="${desktopSrc}" alt="">`;
      }
    }

    const buildStyle = (styleObj, fallbacks) => {
      const color = (styleObj && styleObj.color) || fallbacks.color;
      const size = (styleObj && styleObj.size) || fallbacks.size;
      const font = (styleObj && styleObj.font) || fallbacks.font;
      const weight = (styleObj && styleObj.weight) || fallbacks.weight;
      const italic = (styleObj && styleObj.italic) || false;
      const align = (styleObj && styleObj.align) || fallbacks.align;
      const leading = (styleObj && styleObj.leading) || fallbacks.leading || '1.2';
      const fontStyle = italic ? 'italic' : 'normal';
      const fontWeight = weight === 'bold' ? '700' : '400';
      return {
        style: `color:${color};font-size:${size}px;font-family:${font};font-weight:${fontWeight};font-style:${fontStyle};line-height:${leading};text-shadow:0 2px 8px rgba(0,0,0,0.55);`,
        align: `text-${align}`
      };
    };

    const headline = buildStyle(block.headlineStyle, { color: '#ffffff', size: '48', font: 'system-ui', weight: 'bold', align: 'center', leading: '1.2' });
    const deck = buildStyle(block.deckStyle, { color: '#ffffff', size: '20', font: 'system-ui', weight: 'normal', align: 'center' });

    // Desktop positioning (user-configured)
    const posV = block.positionVertical || 'center';
    const posH = block.positionHorizontal || 'center';
    const offsetV = block.offsetVertical || 0;
    const offsetH = block.offsetHorizontal || 0;

    const vertClass = posV === 'top' ? 'items-start' : (posV === 'bottom' ? 'items-end' : 'items-center');
    const horizClass = posH === 'left' ? 'justify-start' : (posH === 'right' ? 'justify-end' : 'justify-center');
    const containerPadding = (posV === 'top' ? 'pt-20 ' : posV === 'bottom' ? 'pb-20 ' : '') + (posH === 'left' ? 'pl-20' : posH === 'right' ? 'pr-20' : '');
    const offsetStyle = `transform:translate(${offsetH}px,${offsetV}px);`;
    
    const fadeAttr = block._fadeOnScroll ? ' data-fade-scroll="true"' : '';
    
    // Add class to indicate mobile media is available
    const mobileClass = (hasImageMobile || hasVideoMobile) ? ' has-mobile-media' : '';
    
    // Mobile deck section - separate full-screen section with fade transition
    const mobileDeckText = block.deck ? String(block.deck).replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() : '';
    const deckColor = (block.deckStyle && block.deckStyle.color) || '#ffffff';
    const deckFont = (block.deckStyle && block.deckStyle.font) || 'system-ui';
    const deckItalic = (block.deckStyle && block.deckStyle.italic) ? 'italic' : 'normal';
    const mobileDeck = mobileDeckText ? `<div class="hero-mobile-deck-section"><div class="hero-mobile-deck-text" style="color:${deckColor};font-family:${deckFont};font-style:${deckItalic};">${mobileDeckText}</div></div>` : '';

    // Scroll fade script for mobile - hero image fades as deck wipes up
    // Updated breakpoint to 1024px
    const scrollFadeScript = mobileDeckText ? `<script>
(function() {
  if (window.innerWidth > 1024) return;
  
  const hero = document.querySelector('.sb-hero');
  if (!hero) return;
  
  const imageSection = hero.querySelector('.hero-image-section');
  if (!imageSection) return;
  
  let ticking = false;
  
  function updateFade() {
    const scrollY = window.scrollY || window.pageYOffset;
    const viewportHeight = window.innerHeight;
    
    // Fade hero as user scrolls through first viewport
    const fadeProgress = Math.min(1, scrollY / (viewportHeight * 0.7));
    imageSection.style.opacity = String(1 - fadeProgress);
    
    ticking = false;
  }
  
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(updateFade);
      ticking = true;
    }
  }, { passive: true });
  
  updateFade();
})();
</script>` : '';

    // Desktop: headline + deck together in overlay (user-positioned)
    // Mobile: headline only in overlay (bottom-left, larger), deck wipes up from bottom
    return `<section class="sb-hero fullbleed overflow-hidden${mobileClass}" style="position:relative;z-index:3;"${fadeAttr}>
      <div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:100vw;height:100%;background:#000;z-index:0;"></div>
      <div class="hero-image-section" style="position:relative;z-index:1;">
        ${bg}
        <div class="hero-gradient"></div>
        <div class="overlay desktop-overlay ${vertClass} ${horizClass}">
          <div class="max-w-4xl px-4 ${containerPadding}" style="${offsetStyle}">
            <h1 class="${headline.align}" style="${headline.style}">${String(block.headline || '').replace(/\n/g, '<br/>')}</h1>
            ${block.deck ? `<div class="sb-hero-desktop-deck ${deck.align} mt-3" style="${deck.style}">${String(block.deck).replace(/\n/g, '<br/>')}</div>` : ''}
          </div>
        </div>
        <div class="overlay mobile-overlay">
          <div class="hero-mobile-headline-container">
            <h1 class="hero-mobile-headline" style="color:${(block.headlineStyle && block.headlineStyle.color) || '#ffffff'};font-family:${(block.headlineStyle && block.headlineStyle.font) || 'system-ui'};font-weight:${(block.headlineStyle && block.headlineStyle.weight) === 'bold' ? '700' : '400'};font-style:${(block.headlineStyle && block.headlineStyle.italic) ? 'italic' : 'normal'};">${String(block.headline || '').replace(/\n/g, '<br/>')}</h1>
          </div>
        </div>
      </div>
      ${mobileDeck}
    </section>${scrollFadeScript}`;
  },

  set(block, key, value) {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      if (!block[parent]) block[parent] = {};
      block[parent][child] = value;
    } else {
      block[key] = value;
    }
  }
};