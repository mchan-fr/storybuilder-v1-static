import { resolvePreviewPath, resolveExportPath, processBodyText, textToolbarHtml } from '../utils.js';

export const TextBlock = {
  type: 'text',
  title: 'Text only',

  defaults() {
    return {
      type: 'text',
      headline: '',
      headlineStyle: { size: '36', weight: 'bold', italic: false, color: '#111827', font: 'system-ui' },
      subhead: '',
      subheadStyle: { size: '24', weight: 'normal', italic: false, color: '#6b7280', font: 'system-ui' },
      text: 'Paragraph text…',
      textStyle: { size: '16', weight: 'normal', italic: false, color: '#374151', font: 'system-ui' },
      bgColor: '#ffffff',
      bgImage: '',
      bgOverlay: '0',
      width: 'medium',
      paddingTop: 'medium',
      paddingBottom: 'medium',
      inlineImage: '',
      inlineImagePosition: 'top',
      inlineImageWidth: 'medium',
      inlineImageCaption: '',
      expectedViewTime: null
    };
  },

  editor({ block }) {
    const b = block;
    const widthOpts = ['extra-narrow', 'narrow', 'medium', 'wide'];
    const padOpts = ['none', 'tiny', 'extra-small', 'small', 'medium', 'large'];
    const posOpts = ['top', 'middle', 'bottom'];
    const imgW = ['small', 'medium', 'large', 'full'];
    const fontFamilies = [
      'system-ui',
      'IBM Plex Sans, sans-serif',
      'Georgia, serif',
      'Times New Roman, serif',
      'Arial, sans-serif',
      'Helvetica, sans-serif',
      'Courier New, monospace',
      'Lora, Georgia, serif',
      'Montserrat, sans-serif'
    ];
    const weightOpts = ['normal', 'bold'];

    // Helper to get nested style values with fallbacks
    const getStyle = (styleObj, prop, fallback) => {
      return (styleObj && styleObj[prop]) || fallback;
    };

    const headlineStyle = b.headlineStyle || {};
    const subheadStyle = b.subheadStyle || {};
    const textStyle = b.textStyle || {};

    const labelFieldHtml = `
  <div class="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
    <label class="block text-sm font-semibold text-blue-900 mb-2">📝 Block Label (Optional)</label>
    <input type="text" data-k="label" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" 
      placeholder="e.g., Your examples here..." 
      value="${b.label || ''}" />
    <p class="text-xs text-blue-600 mt-2">💡 Give this block a memorable name</p>
  </div>
  <hr class="my-4 border-gray-300" />
`;

return labelFieldHtml + `

      <div class="p-3 mb-4 border-2 border-green-200 rounded-lg bg-green-50">
  <label class="block font-semibold text-green-900 mb-2">Headline</label>
  <input data-k="headline" value="${b.headline || ''}" class="w-full border rounded px-2 py-1 mb-2">
  
  <div class="p-2 border rounded bg-white">
    <div class="text-xs font-semibold mb-2 text-green-700">Headline Style</div>
          <div class="grid grid-cols-3 gap-2 mb-2">
            <div>
              <label class="block text-xs">Size (px)</label>
              <input data-k="headlineStyle.size" type="number" min="8" max="96" value="${getStyle(headlineStyle, 'size', '36')}" class="w-full border rounded px-2 py-1 text-sm">
            </div>
            <div>
              <label class="block text-xs">Weight</label>
              <select data-k="headlineStyle.weight" class="w-full border rounded px-2 py-1 text-xs">
                ${weightOpts.map(w => `<option ${getStyle(headlineStyle, 'weight', 'bold') === w ? 'selected' : ''} value="${w}">${w}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs">Color</label>
              <input type="color" data-k="headlineStyle.color" value="${getStyle(headlineStyle, 'color', '#111827')}" class="w-full h-8 border rounded">
            </div>
          </div>
          <div class="grid grid-cols-[1fr_auto] gap-2">
            <div>
              <label class="block text-xs">Font</label>
              <select data-k="headlineStyle.font" class="w-full border rounded px-2 py-1 text-xs">
                ${fontFamilies.map(f => `<option ${getStyle(headlineStyle, 'font', 'system-ui') === f ? 'selected' : ''} value="${f}">${f.split(',')[0]}</option>`).join('')}
              </select>
            </div>
            <div class="flex items-end">
              <label class="flex items-center gap-1 text-xs">
                <input type="checkbox" data-k="headlineStyle.italic" ${getStyle(headlineStyle, 'italic', false) ? 'checked' : ''}>
                <span>Italic</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="p-3 mb-4 border-2 border-purple-200 rounded-lg bg-purple-50">
        <label class="block font-semibold text-purple-900 mb-2">Subhead</label>
        <input data-k="subhead" value="${b.subhead || ''}" class="w-full border rounded px-2 py-1 mb-2">
        
        <div class="p-2 border rounded bg-white">
          <div class="text-xs font-semibold mb-2 text-purple-700">Subhead Style</div>
          <div class="text-xs font-semibold mb-2 text-purple-700">Subhead Style</div>
          <div class="grid grid-cols-3 gap-2 mb-2">
            <div>
              <label class="block text-xs">Size (px)</label>
              <input data-k="subheadStyle.size" type="number" min="8" max="72" value="${getStyle(subheadStyle, 'size', '24')}" class="w-full border rounded px-2 py-1 text-sm">
            </div>
            <div>
              <label class="block text-xs">Weight</label>
              <select data-k="subheadStyle.weight" class="w-full border rounded px-2 py-1 text-xs">
                ${weightOpts.map(w => `<option ${getStyle(subheadStyle, 'weight', 'normal') === w ? 'selected' : ''} value="${w}">${w}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs">Color</label>
              <input type="color" data-k="subheadStyle.color" value="${getStyle(subheadStyle, 'color', '#6b7280')}" class="w-full h-8 border rounded">
            </div>
          </div>
          <div class="grid grid-cols-[1fr_auto] gap-2">
            <div>
              <label class="block text-xs">Font</label>
              <select data-k="subheadStyle.font" class="w-full border rounded px-2 py-1 text-xs">
                ${fontFamilies.map(f => `<option ${getStyle(subheadStyle, 'font', 'system-ui') === f ? 'selected' : ''} value="${f}">${f.split(',')[0]}</option>`).join('')}
              </select>
            </div>
            <div class="flex items-end">
              <label class="flex items-center gap-1 text-xs">
                <input type="checkbox" data-k="subheadStyle.italic" ${getStyle(subheadStyle, 'italic', false) ? 'checked' : ''}>
                <span>Italic</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="p-3 mb-4 border-2 border-blue-200 rounded-lg bg-blue-50">
        <label class="block font-semibold text-blue-900 mb-2">Body Text</label>
        ${textToolbarHtml('text')}
        <textarea data-k="text" rows="8" class="w-full border rounded px-2 py-1 mb-2">${b.text || ''}</textarea>

        <div class="p-2 border rounded bg-white">
          <div class="text-xs font-semibold mb-2 text-blue-700">Body Text Style</div>
        <div class="grid grid-cols-3 gap-2 mb-2">
          <div>
            <label class="block text-xs">Size (px)</label>
            <input data-k="textStyle.size" type="number" min="8" max="48" value="${getStyle(textStyle, 'size', '16')}" class="w-full border rounded px-2 py-1 text-sm">
          </div>
          <div>
            <label class="block text-xs">Weight</label>
            <select data-k="textStyle.weight" class="w-full border rounded px-2 py-1 text-xs">
              ${weightOpts.map(w => `<option ${getStyle(textStyle, 'weight', 'normal') === w ? 'selected' : ''} value="${w}">${w}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-xs">Color</label>
            <input type="color" data-k="textStyle.color" value="${getStyle(textStyle, 'color', '#374151')}" class="w-full h-8 border rounded">
          </div>
        </div>
        <div class="grid grid-cols-[1fr_auto] gap-2">
          <div>
            <label class="block text-xs">Font</label>
            <select data-k="textStyle.font" class="w-full border rounded px-2 py-1 text-xs">
              ${fontFamilies.map(f => `<option ${getStyle(textStyle, 'font', 'system-ui') === f ? 'selected' : ''} value="${f}">${f.split(',')[0]}</option>`).join('')}
            </select>
          </div>
          <div class="flex items-end">
            <label class="flex items-center gap-1 text-xs">
              <input type="checkbox" data-k="textStyle.italic" ${getStyle(textStyle, 'italic', false) ? 'checked' : ''}>
              <span>Italic</span>
            </label>
          </div>
        </div>
      </div>

      <div class="mt-3 p-2 border rounded bg-slate-100">
        <div class="text-xs font-semibold mb-2">Text Layout</div>
        <label class="block text-xs">Text Width</label>
        <select data-k="width" class="w-full border rounded px-2 py-1 mb-2">
          ${widthOpts.map(w => `<option ${(b.width || 'medium') === w ? 'selected' : ''} value="${w}">${w}</option>`).join('')}
        </select>
        
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs">Padding Top</label>
            <select data-k="paddingTop" class="w-full border rounded px-2 py-1">
              ${padOpts.map(p => `<option ${(b.paddingTop || 'medium') === p ? 'selected' : ''} value="${p}">${p}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-xs">Padding Bottom</label>
            <select data-k="paddingBottom" class="w-full border rounded px-2 py-1">
              ${padOpts.map(p => `<option ${(b.paddingBottom || 'medium') === p ? 'selected' : ''} value="${p}">${p}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>

      <div class="mt-3 p-2 border rounded bg-slate-50">
        <div class="text-xs font-semibold mb-2">Inline Image</div>
        <label class="block text-sm">Image Path</label>
        <input data-k="inlineImage" value="${b.inlineImage || ''}" class="w-full border rounded px-2 py-1 mb-2">
        <div class="grid grid-cols-2 gap-2">
          <div><label class="block text-sm">Position</label>
            <select data-k="inlineImagePosition" class="w-full border rounded px-2 py-1">
              ${posOpts.map(p => `<option ${(b.inlineImagePosition || 'top') === p ? 'selected' : ''} value="${p}">${p}</option>`).join('')}
            </select></div>
          <div><label class="block text-sm">Width</label>
            <select data-k="inlineImageWidth" class="w-full border rounded px-2 py-1">
              ${imgW.map(w => `<option ${(b.inlineImageWidth || 'medium') === w ? 'selected' : ''} value="${w}">${w}</option>`).join('')}
            </select></div>
        </div>
        <label class="block text-sm mt-2">Caption</label>
        <input data-k="inlineImageCaption" value="${b.inlineImageCaption || ''}" class="w-full border rounded px-2 py-1">
      </div>

      <div class="mt-3 p-2 border rounded bg-slate-50">
        <div class="text-xs font-semibold mb-2">Background</div>
        <div class="grid grid-cols-2 gap-2">
          <div><label class="block text-sm">BG Color</label>
            <input type="color" data-k="bgColor" value="${b.bgColor || '#ffffff'}" class="w-full h-9 border rounded"></div>
          <div><label class="block text-sm">BG Overlay (0-1)</label>
            <input data-k="bgOverlay" type="number" min="0" max="1" step="0.1" value="${b.bgOverlay || '0'}" class="w-full border rounded px-2 py-1"></div>
        </div>
        <label class="block text-sm mt-2">BG Image</label>
        <input data-k="bgImage" value="${b.bgImage || ''}" class="w-full border rounded px-2 py-1 text-sm">
      </div>

      <div class="mt-3 p-2 border rounded bg-slate-50">

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
    const widthMap = {
      'extra-narrow': 'max-w-lg mx-auto',
      'narrow': 'max-w-2xl mx-auto',
      'medium': 'max-w-4xl mx-auto',
      'wide': 'max-w-6xl mx-auto'
    };
    const widthClass = widthMap[block.width || 'medium'];
    const pad = 'px-8';

    const paddingTopMap = {
  'none': 'pt-0',
  'tiny': 'pt-2',
  'extra-small': 'pt-4',
  'small': 'pt-8',
  'medium': 'pt-16',
  'large': 'pt-24'
};

const paddingBottomMap = {
  'none': 'pb-0',
  'tiny': 'pb-2',
  'extra-small': 'pb-4',
  'small': 'pb-8',
  'medium': 'pb-16',
  'large': 'pb-24'
};
    const pt = paddingTopMap[block.paddingTop || 'medium'];
    const pb = paddingBottomMap[block.paddingBottom || 'medium'];

    const bgColor = block.bgColor || '#ffffff';
    const hasBg = block.bgImage && block.bgImage.trim();
    const bgOverlay = parseFloat(block.bgOverlay || '0');
    let bgStyle = `background-color:${bgColor};`;
    let bgImageHtml = '';
    let overlayHtml = '';

    if (hasBg) {
      bgImageHtml = `<div class="absolute inset-0 bg-cover bg-center" style="background-image:url(${resolvePreviewPath(block.bgImage, project)});"></div>`;
      if (bgOverlay > 0) {
        overlayHtml = `<div class="absolute inset-0" style="background-color:rgba(0,0,0,${bgOverlay});"></div>`;
      }
    }

    // Helper to build style string from style object
    const buildStyle = (styleObj, fallbacks) => {
      const color = (styleObj && styleObj.color) || fallbacks.color;
      const size = (styleObj && styleObj.size) || fallbacks.size;
      const font = (styleObj && styleObj.font) || fallbacks.font;
      const weight = (styleObj && styleObj.weight) || fallbacks.weight;
      const italic = (styleObj && styleObj.italic) || false;
      const fontStyle = italic ? 'italic' : 'normal';
      const fontWeight = weight === 'bold' ? '700' : '400';
      return `color:${color};font-size:${size}px;font-family:${font};font-weight:${fontWeight};font-style:${fontStyle};`;
    };

    let headlineHtml = '';
    if (block.headline) {
      const style = buildStyle(block.headlineStyle, { color: '#111827', size: '36', font: 'system-ui', weight: 'bold' });
      headlineHtml = `<h2 class="text-left mb-4" style="${style}">${block.headline}</h2>`;
    }

    let subheadHtml = '';
    if (block.subhead) {
      const style = buildStyle(block.subheadStyle, { color: '#6b7280', size: '24', font: 'system-ui', weight: 'normal' });
      subheadHtml = `<h3 class="text-left mb-6" style="${style}">${block.subhead}</h3>`;
    }

    const widthMode = block.inlineImageWidth || 'medium';
    const wrapperClass = widthMode === 'large' ? 'breakout-large' : widthMode === 'full' ? 'fullbleed' : 'mx-auto';
    const imgWidthStyle = widthMode === 'small' ? 'max-width:24rem;' : widthMode === 'medium' ? 'max-width:40rem;' : '';

    let inlineImageHtml = '';
    if (block.inlineImage) {
      const caption = block.inlineImageCaption ? `<p class="text-sm text-slate-600 mt-2 text-center">${block.inlineImageCaption}</p>` : '';
      inlineImageHtml = `<div class="my-8 ${wrapperClass}" style="${imgWidthStyle}">
        <img src="${resolvePreviewPath(block.inlineImage, project)}" class="w-full rounded" alt="">${caption}</div>`;
    }

    const textShadow = hasBg && bgOverlay < .7 ? ' text-shadow' : '';
    const bodyStyle = buildStyle(block.textStyle, { color: '#374151', size: '16', font: 'system-ui', weight: 'normal' });
    const bodyHtml = `<div class="leading-relaxed${textShadow}" style="${bodyStyle}"><p>${processBodyText(block.text)}</p></div>`;

    const pos = block.inlineImagePosition || 'top';
    const content = pos === 'top' ? (headlineHtml + subheadHtml + inlineImageHtml + bodyHtml) : (headlineHtml + subheadHtml + bodyHtml + inlineImageHtml);

    const fadeAttr = block._fadeOnScroll ? ' data-fade-scroll="true"' : '';
    return `<section class="relative mb-6 ${pt} ${pb}"${fadeAttr} style="${bgStyle}">
  ${bgImageHtml}${overlayHtml}<div class="relative z-10 ${pad} ${widthClass}">${content}</div></section>`;
  },

  exportHTML({ block }) {
    const widthMap = {
      'extra-narrow': 'max-w-lg mx-auto',
      'narrow': 'max-w-2xl mx-auto',
      'medium': 'max-w-4xl mx-auto',
      'wide': 'max-w-6xl mx-auto'
    };
    const widthClass = widthMap[block.width || 'medium'];
    const pad = 'px-8';

    const paddingTopMap = {
  'none': 'pt-0',
  'tiny': 'pt-2',
  'extra-small': 'pt-4',
  'small': 'pt-8',
  'medium': 'pt-16',
  'large': 'pt-24'
};

const paddingBottomMap = {
  'none': 'pb-0',
  'tiny': 'pb-2',
  'extra-small': 'pb-4',
  'small': 'pb-8',
  'medium': 'pb-16',
  'large': 'pb-24'
};
    const pt = paddingTopMap[block.paddingTop || 'medium'];
    const pb = paddingBottomMap[block.paddingBottom || 'medium'];

    const bgColor = block.bgColor || '#ffffff';
    const hasBg = block.bgImage && block.bgImage.trim();
    const bgOverlay = parseFloat(block.bgOverlay || '0');
    let bgStyle = `background-color:${bgColor};`;
    let bgImageHtml = '';
    let overlayHtml = '';

    if (hasBg) {
      bgImageHtml = `<div class="absolute inset-0 bg-cover bg-center" style="background-image:url(${resolveExportPath(block.bgImage)});"></div>`;
      if (bgOverlay > 0) {
        overlayHtml = `<div class="absolute inset-0" style="background-color:rgba(0,0,0,${bgOverlay});"></div>`;
      }
    }

    const buildStyle = (styleObj, fallbacks) => {
      const color = (styleObj && styleObj.color) || fallbacks.color;
      const size = (styleObj && styleObj.size) || fallbacks.size;
      const font = (styleObj && styleObj.font) || fallbacks.font;
      const weight = (styleObj && styleObj.weight) || fallbacks.weight;
      const italic = (styleObj && styleObj.italic) || false;
      const fontStyle = italic ? 'italic' : 'normal';
      const fontWeight = weight === 'semibold' ? '600' : weight === 'bold' ? '700' : '400';
      return `color:${color};font-size:${size}px;font-family:${font};font-weight:${fontWeight};font-style:${fontStyle};`;
    };

    let headlineHtml = '';
    if (block.headline) {
      const style = buildStyle(block.headlineStyle, { color: '#111827', size: '36', font: 'system-ui', weight: 'bold' });
      headlineHtml = `<h2 class="text-left mb-4" style="${style}">${String(block.headline)}</h2>`;
    }

    let subheadHtml = '';
    if (block.subhead) {
      const style = buildStyle(block.subheadStyle, { color: '#6b7280', size: '24', font: 'system-ui', weight: 'normal' });
      subheadHtml = `<h3 class="text-left mb-6" style="${style}">${String(block.subhead)}</h3>`;
    }

    const widthMode = block.inlineImageWidth || 'medium';
    const breakoutClass = widthMode === 'large' ? 'breakout-large' : widthMode === 'full' ? 'fullbleed' : '';
    const imgWidthStyle = widthMode === 'small' ? 'max-width:24rem;' : widthMode === 'medium' ? 'max-width:40rem;' : '';

    let inlineImageHtml = '';
    if (block.inlineImage) {
      const cap = block.inlineImageCaption ? `<p class="text-sm text-slate-600 mt-2 text-center">${String(block.inlineImageCaption)}</p>` : '';
      inlineImageHtml = `<div class="my-8 mx-auto ${breakoutClass}" style="${imgWidthStyle}">
        <img src="${resolveExportPath(block.inlineImage)}" class="w-full rounded" alt="">${cap}</div>`;
    }

    const textShadow = hasBg && bgOverlay < .7 ? ' text-shadow' : '';
    const bodyStyle = buildStyle(block.textStyle, { color: '#374151', size: '16', font: 'system-ui', weight: 'normal' });
    const bodyHtml = `<div class="leading-relaxed${textShadow}" style="${bodyStyle}"><p>${processBodyText(block.text, { brTag: '<br/>' })}</p></div>`;

    const pos = block.inlineImagePosition || 'top';
    const content = pos === 'top' ? (headlineHtml + subheadHtml + inlineImageHtml + bodyHtml) : (headlineHtml + subheadHtml + bodyHtml + inlineImageHtml);

    const fadeAttr = block._fadeOnScroll ? ' data-fade-scroll="true"' : '';
    return `<section class="relative ${pt} ${pb}"${fadeAttr} style="${bgStyle}">
  ${bgImageHtml}${overlayHtml}<div class="relative z-10 ${pad} ${widthClass}">${content}</div></section>`;
  },

  set(block, key, value) {
    // Handle nested properties like headlineStyle.size
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      if (!block[parent]) block[parent] = {};
      block[parent][child] = value;
    } else {
      block[key] = value;
    }
  }
};