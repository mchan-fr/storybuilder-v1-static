import { resolvePreviewPath, resolveExportPath, processBodyText, textToolbarHtml } from '../utils.js';

export const SplitLayoutBlock = {
  type: 'split-layout',
  title: 'Split Layout (vertical image + text panel)',

  defaults() {
    return {
      type: 'split-layout',
      image: '',
      video: '',
      imageSide: 'right',
      textPanelWidth: '33',
      textPanelColor: '#000000',
      contentWidth: 'medium',
      positionVertical: 'center',
      offsetVertical: 0,
      offsetHorizontal: 0,
      paddingTop: 'none',
      paddingBottom: 'none',
      headline: 'Split Layout Headline',
      headlineStyle: { size: '48', weight: 'bold', italic: false, color: '#ffffff', font: 'system-ui', leading: '1.2' },
      deck: '',
      deckStyle: { size: '20', weight: 'normal', italic: false, color: '#ffffff', font: 'system-ui' },
      subhead: '',
      subheadStyle: { size: '24', weight: 'normal', italic: false, color: '#d1d5db', font: 'system-ui' },
      text: '',
      textStyle: { size: '18', weight: 'normal', italic: false, color: '#ffffff', font: 'system-ui', leading: '1.7' },
      expectedViewTime: null
    };
  },

  editor({ block }) {
    const b = block;
    const posV = ['top', 'center', 'bottom'];
    const sideOpts = ['left', 'right'];
    const widthOpts = ['25', '33', '40', '50'];
    const contentWidthOpts = ['extra-narrow', 'narrow', 'medium', 'wide'];
    const weightOpts = ['normal', 'bold'];
    const paddingSizes = [
      { value: 'none', label: 'None (0px)' },
      { value: 'tight', label: 'Tight (15px)' },
      { value: 'medium', label: 'Medium (30px)' },
      { value: 'spacious', label: 'Spacious (50px)' }
    ];
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
    const subheadStyle = b.subheadStyle || {};
    const textStyle = b.textStyle || {};

    const labelFieldHtml = 
      '<div class="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">' +
        '<label class="block text-sm font-semibold text-blue-900 mb-2">📝 Block Label (Optional)</label>' +
        '<input type="text" data-k="label" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" ' +
          'placeholder="e.g., Mountain intro..." ' +
          'value="' + (b.label || '') + '" />' +
        '<p class="text-xs text-blue-600 mt-2">💡 Give this block a memorable name</p>' +
      '</div>' +
      '<hr class="my-4 border-gray-300" />';

    return labelFieldHtml +
      '<label class="block font-medium">Image</label>' +
      '<input data-k="image" value="' + (b.image || '') + '" class="w-full border rounded px-2 py-1 mb-3">' +
      
      '<label class="block font-medium">Video (optional)</label>' +
      '<input data-k="video" value="' + (b.video || '') + '" class="w-full border rounded px-2 py-1 mb-3">' +

      '<div class="mt-3 p-2 border rounded bg-slate-100">' +
        '<div class="text-xs font-semibold mb-2">Layout</div>' +
        '<div class="grid grid-cols-2 gap-2 mb-2">' +
          '<div>' +
            '<label class="block text-xs">Image Side</label>' +
            '<select data-k="imageSide" class="w-full border rounded px-2 py-1">' +
              sideOpts.map(s => '<option ' + ((b.imageSide || 'right') === s ? 'selected' : '') + ' value="' + s + '">' + s + '</option>').join('') +
            '</select>' +
          '</div>' +
          '<div>' +
            '<label class="block text-xs">Text Panel Width (%)</label>' +
            '<select data-k="textPanelWidth" class="w-full border rounded px-2 py-1">' +
              widthOpts.map(w => '<option ' + ((b.textPanelWidth || '33') === w ? 'selected' : '') + ' value="' + w + '">' + w + '%</option>').join('') +
            '</select>' +
          '</div>' +
        '</div>' +
        '<label class="block text-xs">Text Panel Color</label>' +
        '<input type="color" data-k="textPanelColor" value="' + (b.textPanelColor || '#000000') + '" class="w-full h-9 border rounded">' +
      '</div>' +

      '<div class="grid grid-cols-2 gap-3 mt-3 mb-3">' +
        '<div>' +
          '<label class="block font-semibold mb-2">Padding Top</label>' +
          '<select data-k="paddingTop" class="w-full border rounded px-3 py-2">' +
            paddingSizes.map(p => '<option value="' + p.value + '" ' + ((b.paddingTop || 'none') === p.value ? 'selected' : '') + '>' + p.label + '</option>').join('') +
          '</select>' +
        '</div>' +
        '<div>' +
          '<label class="block font-semibold mb-2">Padding Bottom</label>' +
          '<select data-k="paddingBottom" class="w-full border rounded px-3 py-2">' +
            paddingSizes.map(p => '<option value="' + p.value + '" ' + ((b.paddingBottom || 'none') === p.value ? 'selected' : '') + '>' + p.label + '</option>').join('') +
          '</select>' +
        '</div>' +
      '</div>' +

      '<div class="mt-3 p-2 border rounded bg-slate-100">' +
        '<div class="text-xs font-semibold mb-2">Text Position</div>' +
        '<div class="grid grid-cols-1 gap-2 mb-2">' +
          '<div>' +
            '<label class="block text-xs">Vertical</label>' +
            '<select data-k="positionVertical" class="w-full border rounded px-2 py-1">' +
              posV.map(p => '<option ' + ((b.positionVertical || 'center') === p ? 'selected' : '') + ' value="' + p + '">' + p + '</option>').join('') +
            '</select>' +
          '</div>' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-2">' +
          '<div>' +
            '<label class="block text-xs">Vertical Offset (px)</label>' +
            '<input data-k="offsetVertical" type="range" min="-100" max="100" value="' + (b.offsetVertical || 0) + '" class="w-full">' +
            '<div class="text-xs text-center text-slate-600">' + (b.offsetVertical || 0) + 'px</div>' +
          '</div>' +
          '<div>' +
            '<label class="block text-xs">Horizontal Offset (px)</label>' +
            '<input data-k="offsetHorizontal" type="range" min="-100" max="100" value="' + (b.offsetHorizontal || 0) + '" class="w-full">' +
            '<div class="text-xs text-center text-slate-600">' + (b.offsetHorizontal || 0) + 'px</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="p-3 mb-4 mt-4 border-2 border-amber-200 rounded-lg bg-amber-50">' +
        '<label class="block font-semibold text-amber-900 mb-2">Headline</label>' +
        '<textarea data-k="headline" rows="2" class="w-full border rounded px-2 py-1 mb-2">' + (b.headline || '') + '</textarea>' +
        
        '<div class="p-2 border rounded bg-white">' +
          '<div class="text-xs font-semibold mb-2 text-amber-700">Headline Style</div>' +
          '<div class="grid grid-cols-3 gap-2 mb-2">' +
            '<div>' +
              '<label class="block text-xs">Size (px)</label>' +
              '<input data-k="headlineStyle.size" type="number" min="12" max="120" value="' + getStyle(headlineStyle, 'size', '48') + '" class="w-full border rounded px-2 py-1 text-sm">' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Weight</label>' +
              '<select data-k="headlineStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' +
                weightOpts.map(w => '<option ' + (getStyle(headlineStyle, 'weight', 'bold') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
              '</select>' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Color</label>' +
              '<input type="color" data-k="headlineStyle.color" value="' + getStyle(headlineStyle, 'color', '#ffffff') + '" class="w-full h-8 border rounded">' +
            '</div>' +
          '</div>' +
          '<div class="grid grid-cols-[1fr_auto] gap-2 mb-2">' +
            '<div>' +
              '<label class="block text-xs">Font</label>' +
              '<select data-k="headlineStyle.font" class="w-full border rounded px-2 py-1 text-xs">' +
                fontFamilies.map(f => '<option ' + (getStyle(headlineStyle, 'font', 'system-ui') === f ? 'selected' : '') + ' value="' + f + '">' + f.split(',')[0] + '</option>').join('') +
              '</select>' +
            '</div>' +
            '<div class="flex items-end">' +
              '<label class="flex items-center gap-1 text-xs">' +
                '<input type="checkbox" data-k="headlineStyle.italic" ' + (getStyle(headlineStyle, 'italic', false) ? 'checked' : '') + '>' +
                '<span>Italic</span>' +
              '</label>' +
            '</div>' +
          '</div>' +
          '<div class="mb-2">' +
            '<label class="block text-xs">Line Height (Leading)</label>' +
            '<input data-k="headlineStyle.leading" type="range" min="0.8" max="2.0" step="0.05" value="' + getStyle(headlineStyle, 'leading', '1.2') + '" class="w-full">' +
            '<div class="text-xs text-center text-slate-600">' + getStyle(headlineStyle, 'leading', '1.2') + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="p-3 mb-4 border-2 border-orange-200 rounded-lg bg-orange-50">' +
        '<label class="block font-semibold text-orange-900 mb-2">Deck (optional)</label>' +
        '<textarea data-k="deck" rows="2" class="w-full border rounded px-2 py-1 mb-2">' + (b.deck || '') + '</textarea>' +
        
        '<div class="p-2 border rounded bg-white">' +
          '<div class="text-xs font-semibold mb-2 text-orange-700">Deck Style</div>' +
          '<div class="grid grid-cols-3 gap-2 mb-2">' +
            '<div>' +
              '<label class="block text-xs">Size (px)</label>' +
              '<input data-k="deckStyle.size" type="number" min="12" max="72" value="' + getStyle(deckStyle, 'size', '20') + '" class="w-full border rounded px-2 py-1 text-sm">' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Weight</label>' +
              '<select data-k="deckStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' +
                weightOpts.map(w => '<option ' + (getStyle(deckStyle, 'weight', 'normal') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
              '</select>' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Color</label>' +
              '<input type="color" data-k="deckStyle.color" value="' + getStyle(deckStyle, 'color', '#ffffff') + '" class="w-full h-8 border rounded">' +
            '</div>' +
          '</div>' +
          '<div class="grid grid-cols-[1fr_auto] gap-2">' +
            '<div>' +
              '<label class="block text-xs">Font</label>' +
              '<select data-k="deckStyle.font" class="w-full border rounded px-2 py-1 text-xs">' +
                fontFamilies.map(f => '<option ' + (getStyle(deckStyle, 'font', 'system-ui') === f ? 'selected' : '') + ' value="' + f + '">' + f.split(',')[0] + '</option>').join('') +
              '</select>' +
            '</div>' +
            '<div class="flex items-end">' +
              '<label class="flex items-center gap-1 text-xs">' +
                '<input type="checkbox" data-k="deckStyle.italic" ' + (getStyle(deckStyle, 'italic', false) ? 'checked' : '') + '>' +
                '<span>Italic</span>' +
              '</label>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="p-3 mb-4 border-2 border-purple-200 rounded-lg bg-purple-50">' +
        '<label class="block font-semibold text-purple-900 mb-2">Subhead (optional)</label>' +
        '<input data-k="subhead" value="' + (b.subhead || '') + '" class="w-full border rounded px-2 py-1 mb-2">' +
        '<p class="text-xs text-purple-700 mb-2">For content slides (not hero mode)</p>' +
        
        '<div class="p-2 border rounded bg-white">' +
          '<div class="text-xs font-semibold mb-2 text-purple-700">Subhead Style</div>' +
          '<div class="grid grid-cols-3 gap-2 mb-2">' +
            '<div>' +
              '<label class="block text-xs">Size (px)</label>' +
              '<input data-k="subheadStyle.size" type="number" min="8" max="72" value="' + getStyle(subheadStyle, 'size', '24') + '" class="w-full border rounded px-2 py-1 text-sm">' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Weight</label>' +
              '<select data-k="subheadStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' +
                weightOpts.map(w => '<option ' + (getStyle(subheadStyle, 'weight', 'normal') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
              '</select>' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Color</label>' +
              '<input type="color" data-k="subheadStyle.color" value="' + getStyle(subheadStyle, 'color', '#d1d5db') + '" class="w-full h-8 border rounded">' +
            '</div>' +
          '</div>' +
          '<div class="grid grid-cols-[1fr_auto] gap-2">' +
            '<div>' +
              '<label class="block text-xs">Font</label>' +
              '<select data-k="subheadStyle.font" class="w-full border rounded px-2 py-1 text-xs">' +
                fontFamilies.map(f => '<option ' + (getStyle(subheadStyle, 'font', 'system-ui') === f ? 'selected' : '') + ' value="' + f + '">' + f.split(',')[0] + '</option>').join('') +
              '</select>' +
            '</div>' +
            '<div class="flex items-end">' +
              '<label class="flex items-center gap-1 text-xs">' +
                '<input type="checkbox" data-k="subheadStyle.italic" ' + (getStyle(subheadStyle, 'italic', false) ? 'checked' : '') + '>' +
                '<span>Italic</span>' +
              '</label>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="p-3 mb-4 border-2 border-blue-200 rounded-lg bg-blue-50">' +
        '<label class="block font-semibold text-blue-900 mb-2">Body Text (optional)</label>' +
        textToolbarHtml('text') +
        '<textarea data-k="text" rows="8" class="w-full border rounded px-2 py-1 mb-2">' + (b.text || '') + '</textarea>' +
        '<p class="text-xs text-blue-700 mb-2">For content slides (not hero mode)</p>' +

        '<div class="p-2 border rounded bg-white mb-2">' +
          '<div class="text-xs font-semibold mb-2 text-blue-700">Content Width (applies to subhead + body)</div>' +
          '<select data-k="contentWidth" class="w-full border rounded px-2 py-1">' +
            contentWidthOpts.map(w => '<option ' + ((b.contentWidth || 'medium') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
          '</select>' +
        '</div>' +

        '<div class="p-2 border rounded bg-white">' +
          '<div class="text-xs font-semibold mb-2 text-blue-700">Body Text Style</div>' +
          '<div class="grid grid-cols-3 gap-2 mb-2">' +
            '<div>' +
              '<label class="block text-xs">Size (px)</label>' +
              '<input data-k="textStyle.size" type="number" min="8" max="48" value="' + getStyle(textStyle, 'size', '18') + '" class="w-full border rounded px-2 py-1 text-sm">' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Weight</label>' +
              '<select data-k="textStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' +
                weightOpts.map(w => '<option ' + (getStyle(textStyle, 'weight', 'normal') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
              '</select>' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Color</label>' +
              '<input type="color" data-k="textStyle.color" value="' + getStyle(textStyle, 'color', '#ffffff') + '" class="w-full h-8 border rounded">' +
            '</div>' +
          '</div>' +
          '<div class="grid grid-cols-[1fr_auto] gap-2 mb-2">' +
            '<div>' +
              '<label class="block text-xs">Font</label>' +
              '<select data-k="textStyle.font" class="w-full border rounded px-2 py-1 text-xs">' +
                fontFamilies.map(f => '<option ' + (getStyle(textStyle, 'font', 'system-ui') === f ? 'selected' : '') + ' value="' + f + '">' + f.split(',')[0] + '</option>').join('') +
              '</select>' +
            '</div>' +
            '<div class="flex items-end">' +
              '<label class="flex items-center gap-1 text-xs">' +
                '<input type="checkbox" data-k="textStyle.italic" ' + (getStyle(textStyle, 'italic', false) ? 'checked' : '') + '>' +
                '<span>Italic</span>' +
              '</label>' +
            '</div>' +
          '</div>' +
          '<div class="mb-2">' +
            '<label class="block text-xs">Line Height (Leading)</label>' +
            '<input data-k="textStyle.leading" type="range" min="1.0" max="2.5" step="0.1" value="' + getStyle(textStyle, 'leading', '1.7') + '" class="w-full">' +
            '<div class="text-xs text-center text-slate-600">' + getStyle(textStyle, 'leading', '1.7') + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="mt-4 p-3 border-2 border-teal-200 rounded-lg bg-teal-50">' +
        '<label class="block text-sm font-semibold text-teal-900 mb-2">⏱️ Expected View Time (seconds)</label>' +
        '<input type="number" data-k="expectedViewTime" min="1" max="300" step="1" ' +
          'value="' + (b.expectedViewTime || '') + '" ' +
          'placeholder="Auto-calculated if empty" ' +
          'class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />' +
        '<p class="text-xs text-teal-600 mt-2">Override the auto-calculated time for analytics. Leave empty to use default.</p>' +
      '</div>';
  },

  preview({ block, project }) {
    const bg = block.video
      ? '<video class="absolute inset-0 w-full h-full object-cover" autoplay muted loop playsinline src="' + resolvePreviewPath(block.video, project) + '"></video>'
      : '<img class="absolute inset-0 w-full h-full object-cover" src="' + resolvePreviewPath(block.image, project) + '" alt="">';

    const contentWidthMap = {
      'extra-narrow': 'max-w-md',
      'narrow': 'max-w-lg',
      'medium': 'max-w-4xl',
      'wide': 'max-w-6xl'
    };

    const buildStyle = (styleObj, fallbacks) => {
      const color = (styleObj && styleObj.color) || fallbacks.color;
      const size = (styleObj && styleObj.size) || fallbacks.size;
      const font = (styleObj && styleObj.font) || fallbacks.font;
      const weight = (styleObj && styleObj.weight) || fallbacks.weight;
      const italic = (styleObj && styleObj.italic) || false;
      const leading = (styleObj && styleObj.leading) || fallbacks.leading || '1.2';
      const fontStyle = italic ? 'italic' : 'normal';
      const fontWeight = weight === 'bold' ? '700' : '400';
      return 'color:' + color + ';font-size:' + size + 'px;font-family:' + font + ';font-weight:' + fontWeight + ';font-style:' + fontStyle + ';line-height:' + leading + ';';
    };

    const headline = buildStyle(block.headlineStyle, { color: '#ffffff', size: '48', font: 'system-ui', weight: 'bold', leading: '1.2' });
    const deck = buildStyle(block.deckStyle, { color: '#ffffff', size: '20', font: 'system-ui', weight: 'normal' });
    const subhead = buildStyle(block.subheadStyle, { color: '#d1d5db', size: '24', font: 'system-ui', weight: 'normal' });
    const textStyle = buildStyle(block.textStyle, { color: '#ffffff', size: '18', font: 'system-ui', weight: 'normal', leading: '1.7' });

    const posV = block.positionVertical || 'center';
    const offsetV = block.offsetVertical || 0;
    const offsetH = block.offsetHorizontal || 0;

    const vertClass = posV === 'top' ? 'justify-start pt-20' : (posV === 'bottom' ? 'justify-end pb-20' : 'justify-center');
    const offsetStyle = 'transform:translate(' + offsetH + 'px,' + offsetV + 'px);';

    const textPanelWidth = block.textPanelWidth || '33';
    const imageSide = block.imageSide || 'right';
    const textPanelColor = block.textPanelColor || '#000000';
    const contentWidthClass = contentWidthMap[block.contentWidth || 'medium'];

    const paddingMap = { none: '0', tight: '15px', medium: '30px', spacious: '50px' };
    const paddingTop = paddingMap[block.paddingTop || 'none'];
    const paddingBottom = paddingMap[block.paddingBottom || 'none'];

    let contentHtml = '<h1 style="' + headline + '">' + processBodyText(block.headline || '') + '</h1>';

    if (block.deck) {
      contentHtml += '<div class="mt-3" style="' + deck + '">' + processBodyText(block.deck || '') + '</div>';
    }

    if (block.subhead || block.text) {
      contentHtml += '<div class="' + contentWidthClass + '">';

      if (block.subhead) {
        contentHtml += '<h2 class="mt-6" style="' + subhead + '">' + processBodyText(block.subhead || '') + '</h2>';
      }

      if (block.text) {
        contentHtml += '<div class="mt-4" style="' + textStyle + '"><p>' + processBodyText(block.text || '') + '</p></div>';
      }

      contentHtml += '</div>';
    }

    const textPanel = '<div class="flex flex-col ' + vertClass + ' items-center p-12" style="width:' + textPanelWidth + '%;background-color:' + textPanelColor + ';">' +
      '<div style="' + offsetStyle + '">' + contentHtml + '</div></div>';

    const imagePanel = '<div class="relative" style="width:' + (100 - parseInt(textPanelWidth)) + '%;height:100vh;">' + bg + '</div>';

    const layout = imageSide === 'right' 
      ? textPanel + imagePanel
      : imagePanel + textPanel;

    const fadeAttr = block._fadeOnScroll ? ' data-fade-scroll="true"' : '';

    return '<section class="relative fullbleed mb-6 overflow-hidden flex" style="height:100vh;padding-top:' + paddingTop + ';padding-bottom:' + paddingBottom + ';"' + fadeAttr + '>' + layout + '</section>';
  },

  exportHTML({ block }) {
    const bg = block.video
      ? '<video class="media" autoplay muted loop playsinline src="' + resolveExportPath(block.video) + '"></video>'
      : '<img class="media" src="' + resolveExportPath(block.image) + '" alt="">';

    const contentWidthMap = {
      'extra-narrow': 'max-w-md',
      'narrow': 'max-w-lg',
      'medium': 'max-w-4xl',
      'wide': 'max-w-6xl'
    };

    const buildStyle = (styleObj, fallbacks) => {
      const color = (styleObj && styleObj.color) || fallbacks.color;
      const size = (styleObj && styleObj.size) || fallbacks.size;
      const font = (styleObj && styleObj.font) || fallbacks.font;
      const weight = (styleObj && styleObj.weight) || fallbacks.weight;
      const italic = (styleObj && styleObj.italic) || false;
      const leading = (styleObj && styleObj.leading) || fallbacks.leading || '1.2';
      const fontStyle = italic ? 'italic' : 'normal';
      const fontWeight = weight === 'bold' ? '700' : '400';
      return 'color:' + color + ';font-size:' + size + 'px;font-family:' + font + ';font-weight:' + fontWeight + ';font-style:' + fontStyle + ';line-height:' + leading + ';text-shadow:0 2px 8px rgba(0,0,0,0.55);';
    };

    const headline = buildStyle(block.headlineStyle, { color: '#ffffff', size: '48', font: 'system-ui', weight: 'bold', leading: '1.2' });
    const deck = buildStyle(block.deckStyle, { color: '#ffffff', size: '20', font: 'system-ui', weight: 'normal' });
    const subhead = buildStyle(block.subheadStyle, { color: '#d1d5db', size: '24', font: 'system-ui', weight: 'normal' });
    const textStyle = buildStyle(block.textStyle, { color: '#ffffff', size: '18', font: 'system-ui', weight: 'normal', leading: '1.7' });

    const posV = block.positionVertical || 'center';
    const offsetV = block.offsetVertical || 0;
    const offsetH = block.offsetHorizontal || 0;

    const vertClass = posV === 'top' ? 'justify-start pt-20' : (posV === 'bottom' ? 'justify-end pb-20' : 'justify-center');
    const offsetStyle = 'transform:translate(' + offsetH + 'px,' + offsetV + 'px);';

    const textPanelWidth = block.textPanelWidth || '33';
    const imageSide = block.imageSide || 'right';
    const textPanelColor = block.textPanelColor || '#000000';
    const contentWidthClass = contentWidthMap[block.contentWidth || 'medium'];

    const paddingMap = { none: '0', tight: '15px', medium: '30px', spacious: '50px' };
    const paddingTop = paddingMap[block.paddingTop || 'none'];
    const paddingBottom = paddingMap[block.paddingBottom || 'none'];

    let contentHtml = '<h1 style="' + headline + '">' + processBodyText(block.headline || '', { brTag: '<br/>' }) + '</h1>';

    if (block.deck) {
      contentHtml += '<div class="mt-3" style="' + deck + '">' + processBodyText(block.deck || '', { brTag: '<br/>' }) + '</div>';
    }

    if (block.subhead || block.text) {
      contentHtml += '<div class="' + contentWidthClass + '">';

      if (block.subhead) {
        contentHtml += '<h2 class="mt-6" style="' + subhead + '">' + processBodyText(block.subhead || '', { brTag: '<br/>' }) + '</h2>';
      }

      if (block.text) {
        contentHtml += '<div class="mt-4" style="' + textStyle + '"><p>' + processBodyText(block.text || '', { brTag: '<br/>' }) + '</p></div>';
      }

      contentHtml += '</div>';
    }

    const textPanel = '<div class="flex flex-col ' + vertClass + ' items-center p-12" style="width:' + textPanelWidth + '%;background-color:' + textPanelColor + ';">' +
      '<div style="' + offsetStyle + '">' + contentHtml + '</div></div>';

    const imagePanel = '<div class="relative" style="width:' + (100 - parseInt(textPanelWidth)) + '%;height:100vh;">' + bg + '</div>';

    const layout = imageSide === 'right' 
      ? textPanel + imagePanel
      : imagePanel + textPanel;

    const fadeAttr = block._fadeOnScroll ? ' data-fade-scroll="true"' : '';

    return '<section class="sb-split-layout fullbleed overflow-hidden flex" style="position:relative;z-index:3;height:100vh;padding-top:' + paddingTop + ';padding-bottom:' + paddingBottom + ';"' + fadeAttr + '>' +
      '<div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:100vw;height:100%;background:#000;z-index:0;"></div>' +
      '<div style="position:relative;z-index:1;display:flex;width:100%;height:100%;">' + layout + '</div>' +
    '</section>';
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