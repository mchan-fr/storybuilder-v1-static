import { resolvePreviewPath, resolveExportPath } from '../utils.js';

export const FullBleedBlock = {
  type: 'full-bleed',
  title: 'Full-bleed media',

  defaults() {
    return {
      type: 'full-bleed',
      media: '',
      caption: '',
      poster: '',
      paddingTop: 'none',
      paddingBottom: 'none',
      captionStyle: { color: '#e5e5e5', size: '14' },
      captionPosition: 'on', // 'on' = on photo (like gallery), 'below' = below photo
      expectedViewTime: null
    };
  },

  editor({ block }) {
    const b = block;
    const isVid = /\.mp4$|\.webm$|\.mov$/i.test(b.media || '');

    const paddingSizes = [
      { value: 'none', label: 'None (0px)' },
      { value: 'tight', label: 'Tight (15px)' },
      { value: 'medium', label: 'Medium (30px)' },
      { value: 'spacious', label: 'Spacious (50px)' }
    ];

    // Helper to create collapsible section
    const section = (title, content, collapsed = true) => {
      return '<div class="collapsible-section' + (collapsed ? ' collapsed' : '') + '">' +
        '<div class="collapsible-header">' +
          '<span>' + title + '</span>' +
          '<span class="collapsible-chevron">&#9660;</span>' +
        '</div>' +
        '<div class="collapsible-content">' + content + '</div>' +
      '</div>';
    };

    // Label field HTML
    const labelFieldHtml = `
      <div class="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <label class="block text-sm font-semibold text-blue-900 mb-2">📝 Block Label (Optional)</label>
        <input type="text" data-k="label" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="e.g., Sunset Panorama, Mountain Vista..."
          value="${b.label || ''}" />
      </div>
    `;

    // Block Settings content
    const blockSettingsContent = `
      <div class="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label class="block text-xs mb-1">Padding Top</label>
          <select data-k="paddingTop" class="w-full border rounded px-2 py-1 text-sm">
            ${paddingSizes.map(p => `<option value="${p.value}" ${(b.paddingTop || 'none') === p.value ? 'selected' : ''}>${p.label}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block text-xs mb-1">Padding Bottom</label>
          <select data-k="paddingBottom" class="w-full border rounded px-2 py-1 text-sm">
            ${paddingSizes.map(p => `<option value="${p.value}" ${(b.paddingBottom || 'none') === p.value ? 'selected' : ''}>${p.label}</option>`).join('')}
          </select>
        </div>
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

    // Poster field - only show for videos
    const posterFieldHtml = isVid ? `
      <div class="mb-3">
        <label class="block text-xs mb-1">Poster Image (thumbnail for mobile)</label>
        <input data-k="poster" value="${b.poster || ''}" class="w-full border rounded px-2 py-1 text-sm bg-white" placeholder="e.g., images/video-thumbnail.jpg">
        <p class="text-xs text-gray-500 mt-1">Shows before video plays</p>
      </div>
    ` : '';

    // Media content
    const captionStyle = b.captionStyle || { color: '#e5e5e5', size: '14' };
    const mediaContent = `
      <style>
        .media-field {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 10px;
          margin-bottom: 10px;
        }
        .media-field input,
        .media-field select {
          background: white;
        }
      </style>
      <div class="media-field">
        <label class="block text-xs mb-1 font-medium">Media (image or video)</label>
        <input data-k="media" value="${b.media || ''}" class="w-full border rounded px-2 py-1 text-sm" placeholder="e.g., images/hero.jpg or videos/intro.mp4">
        ${posterFieldHtml}
        <div class="mt-3">
          <label class="block text-xs mb-1">Caption (optional)</label>
          <input data-k="caption" value="${b.caption || ''}" class="w-full border rounded px-2 py-1 text-sm" placeholder="Caption text...">
        </div>
      </div>

      <div class="pt-3 border-t border-gray-200">
        <div class="text-xs font-semibold mb-2 text-gray-600">Caption Style</div>
        <div class="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label class="block text-xs mb-1">Text Color</label>
            <input type="color" data-k="captionStyle.color" value="${captionStyle.color || '#e5e5e5'}" class="w-full h-8 border rounded">
          </div>
          <div>
            <label class="block text-xs mb-1">Size (px)</label>
            <input type="number" data-k="captionStyle.size" min="10" max="24" value="${captionStyle.size || '14'}" class="w-full border rounded px-2 py-1 text-sm">
          </div>
        </div>
        <div>
          <label class="block text-xs mb-1">Caption Position</label>
          <select data-k="captionPosition" class="w-full border rounded px-2 py-1 text-sm">
            <option value="on" ${(b.captionPosition || 'on') === 'on' ? 'selected' : ''}>On photo (overlay at bottom)</option>
            <option value="below" ${b.captionPosition === 'below' ? 'selected' : ''}>Below photo</option>
          </select>
        </div>
      </div>
    `;

    // Assemble all sections (alphabetical order, all collapsed)
    return labelFieldHtml +
      section('⚙️ Block Settings', blockSettingsContent, true) +
      section('🖼️ Media', mediaContent, true);
  },

  preview({ block, project }) {
    const b = block;
    const isVid = /\.mp4$|\.webm$|\.mov$/i.test(b.media || '');
    const fadeAttr = b._fadeOnScroll ? ' data-fade-scroll="true"' : '';
    const posterAttr = b.poster ? ` poster="${resolvePreviewPath(b.poster, project)}"` : '';

    const paddingMap = { none: '0', tight: '15px', medium: '30px', spacious: '50px' };
    const paddingTop = paddingMap[b.paddingTop || 'none'];
    const paddingBottom = paddingMap[b.paddingBottom || 'none'];

    const captionStyle = b.captionStyle || { color: '#e5e5e5', size: '14' };
    const captionColor = captionStyle.color || '#e5e5e5';
    const captionSize = captionStyle.size || '14';

    let mediaHtml = '';
    if (isVid) {
      mediaHtml = `<video class="w-full" style="display:block;" controls playsinline preload="metadata"${posterAttr} src="${resolvePreviewPath(b.media, project)}"></video>`;
    } else {
      mediaHtml = `<img class="w-full" style="display:block;" src="${resolvePreviewPath(b.media, project)}">`;
    }

    let captionHtml = '';
    if (b.caption) {
      if (b.captionPosition === 'below') {
        // Below the photo
        captionHtml = `<div style="color:${captionColor};font-size:${captionSize}px;padding:12px 16px;text-align:center;">${b.caption}</div>`;
      } else {
        // On the photo (overlay)
        captionHtml = `<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(0,0,0,0.8),transparent);color:${captionColor};font-size:${captionSize}px;padding:20px 12px 12px;text-align:center;">${b.caption}</div>`;
      }
    }

    const containerStyle = b.captionPosition === 'below' ? '' : 'position:relative;';

    return `<section class="fullbleed" style="padding-top:${paddingTop};padding-bottom:${paddingBottom};"${fadeAttr}>
      <div style="${containerStyle}">
        ${mediaHtml}
        ${captionHtml}
      </div>
    </section>`;
  },

  exportHTML({ block }) {
    const b = block;
    const isVid = /\.mp4$|\.webm$|\.mov$/i.test(b.media || '');
    const fadeAttr = b._fadeOnScroll ? ' data-fade-scroll="true"' : '';
    const posterAttr = b.poster ? ` poster="${resolveExportPath(b.poster)}"` : '';

    const paddingMap = { none: '0', tight: '15px', medium: '30px', spacious: '50px' };
    const paddingTop = paddingMap[b.paddingTop || 'none'];
    const paddingBottom = paddingMap[b.paddingBottom || 'none'];

    const captionStyle = b.captionStyle || { color: '#e5e5e5', size: '14' };
    const captionColor = captionStyle.color || '#e5e5e5';
    const captionSize = captionStyle.size || '14';

    let mediaHtml = '';
    if (isVid) {
      mediaHtml = `<video class="w-full" style="display:block;" controls playsinline preload="metadata"${posterAttr} src="${resolveExportPath(b.media)}"></video>`;
    } else {
      mediaHtml = `<img class="w-full" style="display:block;" src="${resolveExportPath(b.media)}">`;
    }

    let captionHtml = '';
    if (b.caption) {
      if (b.captionPosition === 'below') {
        // Below the photo
        captionHtml = `<div style="color:${captionColor};font-size:${captionSize}px;padding:12px 16px;text-align:center;">${b.caption}</div>`;
      } else {
        // On the photo (overlay)
        captionHtml = `<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(0,0,0,0.8),transparent);color:${captionColor};font-size:${captionSize}px;padding:20px 12px 12px;text-align:center;">${b.caption}</div>`;
      }
    }

    const containerStyle = 'position:relative;z-index:1;';

    return `<section class="fullbleed" style="position:relative;z-index:3;padding-top:${paddingTop};padding-bottom:${paddingBottom};"${fadeAttr}>
      <div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:100vw;height:100%;background:#000;z-index:0;"></div>
      <div style="${containerStyle}">
        ${mediaHtml}
        ${captionHtml}
      </div>
    </section>`;
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
