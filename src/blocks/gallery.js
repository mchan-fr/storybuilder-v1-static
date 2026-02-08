import { resolvePreviewPath, resolveExportPath } from '../utils.js';

// Gallery template definitions - organized by number of photos
export const GALLERY_TEMPLATES = {
  'two-equal': {
    name: '2 Photos: Equal',
    slots: 2,
    gridColumns: '1fr 1fr',
    gridRows: '100vh',
    positions: [
      { gridColumn: '1', gridRow: '1' },
      { gridColumn: '2', gridRow: '1' }
    ],
    previewHTML: `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;width:100%;height:100%;">
        <div style="background:#666;"></div>
        <div style="background:#666;"></div>
      </div>
    `
  },
  'two-ratio': {
    name: '2 Photos: 2:1 Ratio (Left)',
    slots: 2,
    gridColumns: '2fr 1fr',
    gridRows: '80vh',
    positions: [
      { gridColumn: '1', gridRow: '1' },
      { gridColumn: '2', gridRow: '1' }
    ],
    previewHTML: `
      <div style="display:grid;grid-template-columns:2fr 1fr;gap:3px;width:100%;height:100%;">
        <div style="background:#666;"></div>
        <div style="background:#666;"></div>
      </div>
    `
  },
  'two-ratio-reverse': {
    name: '2 Photos: 2:1 Ratio (Right)',
    slots: 2,
    gridColumns: '1fr 2fr',
    gridRows: '80vh',
    positions: [
      { gridColumn: '1', gridRow: '1' },
      { gridColumn: '2', gridRow: '1' }
    ],
    previewHTML: `
      <div style="display:grid;grid-template-columns:1fr 2fr;gap:3px;width:100%;height:100%;">
        <div style="background:#666;"></div>
        <div style="background:#666;"></div>
      </div>
    `
  },
  'two-landscape': {
    name: '2 Photos: Equal Landscape',
    slots: 2,
    gridColumns: '1fr 1fr',
    gridRows: '500px',
    positions: [
      { gridColumn: '1', gridRow: '1' },
      { gridColumn: '2', gridRow: '1' }
    ],
    previewHTML: `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;width:100%;height:100%;">
        <div style="background:#666;"></div>
        <div style="background:#666;"></div>
      </div>
    `
  },
  'three-equal': {
    name: '3 Photos: Equal',
    slots: 3,
    gridColumns: 'repeat(3, 1fr)',
    gridRows: '100vh',
    positions: [
      { gridColumn: '1', gridRow: '1' },
      { gridColumn: '2', gridRow: '1' },
      { gridColumn: '3', gridRow: '1' }
    ],
    previewHTML: `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;width:100%;height:100%;">
        <div style="background:#666;"></div>
        <div style="background:#666;"></div>
        <div style="background:#666;"></div>
      </div>
    `
  },
  'three-portrait-33': {
    name: '3 Photos: Portrait Left (33%)',
    slots: 3,
    gridColumns: '33vw 1fr',
    gridRows: 'repeat(2, 50vh)',
    positions: [
      { gridColumn: '1', gridRow: '1 / 3' },
      { gridColumn: '2', gridRow: '1' },
      { gridColumn: '2', gridRow: '2' }
    ],
    previewHTML: `
      <div style="display:grid;grid-template-columns:1fr 2fr;grid-template-rows:repeat(2,1fr);gap:3px;width:100%;height:100%;">
        <div style="background:#444;grid-row:1/3;"></div>
        <div style="background:#666;"></div>
        <div style="background:#666;"></div>
      </div>
    `
  },
  'three-portrait-50': {
    name: '3 Photos: Portrait Left (50%)',
    slots: 3,
    gridColumns: '50vw 1fr',
    gridRows: 'repeat(2, 50vh)',
    positions: [
      { gridColumn: '1', gridRow: '1 / 3' },
      { gridColumn: '2', gridRow: '1' },
      { gridColumn: '2', gridRow: '2' }
    ],
    previewHTML: `
      <div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(2,1fr);gap:3px;width:100%;height:100%;">
        <div style="background:#444;grid-row:1/3;"></div>
        <div style="background:#666;"></div>
        <div style="background:#666;"></div>
      </div>
    `
  },
  'four-grid': {
    name: '4 Photos: 2×2 Grid',
    slots: 4,
    gridColumns: 'repeat(2, 1fr)',
    gridRows: 'repeat(2, 50vh)',
    positions: [
      { gridColumn: '1', gridRow: '1' },
      { gridColumn: '2', gridRow: '1' },
      { gridColumn: '1', gridRow: '2' },
      { gridColumn: '2', gridRow: '2' }
    ],
    previewHTML: `
      <div style="display:grid;grid-template-columns:repeat(2,1fr);grid-template-rows:repeat(2,1fr);gap:3px;width:100%;height:100%;">
        <div style="background:#666;"></div>
        <div style="background:#666;"></div>
        <div style="background:#666;"></div>
        <div style="background:#666;"></div>
      </div>
    `
  },
  'four-portrait-stack': {
    name: '4 Photos: Portrait + Stack',
    slots: 4,
    gridColumns: '33vw 1fr 1fr',
    gridRows: '40vh 20vh 20vh',
    positions: [
      { gridColumn: '1', gridRow: '1 / 4' },
      { gridColumn: '2 / 4', gridRow: '1' },
      { gridColumn: '2', gridRow: '2 / 4' },
      { gridColumn: '3', gridRow: '2 / 4' }
    ],
    previewHTML: `
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:2fr 1fr 1fr;gap:3px;width:100%;height:100%;">
        <div style="background:#444;grid-row:1/4;"></div>
        <div style="background:#666;grid-column:2/4;"></div>
        <div style="background:#666;"></div>
        <div style="background:#666;"></div>
      </div>
    `
  }
};

