import { resolvePreviewPath, resolveExportPath } from '../utils.js';

export const StickyHeroBlock = {
  type: 'sticky-hero',
  title: 'Sticky Hero (headline reveal)',

  defaults() {
    return {
      type: 'sticky-hero',
      image: '',
      imageMobile: '',
      video: '',
      videoMobile: '',
      lines: ['Line one', 'Line two', 'Line three'],
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
    const fontFamilies = [
      'system-ui',
      'IBM Plex Sans, sans-serif',
      'Georgia, serif',
      'Times New Roman, serif',
      'Arial, sans-serif',
      'Helvetica, sans-serif',
      'Courier New, monospace',
      'Lora, serif',
      'Merriweather, serif',
      'Bitter, serif',
      'Playfair Display, serif',
      'Montserrat, sans-serif',
      'Raleway, sans-serif'
    ];

    const getStyle = (styleObj, prop, fallback) => (styleObj && styleObj[prop]) || fallback;
    const headlineStyle = b.headlineStyle || {};
    const deckStyle = b.deckStyle || {};

    return `
      <div class="p-3 mb-4 border-2 border-blue-200 rounded-lg bg-blue-50">
        <div class="text-xs font-semibold mb-2 text-blue-700">Desktop Media</div>
        <label class="block font-medium text-sm">Image</label>
        <input data-k="image" value="${b.image || ''}" class="w-full border rounded px-2 py-1 mb-2">
        
        <label class="block font-medium text-sm">Video (optional)</label>
        <input data-k="video" value="${b.video || ''}" class="w-full border rounded px-2 py-1">
      </div>

      <div class="p-3 mb-4 border-2 border-purple-200 rounded-lg bg-purple-50">
        <div class="text-xs font-semibold mb-2 text-purple-700">Mobile Media (optional)</div>
        <p class="text-xs text-purple-600 mb-2">If not provided, desktop media will be used (cropped to fit).</p>
        <label class="block font-medium text-sm">Mobile Image</label>
        <input data-k="imageMobile" value="${b.imageMobile || ''}" class="w-full border rounded px-2 py-1 mb-2">
        
        <label class="block font-medium text-sm">Mobile Video (optional)</label>
        <input data-k="videoMobile" value="${b.videoMobile || ''}" class="w-full border rounded px-2 py-1">
      </div>

      <div class="p-3 mb-4 border-2 border-amber-200 rounded-lg bg-amber-50">
        <label class="block font-semibold text-amber-900 mb-2">Lines (one per line)</label>
        <textarea data-k="lines" rows="3" class="w-full border rounded px-2 py-1 mb-2">${(b.lines || []).join('\n')}</textarea>
        
        <div class="p-2 border rounded bg-white">
          <div class="text-xs font-semibold mb-2 text-amber-700">Headline Style</div>
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
                ${fontFamilies.map(f => `<option ${getStyle(headlineStyle, 'font', 'system-ui') === f ? 'selected' : ''} value="${f}">${f.split(',')[0]}</option>`).join('')}
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
          <div class="mb-2">
            <label class="block text-xs">Line Height (Leading)</label>
            <input data-k="headlineStyle.leading" type="range" min="0.8" max="2.0" step="0.05" value="${getStyle(headlineStyle, 'leading', '1.2')}" class="w-full">
            <div class="text-xs text-center text-slate-600">${getStyle(headlineStyle, 'leading', '1.2')}</div>
          </div>
        </div>
      </div>

      <div class="p-3 mb-4 border-2 border-orange-200 rounded-lg bg-orange-50">
        <label class="block font-semibold text-orange-900 mb-2">Deck (optional)</label>
        <textarea data-k="deck" rows="2" class="w-full border rounded px-2 py-1 mb-2">${b.deck || ''}</textarea>
        
        <div class="p-2 border rounded bg-white">
          <div class="text-xs font-semibold mb-2 text-orange-700">Deck Style</div>
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
          <div class="grid grid-cols-3 gap-2 mb-2">
            <div>
              <label class="block text-xs">Font</label>
              <select data-k="deckStyle.font" class="w-full border rounded px-2 py-1 text-xs">
                ${fontFamilies.map(f => `<option ${getStyle(deckStyle, 'font', 'system-ui') === f ? 'selected' : ''} value="${f}">${f.split(',')[0]}</option>`).join('')}
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

      <div class="mt-3 p-2 border rounded bg-slate-100">
        <div class="text-xs font-semibold mb-2">Position</div>
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
            <div class="text-xs text-center text-slate-600">${b.offsetVertical || 0}px</div>
          </div>
          <div>
            <label class="block text-xs">Horizontal Offset (px)</label>
            <input data-k="offsetHorizontal" type="range" min="-100" max="100" value="${b.offsetHorizontal || 0}" class="w-full">
            <div class="text-xs text-center text-slate-600">${b.offsetHorizontal || 0}px</div>
          </div>
        </div>
      </div>

      <div class="mt-4 p-3 border-2 border-teal-200 rounded-lg bg-teal-50">
        <label class="block text-sm font-semibold text-teal-900 mb-2">⏱️ Expected View Time (seconds)</label>
        <input type="number" data-k="expectedViewTime" min="1" max="300" step="1"
          value="${b.expectedViewTime || ''}"
          placeholder="Auto-calculated if empty"
          class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
        <p class="text-xs text-teal-600 mt-2">Override the auto-calculated time for analytics. Leave empty to use default.</p>
      </div>
    `;
  },

  preview({ block, project }) {
    const bg = block.video
      ? `<video class='absolute inset-0 w-full h-full object-cover' autoplay muted loop playsinline src='${resolvePreviewPath(block.video, project)}'></video>`
      : `<img class='absolute inset-0 w-full h-full object-cover' src='${resolvePreviewPath(block.image, project)}' alt=''>`;

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

    const lines = (block.lines || []).map(l => `<div class='reveal-line ${headline.align}' style='${headline.style}'>${l}</div>`).join('');

    return `<section class='relative h-[80vh] mb-6 rounded overflow-hidden'>${bg}
      <div class='absolute inset-0 z-10 flex ${vertClass} ${horizClass}'>
        <div class='max-w-4xl px-4 ${containerPadding}' style='${offsetStyle}'>
          <div class='sb-sticky-reveal space-y-1'>${lines}</div>
          ${block.deck ? `<div class='${deck.align} mt-3' style='${deck.style}'>${String(block.deck).replace(/\n/g, '<br>')}</div>` : ''}
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
      
      bg = `<video class='media desktop-media' autoplay muted loop playsinline src='${desktopSrc}'></video>`;
      if (hasVideoMobile) {
        bg += `<video class='media mobile-media' autoplay muted loop playsinline src='${mobileSrc}'></video>`;
      }
    } else if (hasImage || hasImageMobile) {
      // Image with optional mobile source using <picture> element
      const desktopSrc = hasImage ? resolveExportPath(block.image) : '';
      const mobileSrc = hasImageMobile ? resolveExportPath(block.imageMobile) : '';
      
      if (hasImageMobile) {
        bg = `<picture class='media-picture'>
          <source media='(max-width: 768px)' srcset='${mobileSrc}'>
          <img class='media' src='${desktopSrc}' alt=''>
        </picture>`;
      } else {
        bg = `<img class='media' src='${desktopSrc}' alt=''>`;
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

    const posV = block.positionVertical || 'center';
    const posH = block.positionHorizontal || 'center';
    const offsetV = block.offsetVertical || 0;
    const offsetH = block.offsetHorizontal || 0;

    const vertClass = posV === 'top' ? 'items-start' : (posV === 'bottom' ? 'items-end' : 'items-center');
    const horizClass = posH === 'left' ? 'justify-start' : (posH === 'right' ? 'justify-end' : 'justify-center');
    const containerPadding = (posV === 'top' ? 'pt-20 ' : posV === 'bottom' ? 'pb-20 ' : '') + (posH === 'left' ? 'pl-20' : posH === 'right' ? 'pr-20' : '');
    const offsetStyle = `transform:translate(${offsetH}px,${offsetV}px);`;

    const rid = 'stickyReveal-' + Math.random().toString(36).slice(2, 8);
    const lines = (block.lines || []).map(l => `<div class='reveal-line ${headline.align}' style='${headline.style}'>${l}</div>`).join('');
    
    // Add class to indicate mobile media is available
    const mobileClass = (hasImageMobile || hasVideoMobile) ? ' has-mobile-media' : '';

    return `<section class='sb-hero fullbleed overflow-hidden${mobileClass}'>${bg}
      <div class='overlay ${vertClass} ${horizClass}'>
        <div class='max-w-4xl px-4 ${containerPadding}' style='${offsetStyle}'>
          <div id='${rid}' class='space-y-1'>${lines}</div>
          ${block.deck ? `<div class='${deck.align} mt-3' style='${deck.style}'>${String(block.deck).replace(/\n/g, '<br/>')}</div>` : ''}
        </div>
      </div></section>
      <script>(function(){var c=document.getElementById('${rid}');if(!c) return;var kids=[].slice.call(c.children);var j=0;function step(){if(j>=kids.length) return;kids[j].classList.add('visible');j++;setTimeout(step,350);}setTimeout(step,250);}());</script>`;
  },

  set(block, key, value) {
    if (key === 'lines') {
      block.lines = value.split('\n').filter(line => line.trim());
    } else if (key.includes('.')) {
      const [parent, child] = key.split('.');
      if (!block[parent]) block[parent] = {};
      block[parent][child] = value;
    } else {
      block[key] = value;
    }
  }
};