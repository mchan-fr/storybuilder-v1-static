// File: src/blocks/cinematicScroll.js
import { resolvePreviewPath, resolveExportPath, collapsibleSection, labelFieldHtml, fontSelectHtml, getStyle, buildInlineStyle } from '../utils.js';

export const CinematicScrollBlock = {
  type: 'cinematic-scroll',
  title: 'Cinematic Scroll',

  defaults() {
    return {
      type: 'cinematic-scroll',
      label: '',
      slides: [{
        media: '',
        video: '',
        poster: '',
        subhead: '',
        subheadStyle: { size: '24', weight: 'normal', color: '#ffffff', font: 'system-ui', italic: false, shadow: true },
        text: '',
        textStyle: { size: '18', weight: 'normal', color: '#e5e5e5', font: 'system-ui', leading: '1.7', shadow: true },
        textPosition: 'center',
        textWidth: 'medium'
      }],
      _isSubheadStyleMaster: false,
      _inheritSubheadStyle: true,
      crossfadeDuration: 0.3,
      expectedViewTime: null,
      _fadeOnScroll: false
    };
  },

  editor({ block }) {
    const b = block;
    const slides = b.slides || [{}];
    const slideCount = slides.length;

    // Slide count buttons
    const slideCountButtons = [1, 2, 3, 4].map(n => {
      const isActive = slideCount === n;
      return `<button type="button" data-slide-count="${n}"
        class="slide-count-btn px-4 py-2 text-sm font-semibold rounded ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
        style="min-width:40px;">${n}</button>`;
    }).join('');

    // Build slide cards
    const slideCards = slides.map((slide, i) => {
      const subheadStyle = slide.subheadStyle || {};
      const textStyle = slide.textStyle || {};
      const positionOptions = ['left', 'center', 'right'].map(pos =>
        `<option value="${pos}" ${(slide.textPosition || 'center') === pos ? 'selected' : ''}>${pos}</option>`
      ).join('');

      return `
        <div class="slide-card collapsible-section collapsed" data-slide="${i}">
          <div class="collapsible-header bg-slate-100 p-3 rounded-t cursor-pointer">
            <span class="font-semibold">Slide ${i + 1}</span>
            <span class="collapsible-chevron">&#9660;</span>
          </div>
          <div class="collapsible-content p-3 border border-t-0 border-slate-200 rounded-b">
            <!-- Media -->
            <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <div class="text-xs font-semibold text-blue-900 mb-2">Media</div>
              <div class="mb-2">
                <label class="block text-xs mb-1">Image</label>
                <input data-k="slides.${i}.media" value="${slide.media || ''}"
                  class="w-full border rounded px-2 py-1 text-sm" placeholder="e.g., images/photo.jpg">
              </div>
              <div class="mb-2">
                <label class="block text-xs mb-1">Video (overrides image)</label>
                <input data-k="slides.${i}.video" value="${slide.video || ''}"
                  class="w-full border rounded px-2 py-1 text-sm" placeholder="e.g., videos/clip.mp4">
              </div>
              <div>
                <label class="block text-xs mb-1">Mobile Poster (optional)</label>
                <input data-k="slides.${i}.poster" value="${slide.poster || ''}"
                  class="w-full border rounded px-2 py-1 text-sm" placeholder="e.g., images/poster.jpg">
              </div>
            </div>

            <!-- Subhead -->
            <div class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded">
              <div class="text-xs font-semibold text-amber-900 mb-2">Subhead</div>
              <input data-k="slides.${i}.subhead" value="${slide.subhead || ''}"
                class="w-full border rounded px-2 py-1 text-sm mb-2" placeholder="Slide subhead...">
              <div class="mb-2 p-2 bg-amber-100 border border-amber-300 rounded text-xs">
                <label class="flex items-center gap-2 mb-1">
                  <input type="checkbox" data-k="_isSubheadStyleMaster" ${b._isSubheadStyleMaster ? 'checked' : ''}>
                  <span>Set styling for all blocks</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" data-k="_inheritSubheadStyle" ${b._inheritSubheadStyle !== false ? 'checked' : ''}>
                  <span class="text-gray-600">Inherit styling from master</span>
                </label>
              </div>
              <div class="subhead-style-fields ${b._inheritSubheadStyle !== false && !b._isSubheadStyleMaster ? 'opacity-50 pointer-events-none' : ''}">
                <div class="grid grid-cols-3 gap-2 mb-2">
                  <div>
                    <label class="block text-xs">Size</label>
                    <input data-k="slides.${i}.subheadStyle.size" type="number" min="12" max="48"
                      value="${getStyle(subheadStyle, 'size', '24')}" class="w-full border rounded px-2 py-1 text-sm">
                  </div>
                  <div>
                    <label class="block text-xs">Weight</label>
                    <select data-k="slides.${i}.subheadStyle.weight" class="w-full border rounded px-2 py-1 text-xs">
                      <option value="normal" ${getStyle(subheadStyle, 'weight', 'normal') === 'normal' ? 'selected' : ''}>normal</option>
                      <option value="bold" ${getStyle(subheadStyle, 'weight', 'normal') === 'bold' ? 'selected' : ''}>bold</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs">Color</label>
                    <input data-k="slides.${i}.subheadStyle.color" type="color"
                      value="${getStyle(subheadStyle, 'color', '#ffffff')}" class="w-full h-7 border rounded">
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="flex-1">
                    <label class="block text-xs mb-1">Font</label>
                    <select data-k="slides.${i}.subheadStyle.font" class="w-full border rounded px-2 py-1 text-xs">
                      ${fontSelectHtml(getStyle(subheadStyle, 'font', 'system-ui'))}
                    </select>
                  </div>
                  <label class="flex items-center gap-1 text-xs pt-4">
                    <input type="checkbox" data-k="slides.${i}.subheadStyle.italic" ${getStyle(subheadStyle, 'italic', false) ? 'checked' : ''}>
                    <span>Italic</span>
                  </label>
                  <label class="flex items-center gap-1 text-xs pt-4">
                    <input type="checkbox" data-k="slides.${i}.subheadStyle.shadow" ${getStyle(subheadStyle, 'shadow', true) ? 'checked' : ''}>
                    <span>Shadow</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Body Text -->
            <div class="mb-4 p-3 bg-green-50 border border-green-200 rounded">
              <div class="text-xs font-semibold text-green-900 mb-2">Body Text</div>
              <textarea data-k="slides.${i}.text" rows="3"
                class="w-full border rounded px-2 py-1 text-sm mb-2" placeholder="Body text...">${slide.text || ''}</textarea>
              <div class="grid grid-cols-3 gap-2 mb-2">
                <div>
                  <label class="block text-xs">Size</label>
                  <input data-k="slides.${i}.textStyle.size" type="number" min="12" max="36"
                    value="${getStyle(textStyle, 'size', '18')}" class="w-full border rounded px-2 py-1 text-sm">
                </div>
                <div>
                  <label class="block text-xs">Weight</label>
                  <select data-k="slides.${i}.textStyle.weight" class="w-full border rounded px-2 py-1 text-xs">
                    <option value="normal" ${getStyle(textStyle, 'weight', 'normal') === 'normal' ? 'selected' : ''}>normal</option>
                    <option value="bold" ${getStyle(textStyle, 'weight', 'normal') === 'bold' ? 'selected' : ''}>bold</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs">Color</label>
                  <input data-k="slides.${i}.textStyle.color" type="color"
                    value="${getStyle(textStyle, 'color', '#e5e5e5')}" class="w-full h-7 border rounded">
                </div>
              </div>
              <div class="grid grid-cols-3 gap-2 mb-2">
                <div>
                  <label class="block text-xs mb-1">Font</label>
                  <select data-k="slides.${i}.textStyle.font" class="w-full border rounded px-2 py-1 text-xs">
                    ${fontSelectHtml(getStyle(textStyle, 'font', 'system-ui'))}
                  </select>
                </div>
                <div>
                  <label class="block text-xs mb-1">Position</label>
                  <select data-k="slides.${i}.textPosition" class="w-full border rounded px-2 py-1 text-xs">
                    ${positionOptions}
                  </select>
                </div>
                <div>
                  <label class="block text-xs mb-1">Width</label>
                  <select data-k="slides.${i}.textWidth" class="w-full border rounded px-2 py-1 text-xs">
                    <option value="extra-narrow" ${(slide.textWidth || 'medium') === 'extra-narrow' ? 'selected' : ''}>extra narrow</option>
                    <option value="narrow" ${(slide.textWidth || 'medium') === 'narrow' ? 'selected' : ''}>narrow</option>
                    <option value="medium" ${(slide.textWidth || 'medium') === 'medium' ? 'selected' : ''}>medium</option>
                    <option value="wide" ${(slide.textWidth || 'medium') === 'wide' ? 'selected' : ''}>wide</option>
                  </select>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <label class="flex items-center gap-1 text-xs">
                  <input type="checkbox" data-k="slides.${i}.textStyle.shadow" ${getStyle(textStyle, 'shadow', true) ? 'checked' : ''}>
                  <span>Text shadow</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Block Settings content
    const blockSettingsContent = `
      <div class="mb-3">
        <label class="block text-xs mb-1">Crossfade Duration (seconds)</label>
        <input data-k="crossfadeDuration" type="number" step="0.1" min="0.1" max="2"
          value="${b.crossfadeDuration ?? 0.3}" class="w-full border rounded px-2 py-1 text-sm">
        <p class="text-xs text-gray-500 mt-1">Duration of crossfade between slides</p>
      </div>
      <div class="mb-3">
        <label class="block text-xs mb-1">Expected View Time (seconds)</label>
        <input type="number" data-k="expectedViewTime" min="1" max="300" step="1"
          value="${b.expectedViewTime || ''}"
          placeholder="Auto-calculated if empty"
          class="w-full border rounded px-2 py-1 text-sm" />
      </div>
      <div class="p-2 border rounded bg-slate-100">
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" data-k="_fadeOnScroll" ${b._fadeOnScroll ? 'checked' : ''}>
          <span>Enable fade effect on scroll</span>
        </label>
        <p class="text-xs text-slate-500 mt-1 ml-5">Content fades in when scrolled into view</p>
      </div>
    `;

    // Slides content
    const slidesContent = `
      <div class="mb-4">
        <label class="block text-sm font-semibold mb-2">Number of Slides</label>
        <div class="flex gap-2">${slideCountButtons}</div>
      </div>
      <div class="slides-container space-y-3">
        ${slideCards}
      </div>
    `;

    // Assemble all sections
    return labelFieldHtml(b.label, 'e.g., Mountain Summit Approach...') +
      collapsibleSection('Settings', blockSettingsContent, true) +
      collapsibleSection('Slides', slidesContent, false);
  },

  preview({ block, project }) {
    const b = block;
    const slides = b.slides || [];
    const slideCount = slides.length;
        const id = 'cs-' + Math.random().toString(36).slice(2, 8);

    // Calculate total height: 200vh per slide (100vh for media lock + 100vh for text scroll)
    const totalHeight = slideCount * 200;

    // Build media slides
    const mediaSlidesHtml = slides.map((slide, i) => {
      const hasVideo = slide.video && slide.video.trim();
      const hasImage = slide.media && slide.media.trim();

      let mediaHtml = '';
      if (hasVideo) {
        mediaHtml = `<video autoplay muted loop playsinline
          src="${resolvePreviewPath(slide.video, project)}"></video>`;
      } else if (hasImage) {
        mediaHtml = `<img src="${resolvePreviewPath(slide.media, project)}" alt="">`;
      } else {
        mediaHtml = `<div class="cs-placeholder">Slide ${i + 1}</div>`;
      }

      return `<div class="cs-media-slide${i === 0 ? ' active' : ''}" data-slide="${i}">${mediaHtml}</div>`;
    }).join('\n');

    // Text width mapping
    const textWidthMap = {
      'extra-narrow': '32rem',
      'narrow': '42rem',
      'medium': '56rem',
      'wide': '72rem'
    };

    // Build text slides with explicit spacers for scroll behavior
    const textSlidesHtml = slides.map((slide, i) => {
      const subheadShadow = (slide.subheadStyle?.shadow !== false) ? 'text-shadow:0 2px 8px rgba(0,0,0,0.7);' : '';
      const subheadItalic = (slide.subheadStyle?.italic) ? 'font-style:italic;' : '';
      const textShadow = (slide.textStyle?.shadow !== false) ? 'text-shadow:0 1px 4px rgba(0,0,0,0.6);' : '';
      const subheadStyle = buildInlineStyle(slide.subheadStyle, { color: '#ffffff', size: '24', font: 'system-ui', weight: 'normal' }) + subheadShadow + subheadItalic;
      const textStyle = buildInlineStyle(slide.textStyle, { color: '#e5e5e5', size: '18', font: 'system-ui', weight: 'normal', leading: '1.7' }) + textShadow;
      const textAlign = slide.textPosition || 'center';
      const maxWidth = textWidthMap[slide.textWidth || 'medium'];

      const subheadHtml = slide.subhead ? `<p class="cs-subhead" style="${subheadStyle}">${slide.subhead}</p>` : '';
      const bodyHtml = slide.text ? `<div style="${textStyle}">${slide.text.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>')}</div>` : '';

      return `
        <div class="cs-text-slide" data-slide="${i}">
          <div style="height:70vh"></div>
          <div class="cs-text-inner" style="text-align:${textAlign};max-width:${maxWidth};margin:0 auto;">
            ${subheadHtml}
            ${bodyHtml}
          </div>
          <div style="height:80vh"></div>
        </div>
      `;
    }).join('\n');

    // Build mobile fallback
    const mobileSlidesHtml = slides.map((slide, i) => {
      const hasVideo = slide.video && slide.video.trim();
      const hasImage = slide.media && slide.media.trim();
      const posterSrc = slide.poster || slide.media;

      let mediaHtml = '';
      if (hasVideo) {
        mediaHtml = `<video autoplay muted loop playsinline
          poster="${posterSrc ? resolvePreviewPath(posterSrc, project) : ''}"
          src="${resolvePreviewPath(slide.video, project)}"></video>`;
      } else if (hasImage) {
        mediaHtml = `<img src="${resolvePreviewPath(slide.media, project)}" alt="">`;
      }

      const subheadShadow = (slide.subheadStyle?.shadow !== false) ? 'text-shadow:0 2px 8px rgba(0,0,0,0.7);' : '';
      const subheadItalic = (slide.subheadStyle?.italic) ? 'font-style:italic;' : '';
      const mobSubheadStyle = buildInlineStyle(slide.subheadStyle, { color: '#ffffff', size: '24', font: 'system-ui', weight: 'normal' }) + subheadShadow + subheadItalic;
      const textShadow = (slide.textStyle?.shadow !== false) ? 'text-shadow:0 1px 4px rgba(0,0,0,0.6);' : '';
      const mobTextStyle = buildInlineStyle(slide.textStyle, { color: '#e5e5e5', size: '18', font: 'system-ui', weight: 'normal', leading: '1.7' }) + textShadow;
      const subheadHtml = slide.subhead ? `<p class="cs-subhead" style="${mobSubheadStyle}">${slide.subhead}</p>` : '';
      const bodyHtml = slide.text ? `<div style="${mobTextStyle}">${slide.text.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>')}</div>` : '';

      return `
        <div class="cs-mob-slide">
          <div class="cs-mob-media">${mediaHtml}</div>
          <div class="cs-mob-text">
            ${subheadHtml}
            ${bodyHtml}
          </div>
        </div>
      `;
    }).join('\n');

    const fadeAttr = b._fadeOnScroll ? ' data-fade-scroll="true"' : '';

    return `
      <!-- Desktop: Cinematic Scroll -->
      <section class="sb-cinematic-scroll" id="${id}"
        data-slide-count="${slideCount}"
        data-crossfade="${b.crossfadeDuration ?? 0.3}"${fadeAttr}>

        <div class="cs-media-wrap">
          ${mediaSlidesHtml}
        </div>

        <div class="cs-text-wrap">
          ${textSlidesHtml}
        </div>
      </section>

      <!-- Mobile: Stacked Layout -->
      <div class="sb-cinematic-mobile">
        ${mobileSlidesHtml}
      </div>
    `;
  },

  exportHTML({ block }) {
    const b = block;
    const slides = b.slides || [];
    const slideCount = slides.length;
        const id = 'cs-' + Math.random().toString(36).slice(2, 8);
    const totalHeight = slideCount * 200;

    // Build media slides
    const mediaSlidesHtml = slides.map((slide, i) => {
      const hasVideo = slide.video && slide.video.trim();
      const hasImage = slide.media && slide.media.trim();

      let mediaHtml = '';
      if (hasVideo) {
        const videoId = `${id}-video-${i}`;
        mediaHtml = `<video id="${videoId}" autoplay muted loop playsinline
          src="${resolveExportPath(slide.video)}"></video>`;
      } else if (hasImage) {
        mediaHtml = `<img src="${resolveExportPath(slide.media)}" alt="">`;
      }

      return `<div class="cs-media-slide${i === 0 ? ' active' : ''}" data-slide="${i}">${mediaHtml}</div>`;
    }).join('\n');

    // Text width mapping
    const textWidthMap = {
      'extra-narrow': '32rem',
      'narrow': '42rem',
      'medium': '56rem',
      'wide': '72rem'
    };

    // Build text slides with explicit spacers for scroll behavior
    const textSlidesHtml = slides.map((slide, i) => {
      const subheadShadow = (slide.subheadStyle?.shadow !== false) ? 'text-shadow:0 2px 8px rgba(0,0,0,0.7);' : '';
      const subheadItalic = (slide.subheadStyle?.italic) ? 'font-style:italic;' : '';
      const textShadow = (slide.textStyle?.shadow !== false) ? 'text-shadow:0 1px 4px rgba(0,0,0,0.6);' : '';
      const subheadStyle = buildInlineStyle(slide.subheadStyle, { color: '#ffffff', size: '24', font: 'system-ui', weight: 'normal' }) + subheadShadow + subheadItalic;
      const textStyle = buildInlineStyle(slide.textStyle, { color: '#e5e5e5', size: '18', font: 'system-ui', weight: 'normal', leading: '1.7' }) + textShadow;
      const textAlign = slide.textPosition || 'center';
      const maxWidth = textWidthMap[slide.textWidth || 'medium'];

      const subheadHtml = slide.subhead ? `<p class="cs-subhead" style="${subheadStyle}">${String(slide.subhead)}</p>` : '';
      const bodyHtml = slide.text ? `<div style="${textStyle}">${String(slide.text).replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>')}</div>` : '';

      return `
        <div class="cs-text-slide" data-slide="${i}">
          <div style="height:70vh"></div>
          <div class="cs-text-inner" style="text-align:${textAlign};max-width:${maxWidth};margin:0 auto;">
            ${subheadHtml}
            ${bodyHtml}
          </div>
          <div style="height:80vh"></div>
        </div>
      `;
    }).join('\n');

    // Build mobile fallback
    const mobileSlidesHtml = slides.map((slide, i) => {
      const hasVideo = slide.video && slide.video.trim();
      const hasImage = slide.media && slide.media.trim();
      const posterSrc = slide.poster || slide.media;
      const videoId = `${id}-mob-video-${i}`;

      let mediaHtml = '';
      if (hasVideo) {
        const muteButtonSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>';
        mediaHtml = `<video id="${videoId}" autoplay muted loop playsinline
          poster="${posterSrc ? resolveExportPath(posterSrc) : ''}"
          src="${resolveExportPath(slide.video)}"></video>
          <button onclick="toggleMute('${videoId}', this)" class="mute-btn mobile-mute-btn" aria-label="Toggle mute">${muteButtonSvg}</button>`;
      } else if (hasImage) {
        mediaHtml = `<img src="${resolveExportPath(slide.media)}" alt="">`;
      }

      const subheadShadow = (slide.subheadStyle?.shadow !== false) ? 'text-shadow:0 2px 8px rgba(0,0,0,0.7);' : '';
      const subheadItalic = (slide.subheadStyle?.italic) ? 'font-style:italic;' : '';
      const mobSubheadStyle = buildInlineStyle(slide.subheadStyle, { color: '#ffffff', size: '24', font: 'system-ui', weight: 'normal' }) + subheadShadow + subheadItalic;
      const textShadow = (slide.textStyle?.shadow !== false) ? 'text-shadow:0 1px 4px rgba(0,0,0,0.6);' : '';
      const mobTextStyle = buildInlineStyle(slide.textStyle, { color: '#e5e5e5', size: '18', font: 'system-ui', weight: 'normal', leading: '1.7' }) + textShadow;
      const subheadHtml = slide.subhead ? `<p class="cs-subhead" style="${mobSubheadStyle}">${String(slide.subhead)}</p>` : '';
      const bodyHtml = slide.text ? `<div style="${mobTextStyle}">${String(slide.text).replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>')}</div>` : '';

      return `
        <div class="cs-mob-slide">
          <div class="cs-mob-media">${mediaHtml}</div>
          <div class="cs-mob-text">
            ${subheadHtml}
            ${bodyHtml}
          </div>
        </div>
      `;
    }).join('\n');

    const fadeAttr = b._fadeOnScroll ? ' data-fade-scroll="true"' : '';

    return `
      <!-- Desktop: Cinematic Scroll -->
      <section class="sb-cinematic-scroll" id="${id}"
        data-slide-count="${slideCount}"
        data-crossfade="${b.crossfadeDuration ?? 0.3}"${fadeAttr}>

        <div class="cs-media-wrap">
          ${mediaSlidesHtml}
        </div>

        <div class="cs-text-wrap">
          ${textSlidesHtml}
        </div>
      </section>

      <!-- Mobile: Stacked Layout -->
      <div class="sb-cinematic-mobile">
        ${mobileSlidesHtml}
      </div>
    `;
  },

  set(block, key, value) {
    if (key.startsWith('slides.')) {
      const parts = key.split('.');
      const slideIndex = parseInt(parts[1]);

      if (!block.slides) block.slides = [{}];
      while (block.slides.length <= slideIndex) {
        block.slides.push({
          media: '',
          video: '',
          poster: '',
          subhead: '',
          subheadStyle: { size: '24', weight: 'normal', color: '#ffffff', font: 'system-ui', italic: false, shadow: true },
          text: '',
          textStyle: { size: '18', weight: 'normal', color: '#e5e5e5', font: 'system-ui', leading: '1.7', shadow: true },
          textPosition: 'center',
          textWidth: 'medium'
        });
      }

      if (parts.length === 3) {
        // slides.0.media
        block.slides[slideIndex][parts[2]] = value;
      } else if (parts.length === 4) {
        // slides.0.subheadStyle.size
        const styleKey = parts[2];
        const styleProp = parts[3];
        if (!block.slides[slideIndex][styleKey]) {
          block.slides[slideIndex][styleKey] = {};
        }
        block.slides[slideIndex][styleKey][styleProp] = value;
      }
    } else {
      block[key] = value;
    }
  }
};