export const GalleryBlock = {
  type: 'gallery',
  title: 'Gallery (template-based)',

  defaults() {
    return {
      type: 'gallery',
      slotCount: 3, // 2, 3, or 4
      template: 'three-equal',
      media: [], // Array of {src, type: 'image'|'video', caption: '', focalPoint: 'center'}
      gapSize: 'medium', // 'none' | 'tight' | 'medium' | 'spacious'
      paddingTop: 'none', // 'none' | 'tight' | 'medium' | 'spacious'
      paddingBottom: 'none', // 'none' | 'tight' | 'medium' | 'spacious'
      bgColor: '#000000',
      captionStyle: { color: '#e5e5e5', size: '14' },
      expectedViewTime: null
    };
  },

  editor({ block }) {
    const b = block;
    const template = GALLERY_TEMPLATES[b.template || 'three-equal'];
    
    const gapSizes = [
      { value: 'none', label: 'None (0px) - Edge to edge' },
      { value: 'tight', label: 'Tight (15px)' },
      { value: 'medium', label: 'Medium (30px)' },
      { value: 'spacious', label: 'Spacious (50px)' }
    ];

    const paddingSizes = [
      { value: 'none', label: 'None (0px)' },
      { value: 'tight', label: 'Tight (15px)' },
      { value: 'medium', label: 'Medium (30px)' },
      { value: 'spacious', label: 'Spacious (50px)' }
    ];

    const focalPoints = ['top', 'center', 'bottom'];

    // Build media slots
    const mediaSlots = Array.from({ length: template.slots }, (_, i) => {
      const item = (b.media || [])[i] || { src: '', type: 'image', caption: '', focalPoint: 'center' };
      return `
        <div class="media-slot" data-slot="${i}">
          <div class="slot-header">
            <span class="slot-number">Slot ${i + 1}</span>
            ${item.src ? '<span class="slot-filled">✓</span>' : '<span class="slot-empty">○</span>'}
          </div>
          
          <div class="slot-controls">
            <label class="block text-xs mb-1">Media Path</label>
            <input 
              type="text" 
              data-slot-src="${i}"
              value="${item.src || ''}"
              placeholder="e.g., images/photo${i + 1}.jpg"
              class="w-full border rounded px-2 py-1 text-sm mb-2"
            />
            
            <div class="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label class="block text-xs mb-1">Type</label>
                <select data-slot-type="${i}" class="w-full border rounded px-2 py-1 text-xs">
                  <option value="image" ${item.type === 'image' ? 'selected' : ''}>Image</option>
                  <option value="video" ${item.type === 'video' ? 'selected' : ''}>Video</option>
                </select>
              </div>
              <div>
                <label class="block text-xs mb-1">Crop Focus</label>
                <select data-slot-focal="${i}" class="w-full border rounded px-2 py-1 text-xs">
                  ${focalPoints.map(fp => `<option value="${fp}" ${item.focalPoint === fp ? 'selected' : ''}>${fp}</option>`).join('')}
                </select>
              </div>
            </div>
            
            <label class="block text-xs mb-1">Caption (optional)</label>
            <input 
              type="text" 
              data-slot-caption="${i}"
              value="${item.caption || ''}"
              placeholder="Caption text..."
              class="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>
      `;
    }).join('');

    const labelFieldHtml = `
      <div class="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <label class="block text-sm font-semibold text-blue-900 mb-2">📝 Block Label (Optional)</label>
        <input type="text" data-k="label" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="e.g., Photo gallery..."
          value="${b.label || ''}" />
      </div>
    `;

    // Helper to create collapsible section
    const section = (title, content, collapsed = true) => {
      return '<div class="collapsible-section' + (collapsed ? ' collapsed' : '') + '">' +
        '<div class="collapsible-header">' +
          '<span>' + title + '</span>' +
          '<span class="collapsible-chevron">▼</span>' +
        '</div>' +
        '<div class="collapsible-content">' + content + '</div>' +
      '</div>';
    };

    // Get current slot count (from block or derive from template)
    const currentSlotCount = b.slotCount || template.slots;

    // Get templates for current slot count
    const templatesBySlotCount = {
      2: ['two-equal', 'two-ratio', 'two-ratio-reverse', 'two-landscape'],
      3: ['three-equal', 'three-portrait-33', 'three-portrait-50'],
      4: ['four-grid', 'four-portrait-stack']
    };
    const currentTemplates = templatesBySlotCount[currentSlotCount] || templatesBySlotCount[3];

    // Build template cards for current slot count
    const templateCards = currentTemplates.map(key => {
      const tmpl = GALLERY_TEMPLATES[key];
      const isSelected = b.template === key;
      return `
        <div class="template-card ${isSelected ? 'selected' : ''}" data-template="${key}">
          <div class="template-preview">${tmpl.previewHTML}</div>
          <div class="template-name">${tmpl.name}</div>
        </div>
      `;
    }).join('');

    // Block Settings content
    const blockSettingsContent = `
      <div class="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label class="block text-xs mb-1">Gap Size</label>
          <select data-k="gapSize" class="w-full border rounded px-2 py-1 text-sm">
            ${gapSizes.map(g => `<option value="${g.value}" ${b.gapSize === g.value ? 'selected' : ''}>${g.label}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block text-xs mb-1">Background</label>
          <input type="color" data-k="bgColor" value="${b.bgColor || '#000000'}" class="w-full h-8 border rounded">
        </div>
      </div>
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

    // Media section content
    const mediaContent = `
      <style>
        .template-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }
        .template-card {
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          padding: 6px;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
        }
        .template-card:hover {
          border-color: #3b82f6;
        }
        .template-card.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        .template-preview {
          width: 100%;
          height: 60px;
          margin-bottom: 4px;
          border-radius: 3px;
          overflow: hidden;
        }
        .template-name {
          font-size: 11px;
          font-weight: 600;
          color: #1f2937;
          text-align: center;
        }
        .media-slot {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 10px;
          margin-bottom: 10px;
          background: #f3f4f6;
        }
        .media-slot input,
        .media-slot select {
          background: white;
        }
        .slot-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1px solid #e5e7eb;
        }
        .slot-number {
          font-size: 11px;
          font-weight: 600;
          color: #374151;
        }
        .slot-filled { color: #10b981; font-size: 12px; }
        .slot-empty { color: #d1d5db; font-size: 12px; }
      </style>

      <div class="mb-3">
        <label class="block text-xs mb-1">Number of Slots</label>
        <select data-k="slotCount" class="gallery-slot-count w-full border rounded px-2 py-1 text-sm">
          <option value="2" ${currentSlotCount === 2 ? 'selected' : ''}>2 slots</option>
          <option value="3" ${currentSlotCount === 3 ? 'selected' : ''}>3 slots</option>
          <option value="4" ${currentSlotCount === 4 ? 'selected' : ''}>4 slots</option>
        </select>
      </div>

      <div class="mb-3">
        <label class="block text-xs mb-2">Choose Template</label>
        <div class="template-grid">
          ${templateCards}
        </div>
      </div>

      <div class="pt-3 border-t border-gray-200">
        <div class="text-xs font-semibold mb-2 text-gray-600">Media Slots (${template.slots})</div>
        ${mediaSlots}
      </div>

      <div class="pt-3 border-t border-gray-200 mt-3">
        <div class="text-xs font-semibold mb-2 text-gray-600">Caption Style</div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs mb-1">Text Color</label>
            <input type="color" data-k="captionStyle.color" value="${(b.captionStyle && b.captionStyle.color) || '#e5e5e5'}" class="w-full h-8 border rounded">
          </div>
          <div>
            <label class="block text-xs mb-1">Size (px)</label>
            <input type="number" data-k="captionStyle.size" min="10" max="24" value="${(b.captionStyle && b.captionStyle.size) || '14'}" class="w-full border rounded px-2 py-1 text-sm">
          </div>
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
    const template = GALLERY_TEMPLATES[b.template || 'three-equal'];
    
    const gapMap = { none: '0px', tight: '15px', medium: '30px', spacious: '50px' };
    const gap = gapMap[b.gapSize || 'medium'];
    
    const paddingMap = { none: '0', tight: '15px', medium: '30px', spacious: '50px' };
    const paddingTop = paddingMap[b.paddingTop || 'none'];
    const paddingBottom = paddingMap[b.paddingBottom || 'none'];

    let gridHtml = `<div style="display:grid;grid-template-columns:${template.gridColumns};grid-template-rows:${template.gridRows};gap:${gap};width:100%;height:auto;">`;

    const captionStyle = b.captionStyle || { color: '#e5e5e5', size: '14' };

    template.positions.forEach((pos, i) => {
      const item = (b.media || [])[i];
      if (!item || !item.src) {
        // Empty slot placeholder
        gridHtml += `<div style="grid-column:${pos.gridColumn};grid-row:${pos.gridRow};background:#1a1a1a;display:flex;align-items:center;justify-content:center;color:#666;font-size:14px;min-height:200px;">Slot ${i + 1}</div>`;
      } else {
        gridHtml += renderMediaItem(item, pos, i, project, captionStyle);
      }
    });

    gridHtml += '</div>';

    const fadeAttr = block._fadeOnScroll ? ' data-fade-scroll="true"' : '';
    return `<section class="fullbleed" style="background-color:${b.bgColor || '#000000'};padding-top:${paddingTop};padding-bottom:${paddingBottom};"${fadeAttr}>
      ${gridHtml}
    </section>`;
  },

  exportHTML({ block }) {
    const b = block;
    const template = GALLERY_TEMPLATES[b.template || 'three-equal'];
    
    const gapMap = { none: '0px', tight: '15px', medium: '30px', spacious: '50px' };
    const gap = gapMap[b.gapSize || 'medium'];
    
    const paddingMap = { none: '0', tight: '15px', medium: '30px', spacious: '50px' };
    const paddingTop = paddingMap[b.paddingTop || 'none'];
    const paddingBottom = paddingMap[b.paddingBottom || 'none'];

    const captionStyle = b.captionStyle || { color: '#e5e5e5', size: '14' };

    let gridHtml = `<div style="display:grid;grid-template-columns:${template.gridColumns};grid-template-rows:${template.gridRows};gap:${gap};width:100%;height:auto;">`;

    template.positions.forEach((pos, i) => {
      const item = (b.media || [])[i];
      if (item && item.src) {
        gridHtml += renderMediaItemExport(item, pos, i, captionStyle);
      }
    });

    gridHtml += '</div>';

    const fadeAttr = block._fadeOnScroll ? ' data-fade-scroll="true"' : '';
    return `<section class="fullbleed" style="background-color:${b.bgColor || '#000000'};padding-top:${paddingTop};padding-bottom:${paddingBottom};"${fadeAttr}>
      ${gridHtml}
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

// Helper: Render media item for preview
function renderMediaItem(item, position, index, project, captionStyle) {
  const isVideo = item.type === 'video';
  const src = resolvePreviewPath(item.src, project);

  const focalMap = {
    top: '50% 0%',
    center: '50% 50%',
    bottom: '50% 100%'
  };
  const objectPosition = focalMap[item.focalPoint || 'center'];

  let mediaTag = '';
  if (isVideo) {
    mediaTag = `<video autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover;object-position:${objectPosition};display:block;"><source src="${src}" type="video/mp4"></video>`;
  } else {
    mediaTag = `<img src="${src}" style="width:100%;height:100%;object-fit:cover;object-position:${objectPosition};display:block;" alt="">`;
  }

  const captionColor = (captionStyle && captionStyle.color) || '#e5e5e5';
  const captionSize = (captionStyle && captionStyle.size) || '14';
  const caption = item.caption ? `<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(0,0,0,0.8),transparent);color:${captionColor};font-size:${captionSize}px;padding:20px 12px 12px;text-align:center;">${item.caption}</div>` : '';

  return `<div style="grid-column:${position.gridColumn};grid-row:${position.gridRow};position:relative;overflow:hidden;min-height:200px;">${mediaTag}${caption}</div>`;
}

// Helper: Render media item for export
function renderMediaItemExport(item, position, index, captionStyle) {
  const isVideo = item.type === 'video';
  const src = resolveExportPath(item.src);

  const focalMap = {
    top: '50% 0%',
    center: '50% 50%',
    bottom: '50% 100%'
  };
  const objectPosition = focalMap[item.focalPoint || 'center'];

  const muteButtonSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" opacity="0.3" class="unmuted-path"/><line x1="2" y1="2" x2="22" y2="22" stroke="white" stroke-width="2" class="muted-line" style="display:none;"/></svg>';

  let mediaTag = '';
  let muteButton = '';
  if (isVideo) {
    const videoId = 'gallery-video-' + index + '-' + Math.random().toString(36).substr(2, 9);
    mediaTag = `<video id="${videoId}" autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover;object-position:${objectPosition};display:block;"><source src="${src}" type="video/mp4"></video>`;
    muteButton = `<button onclick="toggleMute('${videoId}', this)" class="mute-btn gallery-mute-btn" aria-label="Toggle mute">${muteButtonSvg}</button>`;
  } else {
    mediaTag = `<img src="${src}" style="width:100%;height:100%;object-fit:cover;object-position:${objectPosition};display:block;" alt="">`;
  }

  const captionColor = (captionStyle && captionStyle.color) || '#e5e5e5';
  const captionSize = (captionStyle && captionStyle.size) || '14';
  const caption = item.caption ? `<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(0,0,0,0.8),transparent);color:${captionColor};font-size:${captionSize}px;padding:20px 12px 12px;text-align:center;">${item.caption}</div>` : '';

  return `<div class="gallery-media-cell" style="grid-column:${position.gridColumn};grid-row:${position.gridRow};position:relative;overflow:hidden;min-height:200px;">${mediaTag}${muteButton}${caption}</div>`;
}