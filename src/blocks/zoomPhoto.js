// File: src/blocks/zoomPhoto.js
import { resolvePreviewPath, resolveExportPath } from '../utils.js';

export const ZoomPhotoBlock = {
  type: 'zoom-photo',
  title: 'Zoom on Photo',

  defaults() {
    return {
      type: 'zoom-photo',
      label: '',
      image: '',
      focusX: 0.5,
      focusY: 0.5,
      maxScale: 2.6,
      fadeIn: 0.18,
      fadeOut: 0.18,
      panelStart: 0.30,
      panelEnd: 0.72,
      activateAt: 0.35,
      spacerHeight: 100,
      spacerBg: '#000000',
      panel: {
        show: true,
        title: 'Section title',
        text: 'Contextual copy for the moment you zoom in.',
      },
      expectedViewTime: null,
    };
  },

  editor({ block }) {
    const b = block;

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

    // Block Label (always visible, not collapsible)
    const labelFieldHtml = `
      <div class="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <label class="block text-sm font-semibold text-blue-900 mb-2">📝 Block Label (Optional)</label>
        <input type="text" data-k="label" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="e.g., Close-up on subject..."
          value="${b.label || ''}" />
      </div>
    `;

    // Block Settings content
    const blockSettingsContent = `
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

    // Media content
    const mediaContent = `
      <div class="space-y-3 text-sm">
        <div>
          <label class="block text-xs mb-1 font-medium">Image</label>
          <input data-k="image" value="${b.image || ''}" class="w-full border rounded px-2 py-1 text-sm">
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs">
              Focus X (0–1)
              <span class="text-gray-400 cursor-help" title="0.5 = center, 0 = left, 1 = right">ⓘ</span>
            </label>
            <input data-k="focusX" type="number" step="0.01" min="0" max="1"
              value="${Number(b.focusX ?? 0.5)}" class="w-full border rounded px-2 py-1 text-sm">
          </div>
          <div>
            <label class="block text-xs">
              Focus Y (0–1)
              <span class="text-gray-400 cursor-help" title="0.5 = center, 0 = top, 1 = bottom">ⓘ</span>
            </label>
            <input data-k="focusY" type="number" step="0.01" min="0" max="1"
              value="${Number(b.focusY ?? 0.5)}" class="w-full border rounded px-2 py-1 text-sm">
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div>
            <label class="block text-xs">
              Max Scale
              <span class="text-gray-400 cursor-help" title="2.6 = default zoom level">ⓘ</span>
            </label>
            <input data-k="maxScale" type="number" step="0.1"
              value="${Number(b.maxScale || 2.6)}" class="w-full border rounded px-2 py-1 text-sm">
          </div>
          <div>
            <label class="block text-xs">
              Fade In
              <span class="text-gray-400 cursor-help" title="0.18 = 18% of scroll">ⓘ</span>
            </label>
            <input data-k="fadeIn" type="number" step="0.01" min="0" max="1"
              value="${Number(b.fadeIn || 0.18)}" class="w-full border rounded px-2 py-1 text-sm">
          </div>
          <div>
            <label class="block text-xs">
              Fade Out
              <span class="text-gray-400 cursor-help" title="0.18 = 18% of scroll">ⓘ</span>
            </label>
            <input data-k="fadeOut" type="number" step="0.01" min="0" max="1"
              value="${Number(b.fadeOut || 0.18)}" class="w-full border rounded px-2 py-1 text-sm">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs">
              Panel Start
              <span class="text-gray-400 cursor-help" title="When text panel appears">ⓘ</span>
            </label>
            <input data-k="panelStart" type="number" step="0.01" min="0" max="1"
              value="${Number(b.panelStart || 0.3)}" class="w-full border rounded px-2 py-1 text-sm">
          </div>
          <div>
            <label class="block text-xs">
              Panel End
              <span class="text-gray-400 cursor-help" title="When text panel disappears">ⓘ</span>
            </label>
            <input data-k="panelEnd" type="number" step="0.01" min="0" max="1"
              value="${Number(b.panelEnd || 0.72)}" class="w-full border rounded px-2 py-1 text-sm">
          </div>
        </div>

        <div class="p-2 border rounded bg-blue-50">
          <div class="text-xs font-semibold text-blue-900 mb-2">
            Leading Space
            <span class="text-blue-400 cursor-help font-normal" title="Prevents zoom from overlapping previous content">ⓘ</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs text-blue-700">Height (vh)</label>
              <input data-k="spacerHeight" type="number" step="10" min="0"
                value="${Number(b.spacerHeight || 100)}" class="w-full px-2 py-1 border rounded text-sm">
            </div>
            <div>
              <label class="block text-xs text-blue-700">Background</label>
              <input data-k="spacerBg" type="color"
                value="${b.spacerBg || '#000000'}" class="w-full h-8 border rounded">
            </div>
          </div>
        </div>

        <div class="p-2 border rounded bg-slate-50">
          <label class="flex items-center gap-2 mb-2">
            <input type="checkbox" data-k="panel.show" ${b.panel?.show ? 'checked' : ''}/>
            <span class="text-xs font-semibold">Show context panel</span>
          </label>
          <div class="space-y-2">
            <div>
              <label class="block text-xs">Panel Title</label>
              <input data-k="panel.title" value="${b.panel?.title || ''}" class="w-full border rounded px-2 py-1 text-sm">
            </div>
            <div>
              <label class="block text-xs">Panel Text</label>
              <textarea rows="2" data-k="panel.text" class="w-full border rounded px-2 py-1 text-sm">${b.panel?.text || ''}</textarea>
            </div>
          </div>
        </div>
      </div>
    `;

    // Assemble all sections
    return labelFieldHtml +
      section('⚙️ Block Settings', blockSettingsContent, true) +
      section('🖼️ Media', mediaContent, true);
  },

  preview({ block, project }) {
    const img = resolvePreviewPath(block.image, project);
    const altText = block.panel?.title || 'Zoom photo';
    const id = 'zoom-' + Math.random().toString(36).slice(2, 8);
    const fx = Number(block.focusX ?? 0.5);
    const fy = Number(block.focusY ?? 0.5);
    const spacerHeight = Number(block.spacerHeight || 100);
    const spacerBg = block.spacerBg || '#000000';

    return `
      <div class="sb-zoom-spacer" style="height: ${spacerHeight}vh; background: ${spacerBg};"></div>
      <section class="sb-zoomsec" id="${id}" style="background:${spacerBg};"
        data-scale-end="${Number(block.maxScale || 2.6)}"
        data-fade-in="${Number(block.fadeIn || 0.18)}"
        data-fade-out="${Number(block.fadeOut || 0.18)}"
        data-panel-start="${Number(block.panelStart || 0.3)}"
        data-panel-end="${Number(block.panelEnd || 0.72)}"
        data-focus-x="${fx}" data-focus-y="${fy}"
        data-activate-at="${Number(block.activateAt || 0.35)}">
        <div class="sb-zoom-pin">
          <img class="sb-zoom-photo" src="${img}" alt="${altText}">
          <div class="sb-zoom-vignette"></div>
          ${block.panel?.show
        ? `<div class="sb-zoom-panel">
                   ${block.panel?.title ? `<h3 class="m-0 font-semibold text-base">${block.panel.title}</h3>` : ''}
                   ${block.panel?.text ? `<p class="m-0 text-slate-200">${block.panel.text}</p>` : ''}
                 </div>`
        : ''
      }
        </div>
      </section>
    `;
  },

  exportHTML({ block }) {
    const img = resolveExportPath(block.image);
    const altText = block.panel?.title || 'Zoom photo';
    const id = 'zoom-' + Math.random().toString(36).slice(2, 8);
    const fx = Number(block.focusX ?? 0.5);
    const fy = Number(block.focusY ?? 0.5);
    const spacerHeight = Number(block.spacerHeight || 100);
    const spacerBg = block.spacerBg || '#000000';

    return `
      <div class="sb-zoom-spacer" style="position:relative;z-index:3;height: ${spacerHeight}vh; background: ${spacerBg};">
        <div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:100vw;height:100%;background:${spacerBg};z-index:0;"></div>
      </div>
      <section class="sb-zoomsec" id="${id}" style="position:relative;z-index:3;background:${spacerBg};"
        data-scale-end="${Number(block.maxScale || 2.6)}"
        data-fade-in="${Number(block.fadeIn || 0.18)}"
        data-fade-out="${Number(block.fadeOut || 0.18)}"
        data-panel-start="${Number(block.panelStart || 0.3)}"
        data-panel-end="${Number(block.panelEnd || 0.72)}"
        data-focus-x="${fx}" data-focus-y="${fy}"
        data-activate-at="${Number(block.activateAt || 0.35)}">
        <div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:100vw;height:100%;background:${spacerBg};z-index:0;"></div>
        <div class="sb-zoom-pin" style="position:relative;z-index:1;">
          <img class="sb-zoom-photo" src="${img}" alt="${altText}">
          <div class="sb-zoom-vignette"></div>
          ${block.panel?.show
        ? `<div class="sb-zoom-panel">
                   ${block.panel?.title ? `<h3 class="m-0 font-semibold text-base">${String(block.panel.title)}</h3>` : ''}
                   ${block.panel?.text ? `<p class="m-0" style="color:#ddd;">${String(block.panel.text)}</p>` : ''}
                 </div>`
        : ''
      }
        </div>
      </section>
    `;
  },

  set(block, key, value) {
    if (key.startsWith('panel.')) {
      block.panel = block.panel || {};
      const sub = key.split('.')[1];
      if (sub === 'show') block.panel.show = !!value;
      else block.panel[sub] = value;
    } else {
      block[key] = value;
    }
  },
};