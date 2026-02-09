import { resolvePreviewPath, resolveExportPath, processBodyText, textToolbarHtml } from '../utils.js';

export const SplitPanelBlock = {
  type: 'split-panel',
  title: 'Split Panel (alternating image/text)',

  defaults() {
    return {
      type: 'split-panel',
      reverseLayout: false,
      paddingTop: 'medium',
      paddingBottom: 'medium',
      mobileSubheadOverlay: false,
      panels: [
        {
          image: '', 
          video: '', 
          textBgColor: '#000000',
          textWidth: 'medium',
          headline: 'Panel 1 Headline',
          headlineStyle: { size: '36', weight: 'bold', italic: false, color: '#fbbf24', font: 'system-ui' },
          subhead: '', 
          subheadStyle: { size: '24', weight: 'normal', italic: false, color: '#d1d5db', font: 'system-ui' },
          text: 'Panel 1 body text...', 
          textStyle: { size: '18', weight: 'normal', italic: false, color: '#ffffff', font: 'system-ui' },
          useDropCap: false,
          dropCapColor: '#fbbf24',
          dropCapSize: '56',
          firstLineSize: '24',
          firstLineWeight: '600',
          firstLineColor: '#ffffff',
          inlineImage: '', 
          inlineImagePosition: '0',
          inlineImageWidth: 'medium', 
          inlineImageCaption: ''
        },
        {
          image: '', 
          video: '', 
          textBgColor: '#000000',
          textWidth: 'medium',
          headline: 'Panel 2 Headline',
          headlineStyle: { size: '36', weight: 'bold', italic: false, color: '#fbbf24', font: 'system-ui' },
          subhead: '', 
          subheadStyle: { size: '24', weight: 'normal', italic: false, color: '#d1d5db', font: 'system-ui' },
          text: 'Panel 2 body text...', 
          textStyle: { size: '18', weight: 'normal', italic: false, color: '#ffffff', font: 'system-ui' },
          useDropCap: false,
          dropCapColor: '#fbbf24',
          dropCapSize: '56',
          firstLineSize: '24',
          firstLineWeight: '600',
          firstLineColor: '#ffffff',
          inlineImage: '', 
          inlineImagePosition: '0',
          inlineImageWidth: 'medium', 
          inlineImageCaption: ''
        }
      ],
      expectedViewTime: null
    };
  },

  editor({ block }) {
    const b = block;
    const panels = b.panels || [];
    const padOpts = ['extra-small', 'small', 'medium', 'large'];
    const widthOpts = ['extra-narrow', 'narrow', 'medium', 'wide'];
    const imgW = ['small', 'medium', 'large', 'full'];
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
    const weightOpts = ['normal', 'bold'];

    const getStyle = (obj, prop, fallback) => (obj && obj[prop]) || fallback;

    const labelFieldHtml = '<div class="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">' +
      '<label class="block text-sm font-semibold text-blue-900 mb-2">📝 Block Label (Optional)</label>' +
      '<input type="text" data-k="label" class="label-input w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" ' +
        'placeholder="e.g., Journey to Summit, Campsite Reflections, etc." ' +
        'value="' + (b.label || '') + '" />' +
      '<p class="text-xs text-blue-600 mt-2">💡 Give this block a memorable name to easily identify it in your blocks list</p>' +
    '</div>' +
    '<hr class="my-4 border-gray-300" />';

    const getImageSide = (idx) => {
      const isReversed = b.reverseLayout || false;
      return (idx % 2 === 0) !== isReversed ? 'Left' : 'Right';
    };

    let panelsHtml = panels.map((panel, idx) => {
      const headlineStyle = panel.headlineStyle || {};
      const subheadStyle = panel.subheadStyle || {};
      const textStyle = panel.textStyle || {};

      const paragraphs = (panel.text || '').split(/\n\n+/).filter(p => p.trim());
      const numParagraphs = paragraphs.length;
      
      let positionOptions = '<option value="0">Before text</option>';
      for (let i = 1; i <= numParagraphs; i++) {
        positionOptions += '<option value="' + i + '">After paragraph ' + i + '</option>';
      }
      positionOptions += '<option value="' + (numParagraphs + 1) + '">After text</option>';
      
      const currentPosition = panel.inlineImagePosition || '0';

      return '<div class="mt-3 p-3 border-2 rounded bg-slate-100">' +
          '<div class="font-semibold text-sm mb-3">Panel ' + (idx + 1) + ' (Image ' + getImageSide(idx) + ')</div>' +
          
          '<label class="block text-sm font-medium mb-1">Image</label>' +
          '<input data-k="panels.' + idx + '.image" value="' + (panel.image || '') + '" class="w-full border rounded px-2 py-1 mb-2">' +
          
          '<label class="block text-sm font-medium mb-1">Video (optional)</label>' +
          '<input data-k="panels.' + idx + '.video" value="' + (panel.video || '') + '" class="w-full border rounded px-2 py-1 mb-3">' +

          '<label class="block text-sm font-medium mb-1">Text Background Color</label>' +
          '<input type="color" data-k="panels.' + idx + '.textBgColor" value="' + (panel.textBgColor || '#000000') + '" class="w-full h-9 border rounded mb-2">' +

          '<label class="block text-sm font-medium mb-1">Text Width</label>' +
          '<select data-k="panels.' + idx + '.textWidth" class="w-full border rounded px-2 py-1 mb-3">' +
            widthOpts.map(w => '<option ' + ((panel.textWidth || 'medium') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
          '</select>' +

          '<div class="p-3 mb-3 border-2 border-green-200 rounded-lg bg-green-50">' +
            '<label class="block font-semibold text-green-900 mb-2">Headline</label>' +
            '<input data-k="panels.' + idx + '.headline" value="' + (panel.headline || '') + '" class="w-full border rounded px-2 py-1 mb-2">' +
            
            '<div class="p-2 border rounded bg-white">' +
              '<div class="text-xs font-semibold mb-2 text-green-700">Headline Style</div>' +
              '<div class="grid grid-cols-3 gap-2 mb-2">' +
                '<div>' +
                  '<label class="block text-xs">Size (px)</label>' +
                  '<input data-k="panels.' + idx + '.headlineStyle.size" type="number" min="8" max="96" value="' + getStyle(headlineStyle, 'size', '36') + '" class="w-full border rounded px-2 py-1 text-sm">' +
                '</div>' +
                '<div>' +
                  '<label class="block text-xs">Weight</label>' +
                  '<select data-k="panels.' + idx + '.headlineStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' +
                    weightOpts.map(w => '<option ' + (getStyle(headlineStyle, 'weight', 'bold') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
                  '</select>' +
                '</div>' +
                '<div>' +
                  '<label class="block text-xs">Color</label>' +
                  '<input type="color" data-k="panels.' + idx + '.headlineStyle.color" value="' + getStyle(headlineStyle, 'color', '#fbbf24') + '" class="w-full h-8 border rounded">' +
                '</div>' +
              '</div>' +
              '<div class="grid grid-cols-[1fr_auto] gap-2">' +
                '<div>' +
                  '<label class="block text-xs">Font</label>' +
                  '<select data-k="panels.' + idx + '.headlineStyle.font" class="w-full border rounded px-2 py-1 text-xs">' +
                    fontFamilies.map(f => '<option ' + (getStyle(headlineStyle, 'font', 'system-ui') === f ? 'selected' : '') + ' value="' + f + '">' + f.split(',')[0] + '</option>').join('') +
                  '</select>' +
                '</div>' +
                '<div class="flex items-end">' +
                  '<label class="flex items-center gap-1 text-xs">' +
                    '<input type="checkbox" data-k="panels.' + idx + '.headlineStyle.italic" ' + (getStyle(headlineStyle, 'italic', false) ? 'checked' : '') + '>' +
                    '<span>Italic</span>' +
                  '</label>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="p-3 mb-3 border-2 border-purple-200 rounded-lg bg-purple-50">' +
            '<label class="block font-semibold text-purple-900 mb-2">Subhead</label>' +
            '<input data-k="panels.' + idx + '.subhead" value="' + (panel.subhead || '') + '" class="w-full border rounded px-2 py-1 mb-2">' +
            
            '<div class="p-2 border rounded bg-white">' +
              '<div class="text-xs font-semibold mb-2 text-purple-700">Subhead Style</div>' +
              '<div class="grid grid-cols-3 gap-2 mb-2">' +
                '<div>' +
                  '<label class="block text-xs">Size (px)</label>' +
                  '<input data-k="panels.' + idx + '.subheadStyle.size" type="number" min="8" max="72" value="' + getStyle(subheadStyle, 'size', '24') + '" class="w-full border rounded px-2 py-1 text-sm">' +
                '</div>' +
                '<div>' +
                  '<label class="block text-xs">Weight</label>' +
                  '<select data-k="panels.' + idx + '.subheadStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' +
                    weightOpts.map(w => '<option ' + (getStyle(subheadStyle, 'weight', 'normal') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
                  '</select>' +
                '</div>' +
                '<div>' +
                  '<label class="block text-xs">Color</label>' +
                  '<input type="color" data-k="panels.' + idx + '.subheadStyle.color" value="' + getStyle(subheadStyle, 'color', '#d1d5db') + '" class="w-full h-8 border rounded">' +
                '</div>' +
              '</div>' +
              '<div class="grid grid-cols-[1fr_auto] gap-2">' +
                '<div>' +
                  '<label class="block text-xs">Font</label>' +
                  '<select data-k="panels.' + idx + '.subheadStyle.font" class="w-full border rounded px-2 py-1 text-xs">' +
                    fontFamilies.map(f => '<option ' + (getStyle(subheadStyle, 'font', 'system-ui') === f ? 'selected' : '') + ' value="' + f + '">' + f.split(',')[0] + '</option>').join('') +
                  '</select>' +
                '</div>' +
                '<div class="flex items-end">' +
                  '<label class="flex items-center gap-1 text-xs">' +
                    '<input type="checkbox" data-k="panels.' + idx + '.subheadStyle.italic" ' + (getStyle(subheadStyle, 'italic', false) ? 'checked' : '') + '>' +
                    '<span>Italic</span>' +
                  '</label>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="p-3 mb-3 border-2 border-blue-200 rounded-lg bg-blue-50">' +
            '<label class="block font-semibold text-blue-900 mb-2">Body Text</label>' +
            textToolbarHtml('panels.' + idx + '.text') +
            '<textarea data-k="panels.' + idx + '.text" rows="8" class="w-full border rounded px-2 py-1 mb-2">' + (panel.text || '') + '</textarea>' +
            '<p class="text-xs text-blue-700 mb-2">Separate paragraphs with double line breaks</p>' +

            '<div class="p-2 border rounded bg-white">' +
              '<div class="text-xs font-semibold mb-2 text-blue-700">Body Text Style</div>' +
              '<div class="grid grid-cols-3 gap-2 mb-2">' +
                '<div>' +
                  '<label class="block text-xs">Size (px)</label>' +
                  '<input data-k="panels.' + idx + '.textStyle.size" type="number" min="8" max="48" value="' + getStyle(textStyle, 'size', '18') + '" class="w-full border rounded px-2 py-1 text-sm">' +
                '</div>' +
                '<div>' +
                  '<label class="block text-xs">Weight</label>' +
                  '<select data-k="panels.' + idx + '.textStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' +
                    weightOpts.map(w => '<option ' + (getStyle(textStyle, 'weight', 'normal') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
                  '</select>' +
                '</div>' +
                '<div>' +
                  '<label class="block text-xs">Color</label>' +
                  '<input type="color" data-k="panels.' + idx + '.textStyle.color" value="' + getStyle(textStyle, 'color', '#ffffff') + '" class="w-full h-8 border rounded">' +
                '</div>' +
              '</div>' +
              '<div class="grid grid-cols-[1fr_auto] gap-2">' +
                '<div>' +
                  '<label class="block text-xs">Font</label>' +
                  '<select data-k="panels.' + idx + '.textStyle.font" class="w-full border rounded px-2 py-1 text-xs">' +
                    fontFamilies.map(f => '<option ' + (getStyle(textStyle, 'font', 'system-ui') === f ? 'selected' : '') + ' value="' + f + '">' + f.split(',')[0] + '</option>').join('') +
                  '</select>' +
                '</div>' +
                '<div class="flex items-end">' +
                  '<label class="flex items-center gap-1 text-xs">' +
                    '<input type="checkbox" data-k="panels.' + idx + '.textStyle.italic" ' + (getStyle(textStyle, 'italic', false) ? 'checked' : '') + '>' +
                    '<span>Italic</span>' +
                  '</label>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="p-3 mb-3 border-2 border-amber-200 rounded-lg bg-amber-50">' +
            '<label class="flex items-center gap-2 font-semibold text-amber-900 mb-3">' +
              '<input type="checkbox" data-k="panels.' + idx + '.useDropCap" ' + (panel.useDropCap ? 'checked' : '') + '>' +
              '<span>Use Drop Cap & First Line Style</span>' +
            '</label>' +
            '<div class="' + (panel.useDropCap ? '' : 'opacity-50 pointer-events-none') + '">' +
              '<div class="grid grid-cols-2 gap-3 mb-3">' +
                '<div>' +
                  '<label class="block text-xs mb-1">Drop Cap Color</label>' +
                  '<input type="color" data-k="panels.' + idx + '.dropCapColor" value="' + (panel.dropCapColor || '#fbbf24') + '" class="w-full h-8 border rounded">' +
                '</div>' +
                '<div>' +
                  '<label class="block text-xs mb-1">Drop Cap Size (px)</label>' +
                  '<input data-k="panels.' + idx + '.dropCapSize" type="number" min="36" max="96" value="' + (panel.dropCapSize || '56') + '" class="w-full border rounded px-2 py-1">' +
                '</div>' +
              '</div>' +
              '<div class="text-xs font-semibold mb-2 text-amber-700">First Line Style (Oversized)</div>' +
              '<div class="grid grid-cols-3 gap-2">' +
                '<div>' +
                  '<label class="block text-xs mb-1">Size (px)</label>' +
                  '<input data-k="panels.' + idx + '.firstLineSize" type="number" min="18" max="36" value="' + (panel.firstLineSize || '24') + '" class="w-full border rounded px-2 py-1">' +
                '</div>' +
                '<div>' +
                  '<label class="block text-xs mb-1">Weight</label>' +
                  '<select data-k="panels.' + idx + '.firstLineWeight" class="w-full border rounded px-2 py-1 text-xs">' +
                    ['normal', '500', '600', 'bold'].map(w => '<option ' + ((panel.firstLineWeight || '600') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
                  '</select>' +
                '</div>' +
                '<div>' +
                  '<label class="block text-xs mb-1">Color</label>' +
                  '<input type="color" data-k="panels.' + idx + '.firstLineColor" value="' + (panel.firstLineColor || '#ffffff') + '" class="w-full h-8 border rounded">' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="p-2 border rounded bg-slate-50">' +
            '<div class="text-xs font-semibold mb-2">Inline Image</div>' +
            '<label class="block text-sm">Image Path</label>' +
            '<input data-k="panels.' + idx + '.inlineImage" value="' + (panel.inlineImage || '') + '" class="w-full border rounded px-2 py-1 mb-2">' +
            '<div class="grid grid-cols-2 gap-2">' +
              '<div>' +
                '<label class="block text-sm">Position</label>' +
                '<select data-k="panels.' + idx + '.inlineImagePosition" class="w-full border rounded px-2 py-1">' +
                  positionOptions +
                '</select>' +
                '<p class="text-xs text-slate-500 mt-1">Re-render preview after changing paragraphs</p>' +
              '</div>' +
              '<div>' +
                '<label class="block text-sm">Width</label>' +
                '<select data-k="panels.' + idx + '.inlineImageWidth" class="w-full border rounded px-2 py-1">' +
                  imgW.map(w => '<option ' + ((panel.inlineImageWidth || 'medium') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
                '</select>' +
              '</div>' +
            '</div>' +
            '<label class="block text-sm mt-2">Caption</label>' +
            '<input data-k="panels.' + idx + '.inlineImageCaption" value="' + (panel.inlineImageCaption || '') + '" class="w-full border rounded px-2 py-1">' +
          '</div>' +

        '</div>';
    }).join('');

    return labelFieldHtml +
      '<div class="mb-3 p-2 border rounded bg-amber-50 border-amber-200">' +
        '<label class="flex items-center gap-2 text-sm">' +
          '<input type="checkbox" data-k="reverseLayout" ' + (b.reverseLayout ? 'checked' : '') + '>' +
          '<span class="font-semibold">Reverse layout (start with image on right)</span>' +
        '</label>' +
        '<p class="text-xs text-amber-700 mt-1">By default, first panel has image on left. Check this to start with image on right.</p>' +
      '</div>' +
      '<div class="mb-3 p-2 border rounded bg-purple-50 border-purple-200">' +
        '<label class="flex items-center gap-2 text-sm">' +
          '<input type="checkbox" data-k="mobileSubheadOverlay" ' + (b.mobileSubheadOverlay ? 'checked' : '') + '>' +
          '<span class="font-semibold">Mobile: Overlay subhead on image</span>' +
        '</label>' +
        '<p class="text-xs text-purple-700 mt-1">On mobile, display the subhead overlaid on the image with a gradient (useful for timestamps)</p>' +
      '</div>' +
      '<div class="mb-3 p-2 border rounded bg-slate-100">' +
        '<div class="text-xs font-semibold mb-2">Panel Padding (applies to both panels)</div>' +
        '<div class="grid grid-cols-2 gap-2">' +
          '<div>' +
            '<label class="block text-xs">Padding Top</label>' +
            '<select data-k="paddingTop" class="w-full border rounded px-2 py-1">' +
              padOpts.map(p => '<option ' + ((b.paddingTop || 'medium') === p ? 'selected' : '') + ' value="' + p + '">' + p + '</option>').join('') +
            '</select>' +
          '</div>' +
          '<div>' +
            '<label class="block text-xs">Padding Bottom</label>' +
            '<select data-k="paddingBottom" class="w-full border rounded px-2 py-1">' +
              padOpts.map(p => '<option ' + ((b.paddingBottom || 'medium') === p ? 'selected' : '') + ' value="' + p + '">' + p + '</option>').join('') +
            '</select>' +
          '</div>' +
        '</div>' +
      '</div>' +
      panelsHtml +
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
    const panels = block.panels || [];
    const firstPanelBg = (panels[0] && panels[0].textBgColor) || '#000000';
    const isReversed = block.reverseLayout || false;
    const mobileSubheadOverlay = block.mobileSubheadOverlay || false;
    
    const paddingTopMap = {
      'extra-small': 'pt-4',
      'small': 'pt-8',
      'medium': 'pt-16',
      'large': 'pt-24'
    };
    const paddingBottomMap = {
      'extra-small': 'pb-4',
      'small': 'pb-8',
      'medium': 'pb-16',
      'large': 'pb-24'
    };
    const pt = paddingTopMap[block.paddingTop || 'medium'];
    const pb = paddingBottomMap[block.paddingBottom || 'medium'];

    const widthMap = {
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
      const fontStyle = italic ? 'italic' : 'normal';
      const fontWeight = weight === 'bold' ? '700' : '400';
      return 'color:' + color + ';font-size:' + size + 'px;font-family:' + font + ';font-weight:' + fontWeight + ';font-style:' + fontStyle + ';';
    };

    // Generate unique ID for this block
    const blockId = 'split-preview-' + Math.random().toString(36).substr(2, 9);

    // ============ DESKTOP PREVIEW ============
    const desktopPanelsHtml = panels.map((panel, panelIdx) => {
      const isImageLeft = (panelIdx % 2 === 0) !== isReversed;

      const isVid = panel.video && panel.video.trim();
      const imageSide = isVid
        ? '<video class="absolute inset-0 w-full h-full object-cover" autoplay muted loop playsinline src="' + resolvePreviewPath(panel.video, project) + '"></video>'
        : '<img class="absolute inset-0 w-full h-full object-cover" src="' + resolvePreviewPath(panel.image, project) + '" alt="">';

      const headlineStyle = buildStyle(panel.headlineStyle, { color: '#fbbf24', size: '36', font: 'system-ui', weight: 'bold' });
      const subheadStyle = buildStyle(panel.subheadStyle, { color: '#d1d5db', size: '24', font: 'system-ui', weight: 'normal' });
      const textStyleStr = buildStyle(panel.textStyle, { color: '#ffffff', size: '18', font: 'system-ui', weight: 'normal' });

      const widthMode = panel.inlineImageWidth || 'medium';
      const wrapperClass = widthMode === 'large' ? 'breakout-large' : widthMode === 'full' ? 'fullbleed' : 'mx-auto';
      const imgWidthStyle = widthMode === 'small' ? 'max-width:24rem;' : widthMode === 'medium' ? 'max-width:40rem;' : '';

      let inlineImageHtml = '';
      if (panel.inlineImage) {
        const caption = panel.inlineImageCaption
          ? '<p class="text-sm text-slate-400 mt-2 text-center italic">' + panel.inlineImageCaption + '</p>'
          : '';
        inlineImageHtml = '<div class="mt-10 mb-6 ' + wrapperClass + '" style="' + imgWidthStyle + '">' +
          '<img src="' + resolvePreviewPath(panel.inlineImage, project) + '" class="w-full rounded" alt="">' + caption + '</div>';
      }

      const headlineHtml = panel.headline ? '<h2 class="text-left mb-4" style="' + headlineStyle + '">' + panel.headline + '</h2>' : '';
      const subheadHtml = panel.subhead ? '<h3 class="text-left mb-6" style="' + subheadStyle + '">' + panel.subhead + '</h3>' : '';
      
      const paragraphs = (panel.text || '').split(/\n\n+/).filter(p => p.trim());
      const position = parseInt(panel.inlineImagePosition || '0');
      
      const dropCapClass = 'split-panel-drop-cap-' + panelIdx;
      
      let bodyParts = [];
      paragraphs.forEach((para, idx) => {
        const pClass = (idx === 0 && panel.useDropCap) ? dropCapClass : '';
        bodyParts.push('<p class="mb-4 ' + pClass + '">' + processBodyText(para) + '</p>');
        if (idx + 1 === position && inlineImageHtml) {
          bodyParts.push(inlineImageHtml);
        }
      });
      
      let dropCapCss = '';
      if (panel.useDropCap) {
        const dropCapSize = panel.dropCapSize || '56';
        const dropCapLineHeight = Math.floor(parseInt(dropCapSize) * 0.85);
        const weightValue = panel.firstLineWeight || '600';
        
        let firstLineWeight = '600';
        if (weightValue === 'normal') firstLineWeight = '400';
        else if (weightValue === '500') firstLineWeight = '500';
        else if (weightValue === '600') firstLineWeight = '600';
        else if (weightValue === 'bold') firstLineWeight = '700';
        else firstLineWeight = weightValue;
        
        const bodyWeight = (panel.textStyle && panel.textStyle.weight === 'bold') ? '700' : '400';
        
        dropCapCss = '<style>' +
          '.' + dropCapClass + '{font-weight:' + bodyWeight + ';}' +
          '.' + dropCapClass + '::first-letter{float:left;font-size:' + dropCapSize + 'px;line-height:' + dropCapLineHeight + 'px;padding-right:10px;margin-top:2px;color:' + (panel.dropCapColor || '#fbbf24') + ';font-weight:bold;}' +
          '.' + dropCapClass + '::first-line{font-size:' + (panel.firstLineSize || '24') + 'px;font-weight:' + firstLineWeight + ';color:' + (panel.firstLineColor || '#ffffff') + ';}' +
        '</style>';
      }
      
      let textContent = headlineHtml + subheadHtml;
      if (position === 0 && inlineImageHtml) {
        textContent += inlineImageHtml;
      }
      textContent += '<div class="leading-relaxed" style="' + textStyleStr + '">' + bodyParts.join('') + '</div>';
      if (position > paragraphs.length && inlineImageHtml) {
        textContent += inlineImageHtml;
      }

      const textWidthClass = widthMap[panel.textWidth || 'medium'];

      const textSide = '<div class="flex items-center justify-center p-12 min-h-screen ' + pt + ' ' + pb + '" style="background-color:' + (panel.textBgColor || '#000000') + ';">' +
        '<div class="w-full relative z-20 ' + textWidthClass + '">' + textContent + '</div></div>';

      const imageContainer = '<div class="relative h-screen">' + imageSide + '</div>';

      const layout = isImageLeft
        ? '<div class="w-1/2">' + imageContainer + '</div><div class="w-1/2">' + textSide + '</div>'
        : '<div class="w-1/2">' + textSide + '</div><div class="w-1/2">' + imageContainer + '</div>';

      return dropCapCss + '<div class="flex min-h-screen">' + layout + '</div>';
    }).join('');

    // ============ MOBILE PREVIEW ============
    // Linear layout: image1, text1, image2, text2
    const mobilePanelsHtml = panels.map((panel, panelIdx) => {
      const isVid = panel.video && panel.video.trim();
      const videoId = blockId + '-mobile-video-' + panelIdx;
      const mediaHtml = isVid
        ? '<video id="' + videoId + '" class="split-mobile-media" autoplay muted loop playsinline src="' + resolvePreviewPath(panel.video, project) + '"></video>'
        : '<img class="split-mobile-media" src="' + resolvePreviewPath(panel.image, project) + '" alt="">';

      const headlineStyle = buildStyle(panel.headlineStyle, { color: '#fbbf24', size: '36', font: 'system-ui', weight: 'bold' });
      const subheadStyle = buildStyle(panel.subheadStyle, { color: '#d1d5db', size: '24', font: 'system-ui', weight: 'normal' });
      const textStyleStr = buildStyle(panel.textStyle, { color: '#ffffff', size: '18', font: 'system-ui', weight: 'normal' });
      const textWidthClass = widthMap[panel.textWidth || 'medium'];

      const widthMode = panel.inlineImageWidth || 'medium';
      const breakoutClass = widthMode === 'large' ? 'breakout-large' : widthMode === 'full' ? 'fullbleed' : '';
      const imgWidthStyle = widthMode === 'small' ? 'max-width:24rem;' : widthMode === 'medium' ? 'max-width:40rem;' : '';

      let inlineImageHtml = '';
      if (panel.inlineImage) {
        const caption = panel.inlineImageCaption
          ? '<p class="text-sm text-slate-400 mt-2 text-center italic">' + String(panel.inlineImageCaption) + '</p>'
          : '';
        inlineImageHtml = '<div class="mt-10 mb-6 mx-auto ' + breakoutClass + '" style="' + imgWidthStyle + '">' +
          '<img src="' + resolvePreviewPath(panel.inlineImage, project) + '" class="w-full rounded" alt="">' + caption + '</div>';
      }

      const headlineHtml = panel.headline ? '<h2 class="text-left mb-4" style="' + headlineStyle + '">' + String(panel.headline) + '</h2>' : '';
      
      // Subhead: either in overlay or in text section
      let subheadOverlayHtml = '';
      let subheadTextHtml = '';
      if (panel.subhead) {
        if (mobileSubheadOverlay) {
          subheadOverlayHtml = '<div class="split-mobile-subhead-overlay"><div class="split-mobile-subhead-text" style="' + subheadStyle + '">' + String(panel.subhead) + '</div></div>';
        } else {
          subheadTextHtml = '<h3 class="text-left mb-6" style="' + subheadStyle + '">' + String(panel.subhead) + '</h3>';
        }
      }
      
      const paragraphs = String(panel.text || '').split(/\n\n+/).filter(p => p.trim());
      const position = parseInt(panel.inlineImagePosition || '0');
      const dropCapClass = 'split-panel-drop-cap-' + panelIdx;
      
      let bodyParts = [];
      paragraphs.forEach((para, idx) => {
        const pClass = (idx === 0 && panel.useDropCap) ? dropCapClass : '';
        bodyParts.push('<p class="mb-4 ' + pClass + '">' + processBodyText(para, { brTag: '<br/>' }) + '</p>');
        if (idx + 1 === position && inlineImageHtml) {
          bodyParts.push(inlineImageHtml);
        }
      });
      
      let textContent = headlineHtml + subheadTextHtml;
      if (position === 0 && inlineImageHtml) {
        textContent += inlineImageHtml;
      }
      textContent += '<div class="leading-relaxed" style="' + textStyleStr + '">' + bodyParts.join('') + '</div>';
      if (position > paragraphs.length && inlineImageHtml) {
        textContent += inlineImageHtml;
      }

      // Each panel: image on top (with optional subhead overlay), text below
      return '<div class="split-mobile-panel" data-panel="' + panelIdx + '">' +
        '<div class="split-mobile-panel-image">' + mediaHtml + subheadOverlayHtml + '</div>' +
        '<div class="split-mobile-panel-text ' + pt + ' ' + pb + '" style="background-color:' + (panel.textBgColor || '#000000') + ';">' +
          '<div class="split-mobile-text-inner ' + textWidthClass + '">' + textContent + '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    const mobileHtml = '<div class="split-mobile-wrapper split-mobile-only" id="' + blockId + '-mobile" style="background-color:' + firstPanelBg + ';">' +
      mobilePanelsHtml +
    '</div>';

    // Return both structures
    return '<div class="split-desktop-only">' + desktopPanelsHtml + '</div>' + mobileHtml;
  },

  exportHTML({ block }) {
    const panels = block.panels || [];
    const firstPanelBg = (panels[0] && panels[0].textBgColor) || '#000000';
    const isReversed = block.reverseLayout || false;
    const mobileSubheadOverlay = block.mobileSubheadOverlay || false;
    
    const blockId = 'split-panel-' + Math.random().toString(36).substr(2, 9);

    const paddingTopMap = {
      'extra-small': 'pt-4',
      'small': 'pt-8',
      'medium': 'pt-16',
      'large': 'pt-24'
    };
    const paddingBottomMap = {
      'extra-small': 'pb-4',
      'small': 'pb-8',
      'medium': 'pb-16',
      'large': 'pb-24'
    };
    const pt = paddingTopMap[block.paddingTop || 'medium'];
    const pb = paddingBottomMap[block.paddingBottom || 'medium'];

    const widthMap = {
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
      const fontStyle = italic ? 'italic' : 'normal';
      const fontWeight = weight === 'bold' ? '700' : '400';
      return 'color:' + color + ';font-size:' + size + 'px;font-family:' + font + ';font-weight:' + fontWeight + ';font-style:' + fontStyle + ';';
    };

    // Collect all drop cap styles
    let allDropCapCss = '';

    // ============ DESKTOP EXPORT ============
    const desktopPanelsHtml = panels.map((panel, panelIdx) => {
      const isImageLeft = (panelIdx % 2 === 0) !== isReversed;

      const isVid = panel.video && panel.video.trim();
      const videoId = blockId + '-video-' + panelIdx;
      const imageSide = isVid
        ? '<div style="position:relative;width:100%;height:100%;"><video id="' + videoId + '" autoplay muted loop playsinline src="' + resolveExportPath(panel.video) + '" style="width:100%;height:100%;object-fit:cover;"></video>' +
           '<button onclick="toggleMute(\'' + videoId + '\', this)" style="position:absolute;bottom:20px;left:20px;width:44px;height:44px;background:rgba(0,0,0,0.7);border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:100;" aria-label="Toggle mute">' +
           '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" opacity="0.3" class="unmuted-path"/><line x1="2" y1="2" x2="22" y2="22" stroke="white" stroke-width="2" class="muted-line" style="display:none;"/></svg>' +
           '</button></div>'
        : '<img src="' + resolveExportPath(panel.image) + '" alt="">';

      const headlineStyle = buildStyle(panel.headlineStyle, { color: '#fbbf24', size: '36', font: 'system-ui', weight: 'bold' });
      const subheadStyle = buildStyle(panel.subheadStyle, { color: '#d1d5db', size: '24', font: 'system-ui', weight: 'normal' });
      const textStyleStr = buildStyle(panel.textStyle, { color: '#ffffff', size: '18', font: 'system-ui', weight: 'normal' });

      const widthMode = panel.inlineImageWidth || 'medium';
      const breakoutClass = widthMode === 'large' ? 'breakout-large' : widthMode === 'full' ? 'fullbleed' : '';
      const imgWidthStyle = widthMode === 'small' ? 'max-width:24rem;' : widthMode === 'medium' ? 'max-width:40rem;' : '';

      let inlineImageHtml = '';
      if (panel.inlineImage) {
        const caption = panel.inlineImageCaption
          ? '<p class="text-sm text-slate-400 mt-2 text-center italic">' + String(panel.inlineImageCaption) + '</p>'
          : '';
        inlineImageHtml = '<div class="mt-10 mb-6 mx-auto ' + breakoutClass + '" style="' + imgWidthStyle + '">' +
          '<img src="' + resolveExportPath(panel.inlineImage) + '" class="w-full rounded" alt="">' + caption + '</div>';
      }

      const headlineHtml = panel.headline ? '<h2 class="text-left mb-4" style="' + headlineStyle + '">' + String(panel.headline) + '</h2>' : '';
      const subheadHtml = panel.subhead ? '<h3 class="text-left mb-6" style="' + subheadStyle + '">' + String(panel.subhead) + '</h3>' : '';
      
      const paragraphs = String(panel.text || '').split(/\n\n+/).filter(p => p.trim());
      const position = parseInt(panel.inlineImagePosition || '0');
      
      const dropCapClass = 'split-panel-drop-cap-' + panelIdx;
      
      let bodyParts = [];
      paragraphs.forEach((para, idx) => {
        const pClass = (idx === 0 && panel.useDropCap) ? dropCapClass : '';
        bodyParts.push('<p class="mb-4 ' + pClass + '">' + processBodyText(para, { brTag: '<br/>' }) + '</p>');
        if (idx + 1 === position && inlineImageHtml) {
          bodyParts.push(inlineImageHtml);
        }
      });
      
      if (panel.useDropCap) {
        const dropCapSize = panel.dropCapSize || '56';
        const dropCapLineHeight = Math.floor(parseInt(dropCapSize) * 0.85);
        const weightValue = panel.firstLineWeight || '600';
        
        let firstLineWeight = '600';
        if (weightValue === 'normal') firstLineWeight = '400';
        else if (weightValue === '500') firstLineWeight = '500';
        else if (weightValue === '600') firstLineWeight = '600';
        else if (weightValue === 'bold') firstLineWeight = '700';
        else firstLineWeight = weightValue;
        
        const bodyWeight = (panel.textStyle && panel.textStyle.weight === 'bold') ? '700' : '400';
        
        allDropCapCss += '.' + dropCapClass + '{font-weight:' + bodyWeight + ';}' +
          '.' + dropCapClass + '::first-letter{float:left;font-size:' + dropCapSize + 'px;line-height:' + dropCapLineHeight + 'px;padding-right:10px;margin-top:2px;color:' + (panel.dropCapColor || '#fbbf24') + ';font-weight:bold;}' +
          '.' + dropCapClass + '::first-line{font-size:' + (panel.firstLineSize || '24') + 'px;font-weight:' + firstLineWeight + ';color:' + (panel.firstLineColor || '#ffffff') + ';}';
      }
      
      let textContent = headlineHtml + subheadHtml;
      if (position === 0 && inlineImageHtml) {
        textContent += inlineImageHtml;
      }
      textContent += '<div class="leading-relaxed" style="' + textStyleStr + '">' + bodyParts.join('') + '</div>';
      if (position > paragraphs.length && inlineImageHtml) {
        textContent += inlineImageHtml;
      }

      const textWidthClass = widthMap[panel.textWidth || 'medium'];

      const imageContainer = '<div class="split-image-sticky"><div class="split-image-content">' + imageSide + '</div></div>';
      const textContainer = '<div class="split-text-scroll ' + pt + ' ' + pb + '" style="background-color:' + (panel.textBgColor || '#000000') + ';">' +
        '<div class="split-text-inner ' + textWidthClass + '">' + textContent + '</div></div>';

      const layout = isImageLeft ? imageContainer + textContainer : textContainer + imageContainer;

      return '<section class="split-panel-row" style="background-color:' + (panel.textBgColor || '#000000') + ';">' + layout + '</section>';
    }).join('');

    const reversedClass = isReversed ? ' split-panel-reversed' : '';
    const desktopHtml = '<div class="split-panel-wrapper split-desktop-only' + reversedClass + '" id="' + blockId + '" style="background-color:' + firstPanelBg + ';">' +
      '<div class="split-panel-container" style="background-color:' + firstPanelBg + ';">' + desktopPanelsHtml + '</div></div>';

    // ============ MOBILE EXPORT ============
    // Linear layout: image1, text1, image2, text2
    const mobilePanelsHtml = panels.map((panel, panelIdx) => {
      const isVid = panel.video && panel.video.trim();
      const videoId = blockId + '-mobile-video-' + panelIdx;
      
      let mediaHtml;
      if (isVid) {
        const muteButtonSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" opacity="0.3" class="unmuted-path"/><line x1="2" y1="2" x2="22" y2="22" stroke="white" stroke-width="2" class="muted-line" style="display:none;"/></svg>';
        mediaHtml = '<video id="' + videoId + '" class="split-mobile-media" autoplay muted loop playsinline src="' + resolveExportPath(panel.video) + '"></video>' +
          '<button onclick="toggleMute(\'' + videoId + '\', this)" class="mute-btn mobile-mute-btn" aria-label="Toggle mute">' + muteButtonSvg + '</button>';
      } else {
        mediaHtml = '<img class="split-mobile-media" src="' + resolveExportPath(panel.image) + '" alt="">';
      }

      const headlineStyle = buildStyle(panel.headlineStyle, { color: '#fbbf24', size: '36', font: 'system-ui', weight: 'bold' });
      const subheadStyle = buildStyle(panel.subheadStyle, { color: '#d1d5db', size: '24', font: 'system-ui', weight: 'normal' });
      const textStyleStr = buildStyle(panel.textStyle, { color: '#ffffff', size: '18', font: 'system-ui', weight: 'normal' });
      const textWidthClass = widthMap[panel.textWidth || 'medium'];

      const widthMode = panel.inlineImageWidth || 'medium';
      const breakoutClass = widthMode === 'large' ? 'breakout-large' : widthMode === 'full' ? 'fullbleed' : '';
      const imgWidthStyle = widthMode === 'small' ? 'max-width:24rem;' : widthMode === 'medium' ? 'max-width:40rem;' : '';

      let inlineImageHtml = '';
      if (panel.inlineImage) {
        const caption = panel.inlineImageCaption
          ? '<p class="text-sm text-slate-400 mt-2 text-center italic">' + String(panel.inlineImageCaption) + '</p>'
          : '';
        inlineImageHtml = '<div class="mt-10 mb-6 mx-auto ' + breakoutClass + '" style="' + imgWidthStyle + '">' +
          '<img src="' + resolveExportPath(panel.inlineImage) + '" class="w-full rounded" alt="">' + caption + '</div>';
      }

      const headlineHtml = panel.headline ? '<h2 class="text-left mb-4" style="' + headlineStyle + '">' + String(panel.headline) + '</h2>' : '';
      
      // Subhead: either in overlay or in text section
      let subheadOverlayHtml = '';
      let subheadTextHtml = '';
      if (panel.subhead) {
        if (mobileSubheadOverlay) {
          subheadOverlayHtml = '<div class="split-mobile-subhead-overlay"><div class="split-mobile-subhead-text" style="' + subheadStyle + '">' + String(panel.subhead) + '</div></div>';
        } else {
          subheadTextHtml = '<h3 class="text-left mb-6" style="' + subheadStyle + '">' + String(panel.subhead) + '</h3>';
        }
      }
      
      const paragraphs = String(panel.text || '').split(/\n\n+/).filter(p => p.trim());
      const position = parseInt(panel.inlineImagePosition || '0');
      const dropCapClass = 'split-panel-drop-cap-' + panelIdx;
      
      let bodyParts = [];
      paragraphs.forEach((para, idx) => {
        const pClass = (idx === 0 && panel.useDropCap) ? dropCapClass : '';
        bodyParts.push('<p class="mb-4 ' + pClass + '">' + processBodyText(para, { brTag: '<br/>' }) + '</p>');
        if (idx + 1 === position && inlineImageHtml) {
          bodyParts.push(inlineImageHtml);
        }
      });
      
      let textContent = headlineHtml + subheadTextHtml;
      if (position === 0 && inlineImageHtml) {
        textContent += inlineImageHtml;
      }
      textContent += '<div class="leading-relaxed" style="' + textStyleStr + '">' + bodyParts.join('') + '</div>';
      if (position > paragraphs.length && inlineImageHtml) {
        textContent += inlineImageHtml;
      }

      // Each panel: image on top (with optional subhead overlay), text below
      return '<div class="split-mobile-panel" data-panel="' + panelIdx + '">' +
        '<div class="split-mobile-panel-image">' + mediaHtml + subheadOverlayHtml + '</div>' +
        '<div class="split-mobile-panel-text ' + pt + ' ' + pb + '" style="background-color:' + (panel.textBgColor || '#000000') + ';">' +
          '<div class="split-mobile-text-inner ' + textWidthClass + '">' + textContent + '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    const mobileHtml = '<div class="split-mobile-wrapper split-mobile-only" id="' + blockId + '-mobile" style="background-color:' + firstPanelBg + ';">' +
      mobilePanelsHtml +
    '</div>';

    // Return styles + both structures
    const allStyles = allDropCapCss ? '<style>' + allDropCapCss + '</style>' : '';
    return allStyles + desktopHtml + mobileHtml;
  },

  set(block, key, value) {
    if (key.startsWith('panels.')) {
      const parts = key.split('.');
      const panelIndex = parseInt(parts[1]);

      if (!block.panels[panelIndex]) return;

      if (parts.length === 3) {
        block.panels[panelIndex][parts[2]] = value;
      } else if (parts.length === 4) {
        const styleKey = parts[2];
        const styleProp = parts[3];

        if (!block.panels[panelIndex][styleKey]) {
          block.panels[panelIndex][styleKey] = {};
        }
        block.panels[panelIndex][styleKey][styleProp] = value;
      }
    } else {
      block[key] = value;
    }
  }
};