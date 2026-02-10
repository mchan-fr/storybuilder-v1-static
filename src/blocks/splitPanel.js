import {
  resolvePreviewPath,
  resolveExportPath,
  processBodyText,
  textToolbarHtml,
  fontSelectHtml,
  paddingSizes,
  paddingClassMap,
  textWidthOpts,
  textWidthClassMap,
  getStyle,
  buildInlineStyle,
  collapsibleSection,
  labelFieldHtml,
  paddingSelectHtml,
  textWidthSelectHtml,
  getEffectiveBgColor
} from '../utils.js';

export const SplitPanelBlock = {
  type: 'split-panel',
  title: 'Split Panel (alternating image/text)',

  defaults() {
    return {
      type: 'split-panel',
      label: '',

      // Block settings
      bgColor: '#000000',
      paddingTop: 'medium',
      paddingBottom: 'medium',
      startMediaRight: false,

      // Media (2 images/videos)
      media1: '',
      media1Video: '',
      media2: '',
      media2Video: '',

      // Two text panels
      panels: [
        {
          // Subhead
          subhead: '',
          subheadStyle: { size: '24', weight: 'normal', italic: false, color: '#d1d5db', font: 'IBM Plex Sans, sans-serif' },

          // Body text
          bodyText: 'Panel 1 body text...\n\nAdd more paragraphs with double line breaks.',
          textWidth: 'medium',
          textStyle: { size: '18', weight: 'normal', italic: false, color: '#ffffff', font: 'IBM Plex Sans, sans-serif', leading: '1.7' },

          // Drop cap
          showDropCap: false,
          dropCapColor: '#fbbf24',
          dropCapSize: '56',
          firstLineSize: '24',
          firstLineWeight: '600',
          firstLineColor: '#ffffff',

          // Pull quote
          pullQuote: '',
          pullQuotePosition: '0',
          pullQuoteStyle: { size: '24', weight: '500', italic: false, color: '#ffffff', font: 'IBM Plex Sans, sans-serif', leading: '1.8', bgColor: '#3d3314', borderColor: '#fbbf24' },

          // Inline image
          inlineImage: '',
          inlineImagePosition: 'top',
          inlineImageWidth: 'medium',
          inlineImageCaption: ''
        },
        {
          // Subhead
          subhead: '',
          subheadStyle: { size: '24', weight: 'normal', italic: false, color: '#d1d5db', font: 'IBM Plex Sans, sans-serif' },

          // Body text
          bodyText: 'Panel 2 body text...\n\nAdd more paragraphs with double line breaks.',
          textWidth: 'medium',
          textStyle: { size: '18', weight: 'normal', italic: false, color: '#ffffff', font: 'IBM Plex Sans, sans-serif', leading: '1.7' },

          // Drop cap
          showDropCap: false,
          dropCapColor: '#fbbf24',
          dropCapSize: '56',
          firstLineSize: '24',
          firstLineWeight: '600',
          firstLineColor: '#ffffff',

          // Pull quote
          pullQuote: '',
          pullQuotePosition: '0',
          pullQuoteStyle: { size: '24', weight: '500', italic: false, color: '#ffffff', font: 'IBM Plex Sans, sans-serif', leading: '1.8', bgColor: '#3d3314', borderColor: '#fbbf24' },

          // Inline image
          inlineImage: '',
          inlineImagePosition: 'top',
          inlineImageWidth: 'medium',
          inlineImageCaption: ''
        }
      ],

      expectedViewTime: null,
      _fadeOnScroll: false
    };
  },

  editor({ block }) {
    const b = block;
    const panels = b.panels || [];
    const panel1 = panels[0] || {};
    const panel2 = panels[1] || {};

    const inlineImgWidthOpts = ['small', 'medium', 'large', 'full'];
    const inlineImgPositionOpts = ['top', 'middle', 'bottom'];
    const weightOpts = ['normal', 'bold'];

    // ========== BLOCK SETTINGS ==========
    const blockSettingsContent =
      '<div class="mb-3">' +
        '<label class="block text-sm mb-1">Background Color</label>' +
        '<div class="mb-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs">' +
          '<label class="flex items-center gap-2 mb-2">' +
            '<input type="checkbox" data-k="_isBgColorMaster" class="bgcolor-style-master" ' + (b._isBgColorMaster ? 'checked' : '') + '>' +
            '<span>Set color for all blocks</span>' +
          '</label>' +
          '<label class="flex items-center gap-2">' +
            '<input type="checkbox" data-k="_inheritBgColor" class="bgcolor-style-inherit" ' + (b._inheritBgColor === true ? 'checked' : '') + '>' +
            '<span class="text-gray-600">Inherit color from master</span>' +
          '</label>' +
        '</div>' +
        '<div class="bgcolor-style-fields' + (b._inheritBgColor === true && !b._isBgColorMaster ? ' opacity-50 pointer-events-none' : '') + '">' +
          '<input type="color" data-k="bgColor" value="' + (b.bgColor || '#000000') + '" class="w-full h-9 border rounded">' +
        '</div>' +
      '</div>' +
      '<div class="grid grid-cols-2 gap-3 mb-3">' +
        '<div>' +
          '<label class="block text-sm mb-1">Padding Top</label>' +
          '<select data-k="paddingTop" class="w-full border rounded px-2 py-1">' + paddingSelectHtml(b.paddingTop) + '</select>' +
        '</div>' +
        '<div>' +
          '<label class="block text-sm mb-1">Padding Bottom</label>' +
          '<select data-k="paddingBottom" class="w-full border rounded px-2 py-1">' + paddingSelectHtml(b.paddingBottom) + '</select>' +
        '</div>' +
      '</div>' +
      '<div class="p-2 border rounded bg-slate-100 mb-3">' +
        '<label class="flex items-center gap-2 text-sm">' +
          '<input type="checkbox" data-k="_fadeOnScroll" ' + (b._fadeOnScroll ? 'checked' : '') + '>' +
          '<span>Enable fade effect on scroll</span>' +
        '</label>' +
        '<p class="text-xs text-slate-500 mt-1 ml-5">Content fades in when scrolled into view</p>' +
      '</div>' +
      '<div>' +
        '<label class="block text-xs mb-1">Expected View Time (seconds)</label>' +
        '<input type="number" data-k="expectedViewTime" min="1" max="300" step="1" ' +
          'value="' + (b.expectedViewTime || '') + '" ' +
          'placeholder="Auto-calculated if empty" ' +
          'class="w-full px-2 py-1 border border-gray-300 rounded text-sm" />' +
        '<p class="text-xs text-slate-500 mt-1">Override for analytics. Leave empty for auto.</p>' +
      '</div>';

    // ========== MEDIA ==========
    const mediaContent =
      '<div class="mb-3 p-2 border rounded bg-slate-50">' +
        '<label class="flex items-center gap-2 text-sm">' +
          '<input type="checkbox" data-k="startMediaRight" ' + (b.startMediaRight ? 'checked' : '') + '>' +
          '<span>Start with media on right</span>' +
        '</label>' +
        '<p class="text-xs text-slate-500 mt-1">By default, first media appears on left</p>' +
      '</div>' +
      '<div class="p-3 mb-3 border-2 border-blue-200 rounded-lg bg-blue-50">' +
        '<div class="font-semibold text-blue-900 mb-2">Media 1</div>' +
        '<div class="mb-2">' +
          '<label class="block text-xs mb-1">Image</label>' +
          '<input data-k="media1" value="' + (b.media1 || '') + '" class="w-full border rounded px-2 py-1 text-sm bg-white" placeholder="e.g., images/photo1.jpg">' +
        '</div>' +
        '<div>' +
          '<label class="block text-xs mb-1">Video (optional, overrides image)</label>' +
          '<input data-k="media1Video" value="' + (b.media1Video || '') + '" class="w-full border rounded px-2 py-1 text-sm bg-white" placeholder="e.g., videos/clip1.mp4">' +
        '</div>' +
      '</div>' +
      '<div class="p-3 border-2 border-purple-200 rounded-lg bg-purple-50">' +
        '<div class="font-semibold text-purple-900 mb-2">Media 2</div>' +
        '<div class="mb-2">' +
          '<label class="block text-xs mb-1">Image</label>' +
          '<input data-k="media2" value="' + (b.media2 || '') + '" class="w-full border rounded px-2 py-1 text-sm bg-white" placeholder="e.g., images/photo2.jpg">' +
        '</div>' +
        '<div>' +
          '<label class="block text-xs mb-1">Video (optional, overrides image)</label>' +
          '<input data-k="media2Video" value="' + (b.media2Video || '') + '" class="w-full border rounded px-2 py-1 text-sm bg-white" placeholder="e.g., videos/clip2.mp4">' +
        '</div>' +
      '</div>';

    // ========== SUBHEAD ==========
    const subheadStyle1 = panel1.subheadStyle || {};
    const subheadStyle2 = panel2.subheadStyle || {};
    const subheadFieldsDisabled = b._inheritSubheadStyle !== false && !b._isSubheadStyleMaster;

    const subheadContent =
      '<div class="mb-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs">' +
        '<label class="flex items-center gap-2 mb-2">' +
          '<input type="checkbox" data-k="_isSubheadStyleMaster" class="subhead-style-master" ' + (b._isSubheadStyleMaster ? 'checked' : '') + '>' +
          '<span>Set styling for all blocks</span>' +
        '</label>' +
        '<label class="flex items-center gap-2">' +
          '<input type="checkbox" data-k="_inheritSubheadStyle" class="subhead-style-inherit" ' + (b._inheritSubheadStyle !== false ? 'checked' : '') + '>' +
          '<span class="text-gray-600">Inherit styling from master</span>' +
        '</label>' +
      '</div>' +
      '<div class="subhead-style-fields' + (subheadFieldsDisabled ? ' opacity-50 pointer-events-none' : '') + '">' +
      '<div class="p-3 mb-3 border-2 border-blue-200 rounded-lg bg-blue-50">' +
        '<div class="font-semibold text-blue-900 mb-2">Text Panel 1 Subhead</div>' +
        '<input data-k="panels.0.subhead" value="' + (panel1.subhead || '') + '" class="w-full border rounded px-2 py-1 mb-2 bg-white" placeholder="Subhead text...">' +
        '<div class="p-2 border rounded bg-white">' +
          '<div class="text-xs font-semibold mb-2">Style</div>' +
          '<div class="grid grid-cols-3 gap-2 mb-2">' +
            '<div><label class="block text-xs">Size</label><input data-k="panels.0.subheadStyle.size" type="number" min="12" max="48" value="' + getStyle(subheadStyle1, 'size', '24') + '" class="w-full border rounded px-2 py-1 text-sm"></div>' +
            '<div><label class="block text-xs">Weight</label><select data-k="panels.0.subheadStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' + weightOpts.map(w => '<option ' + (getStyle(subheadStyle1, 'weight', 'normal') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') + '</select></div>' +
            '<div><label class="block text-xs">Color</label><input type="color" data-k="panels.0.subheadStyle.color" value="' + getStyle(subheadStyle1, 'color', '#d1d5db') + '" class="w-full h-7 border rounded"></div>' +
          '</div>' +
          '<div class="flex items-center gap-4">' +
            '<div class="flex-1"><label class="block text-xs">Font</label><select data-k="panels.0.subheadStyle.font" class="w-full border rounded px-2 py-1 text-xs">' + fontSelectHtml(getStyle(subheadStyle1, 'font', 'IBM Plex Sans, sans-serif')) + '</select></div>' +
            '<label class="flex items-center gap-1 text-xs pt-4"><input type="checkbox" data-k="panels.0.subheadStyle.italic" ' + (getStyle(subheadStyle1, 'italic', false) ? 'checked' : '') + '><span>Italic</span></label>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="p-3 border-2 border-purple-200 rounded-lg bg-purple-50">' +
        '<div class="font-semibold text-purple-900 mb-2">Text Panel 2 Subhead</div>' +
        '<input data-k="panels.1.subhead" value="' + (panel2.subhead || '') + '" class="w-full border rounded px-2 py-1 mb-2 bg-white" placeholder="Subhead text...">' +
        '<div class="p-2 border rounded bg-white">' +
          '<div class="text-xs font-semibold mb-2">Style</div>' +
          '<div class="grid grid-cols-3 gap-2 mb-2">' +
            '<div><label class="block text-xs">Size</label><input data-k="panels.1.subheadStyle.size" type="number" min="12" max="48" value="' + getStyle(subheadStyle2, 'size', '24') + '" class="w-full border rounded px-2 py-1 text-sm"></div>' +
            '<div><label class="block text-xs">Weight</label><select data-k="panels.1.subheadStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' + weightOpts.map(w => '<option ' + (getStyle(subheadStyle2, 'weight', 'normal') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') + '</select></div>' +
            '<div><label class="block text-xs">Color</label><input type="color" data-k="panels.1.subheadStyle.color" value="' + getStyle(subheadStyle2, 'color', '#d1d5db') + '" class="w-full h-7 border rounded"></div>' +
          '</div>' +
          '<div class="flex items-center gap-4">' +
            '<div class="flex-1"><label class="block text-xs">Font</label><select data-k="panels.1.subheadStyle.font" class="w-full border rounded px-2 py-1 text-xs">' + fontSelectHtml(getStyle(subheadStyle2, 'font', 'IBM Plex Sans, sans-serif')) + '</select></div>' +
            '<label class="flex items-center gap-1 text-xs pt-4"><input type="checkbox" data-k="panels.1.subheadStyle.italic" ' + (getStyle(subheadStyle2, 'italic', false) ? 'checked' : '') + '><span>Italic</span></label>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '</div>';

    // ========== BODY TEXT ==========
    const textStyle1 = panel1.textStyle || {};
    const textStyle2 = panel2.textStyle || {};
    const bodyFieldsDisabled = b._inheritBodyStyle !== false && !b._isBodyStyleMaster;
    const bodyStyleDimClass = bodyFieldsDisabled ? ' opacity-50 pointer-events-none' : '';

    const bodyTextContent =
      // Panel 1 Body Text
      '<div class="p-3 mb-3 border-2 border-blue-200 rounded-lg bg-blue-50">' +
        '<div class="font-semibold text-blue-900 mb-2">Text Panel 1</div>' +
        textToolbarHtml('panels.0.bodyText') +
        '<textarea data-k="panels.0.bodyText" rows="6" class="w-full border rounded px-2 py-1 mb-2 bg-white">' + (panel1.bodyText || '') + '</textarea>' +
        '<p class="text-xs text-blue-700 mb-2">Separate paragraphs with double line breaks</p>' +
        '<div class="grid grid-cols-2 gap-2 mb-2">' +
          '<div><label class="block text-xs mb-1">Text Width</label><select data-k="panels.0.textWidth" class="w-full border rounded px-2 py-1 text-sm">' + textWidthSelectHtml(panel1.textWidth) + '</select></div>' +
        '</div>' +
        // Body Text Style with master/inherit controls
        '<div class="p-2 border rounded bg-white mb-2">' +
          '<div class="text-xs font-semibold mb-2">Body Text Style</div>' +
          '<div class="mb-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs">' +
            '<label class="flex items-center gap-2 mb-2">' +
              '<input type="checkbox" data-k="_isBodyStyleMaster" class="body-style-master" ' + (b._isBodyStyleMaster ? 'checked' : '') + '>' +
              '<span>Set styling for all blocks</span>' +
            '</label>' +
            '<label class="flex items-center gap-2">' +
              '<input type="checkbox" data-k="_inheritBodyStyle" class="body-style-inherit" ' + (b._inheritBodyStyle !== false ? 'checked' : '') + '>' +
              '<span class="text-gray-600">Inherit styling from master</span>' +
            '</label>' +
          '</div>' +
          '<div class="body-style-fields' + bodyStyleDimClass + '">' +
            '<div class="grid grid-cols-3 gap-2 mb-2">' +
              '<div><label class="block text-xs">Size</label><input data-k="panels.0.textStyle.size" type="number" min="12" max="36" value="' + getStyle(textStyle1, 'size', '18') + '" class="w-full border rounded px-2 py-1 text-sm"></div>' +
              '<div><label class="block text-xs">Weight</label><select data-k="panels.0.textStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' + weightOpts.map(w => '<option ' + (getStyle(textStyle1, 'weight', 'normal') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') + '</select></div>' +
              '<div><label class="block text-xs">Color</label><input type="color" data-k="panels.0.textStyle.color" value="' + getStyle(textStyle1, 'color', '#ffffff') + '" class="w-full h-7 border rounded"></div>' +
            '</div>' +
            '<div class="flex items-center gap-4">' +
              '<div class="flex-1"><label class="block text-xs">Font</label><select data-k="panels.0.textStyle.font" class="w-full border rounded px-2 py-1 text-xs">' + fontSelectHtml(getStyle(textStyle1, 'font', 'IBM Plex Sans, sans-serif')) + '</select></div>' +
              '<label class="flex items-center gap-1 text-xs pt-4"><input type="checkbox" data-k="panels.0.textStyle.italic" ' + (getStyle(textStyle1, 'italic', false) ? 'checked' : '') + '><span>Italic</span></label>' +
            '</div>' +
          '</div>' +
        '</div>' +
        // Inline Image for Panel 1
        '<div class="p-2 border rounded bg-slate-50">' +
          '<div class="text-xs font-semibold mb-2">Inline Image</div>' +
          '<input data-k="panels.0.inlineImage" value="' + (panel1.inlineImage || '') + '" class="w-full border rounded px-2 py-1 mb-2 text-sm" placeholder="e.g., images/inline1.jpg">' +
          '<div class="grid grid-cols-2 gap-2">' +
            '<div><label class="block text-xs">Position</label><select data-k="panels.0.inlineImagePosition" class="w-full border rounded px-2 py-1 text-xs">' + inlineImgPositionOpts.map(p => '<option ' + ((panel1.inlineImagePosition || 'top') === p ? 'selected' : '') + ' value="' + p + '">' + p + '</option>').join('') + '</select></div>' +
            '<div><label class="block text-xs">Width</label><select data-k="panels.0.inlineImageWidth" class="w-full border rounded px-2 py-1 text-xs">' + inlineImgWidthOpts.map(w => '<option ' + ((panel1.inlineImageWidth || 'medium') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') + '</select></div>' +
          '</div>' +
          '<input data-k="panels.0.inlineImageCaption" value="' + (panel1.inlineImageCaption || '') + '" class="w-full border rounded px-2 py-1 mt-2 text-sm" placeholder="Caption (optional)">' +
        '</div>' +
      '</div>' +
      // Panel 2 Body Text
      '<div class="p-3 border-2 border-purple-200 rounded-lg bg-purple-50">' +
        '<div class="font-semibold text-purple-900 mb-2">Text Panel 2</div>' +
        textToolbarHtml('panels.1.bodyText') +
        '<textarea data-k="panels.1.bodyText" rows="6" class="w-full border rounded px-2 py-1 mb-2 bg-white">' + (panel2.bodyText || '') + '</textarea>' +
        '<p class="text-xs text-purple-700 mb-2">Separate paragraphs with double line breaks</p>' +
        '<div class="grid grid-cols-2 gap-2 mb-2">' +
          '<div><label class="block text-xs mb-1">Text Width</label><select data-k="panels.1.textWidth" class="w-full border rounded px-2 py-1 text-sm">' + textWidthSelectHtml(panel2.textWidth) + '</select></div>' +
        '</div>' +
        // Body Text Style (no master/inherit controls - shared with Panel 1)
        '<div class="p-2 border rounded bg-white mb-2">' +
          '<div class="text-xs font-semibold mb-2">Body Text Style</div>' +
          '<p class="text-xs text-gray-500 mb-2 italic">Uses same master/inherit settings as Panel 1</p>' +
          '<div class="body-style-fields' + bodyStyleDimClass + '">' +
            '<div class="grid grid-cols-3 gap-2 mb-2">' +
              '<div><label class="block text-xs">Size</label><input data-k="panels.1.textStyle.size" type="number" min="12" max="36" value="' + getStyle(textStyle2, 'size', '18') + '" class="w-full border rounded px-2 py-1 text-sm"></div>' +
              '<div><label class="block text-xs">Weight</label><select data-k="panels.1.textStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' + weightOpts.map(w => '<option ' + (getStyle(textStyle2, 'weight', 'normal') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') + '</select></div>' +
              '<div><label class="block text-xs">Color</label><input type="color" data-k="panels.1.textStyle.color" value="' + getStyle(textStyle2, 'color', '#ffffff') + '" class="w-full h-7 border rounded"></div>' +
            '</div>' +
            '<div class="flex items-center gap-4">' +
              '<div class="flex-1"><label class="block text-xs">Font</label><select data-k="panels.1.textStyle.font" class="w-full border rounded px-2 py-1 text-xs">' + fontSelectHtml(getStyle(textStyle2, 'font', 'IBM Plex Sans, sans-serif')) + '</select></div>' +
              '<label class="flex items-center gap-1 text-xs pt-4"><input type="checkbox" data-k="panels.1.textStyle.italic" ' + (getStyle(textStyle2, 'italic', false) ? 'checked' : '') + '><span>Italic</span></label>' +
            '</div>' +
          '</div>' +
        '</div>' +
        // Inline Image for Panel 2
        '<div class="p-2 border rounded bg-slate-50">' +
          '<div class="text-xs font-semibold mb-2">Inline Image</div>' +
          '<input data-k="panels.1.inlineImage" value="' + (panel2.inlineImage || '') + '" class="w-full border rounded px-2 py-1 mb-2 text-sm" placeholder="e.g., images/inline2.jpg">' +
          '<div class="grid grid-cols-2 gap-2">' +
            '<div><label class="block text-xs">Position</label><select data-k="panels.1.inlineImagePosition" class="w-full border rounded px-2 py-1 text-xs">' + inlineImgPositionOpts.map(p => '<option ' + ((panel2.inlineImagePosition || 'top') === p ? 'selected' : '') + ' value="' + p + '">' + p + '</option>').join('') + '</select></div>' +
            '<div><label class="block text-xs">Width</label><select data-k="panels.1.inlineImageWidth" class="w-full border rounded px-2 py-1 text-xs">' + inlineImgWidthOpts.map(w => '<option ' + ((panel2.inlineImageWidth || 'medium') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') + '</select></div>' +
          '</div>' +
          '<input data-k="panels.1.inlineImageCaption" value="' + (panel2.inlineImageCaption || '') + '" class="w-full border rounded px-2 py-1 mt-2 text-sm" placeholder="Caption (optional)">' +
        '</div>' +
      '</div>';

    // ========== DROP CAP & FIRST LINE ==========
    const dropCapFieldsDisabled = b._inheritDropCapStyle === true && !b._isDropCapStyleMaster;
    const dropCapStyleDimClass = dropCapFieldsDisabled ? ' opacity-50 pointer-events-none' : '';

    const dropCapContent =
      // Panel 1 Drop Cap
      '<div class="p-3 mb-3 border-2 border-blue-200 rounded-lg bg-blue-50">' +
        '<label class="flex items-center gap-2 font-semibold text-blue-900 mb-3">' +
          '<input type="checkbox" data-k="panels.0.showDropCap" ' + (panel1.showDropCap ? 'checked' : '') + '>' +
          '<span>Text Panel 1</span>' +
        '</label>' +
        // Master/inherit controls (always clickable)
        '<div class="mb-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs">' +
          '<label class="flex items-center gap-2 mb-2">' +
            '<input type="checkbox" data-k="_isDropCapStyleMaster" class="dropcap-style-master" ' + (b._isDropCapStyleMaster ? 'checked' : '') + '>' +
            '<span>Set styling for all blocks</span>' +
          '</label>' +
          '<label class="flex items-center gap-2">' +
            '<input type="checkbox" data-k="_inheritDropCapStyle" class="dropcap-style-inherit" ' + (b._inheritDropCapStyle === true ? 'checked' : '') + '>' +
            '<span class="text-gray-600">Inherit styling from master</span>' +
          '</label>' +
        '</div>' +
        // Style fields (dimmed if inheriting)
        '<div class="dropcap-style-fields' + dropCapStyleDimClass + '">' +
          '<div class="grid grid-cols-2 gap-3 mb-3">' +
            '<div><label class="block text-xs mb-1">Drop Cap Color</label><input type="color" data-k="panels.0.dropCapColor" value="' + (panel1.dropCapColor || '#fbbf24') + '" class="w-full h-8 border rounded"></div>' +
            '<div><label class="block text-xs mb-1">Drop Cap Size (px)</label><input data-k="panels.0.dropCapSize" type="number" min="36" max="96" value="' + (panel1.dropCapSize || '56') + '" class="w-full border rounded px-2 py-1"></div>' +
          '</div>' +
          '<div class="text-xs font-semibold mb-2">First Line Style</div>' +
          '<div class="grid grid-cols-3 gap-2">' +
            '<div><label class="block text-xs mb-1">Size (px)</label><input data-k="panels.0.firstLineSize" type="number" min="18" max="36" value="' + (panel1.firstLineSize || '24') + '" class="w-full border rounded px-2 py-1"></div>' +
            '<div><label class="block text-xs mb-1">Weight</label><select data-k="panels.0.firstLineWeight" class="w-full border rounded px-2 py-1 text-xs">' + ['normal', '500', '600', 'bold'].map(w => '<option ' + ((panel1.firstLineWeight || '600') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') + '</select></div>' +
            '<div><label class="block text-xs mb-1">Color</label><input type="color" data-k="panels.0.firstLineColor" value="' + (panel1.firstLineColor || '#ffffff') + '" class="w-full h-8 border rounded"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      // Panel 2 Drop Cap
      '<div class="p-3 border-2 border-purple-200 rounded-lg bg-purple-50">' +
        '<label class="flex items-center gap-2 font-semibold text-purple-900 mb-3">' +
          '<input type="checkbox" data-k="panels.1.showDropCap" ' + (panel2.showDropCap ? 'checked' : '') + '>' +
          '<span>Text Panel 2</span>' +
        '</label>' +
        '<p class="text-xs text-gray-500 mb-2 italic">Uses same master/inherit settings as Panel 1</p>' +
        // Style fields (dimmed if inheriting)
        '<div class="dropcap-style-fields' + dropCapStyleDimClass + '">' +
          '<div class="grid grid-cols-2 gap-3 mb-3">' +
            '<div><label class="block text-xs mb-1">Drop Cap Color</label><input type="color" data-k="panels.1.dropCapColor" value="' + (panel2.dropCapColor || '#fbbf24') + '" class="w-full h-8 border rounded"></div>' +
            '<div><label class="block text-xs mb-1">Drop Cap Size (px)</label><input data-k="panels.1.dropCapSize" type="number" min="36" max="96" value="' + (panel2.dropCapSize || '56') + '" class="w-full border rounded px-2 py-1"></div>' +
          '</div>' +
          '<div class="text-xs font-semibold mb-2">First Line Style</div>' +
          '<div class="grid grid-cols-3 gap-2">' +
            '<div><label class="block text-xs mb-1">Size (px)</label><input data-k="panels.1.firstLineSize" type="number" min="18" max="36" value="' + (panel1.firstLineSize || '24') + '" class="w-full border rounded px-2 py-1"></div>' +
            '<div><label class="block text-xs mb-1">Weight</label><select data-k="panels.1.firstLineWeight" class="w-full border rounded px-2 py-1 text-xs">' + ['normal', '500', '600', 'bold'].map(w => '<option ' + ((panel2.firstLineWeight || '600') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') + '</select></div>' +
            '<div><label class="block text-xs mb-1">Color</label><input type="color" data-k="panels.1.firstLineColor" value="' + (panel2.firstLineColor || '#ffffff') + '" class="w-full h-8 border rounded"></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // ========== PULL QUOTE ==========
    const pullQuoteStyle1 = panel1.pullQuoteStyle || {};
    const pullQuoteStyle2 = panel2.pullQuoteStyle || {};
    const pullQuoteFieldsDisabled = b._inheritPullQuoteStyle === true && !b._isPullQuoteStyleMaster;

    const pullQuoteContent =
      '<div class="mb-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs">' +
        '<label class="flex items-center gap-2 mb-2">' +
          '<input type="checkbox" data-k="_isPullQuoteStyleMaster" class="pullquote-style-master" ' + (b._isPullQuoteStyleMaster ? 'checked' : '') + '>' +
          '<span>Set styling for all blocks</span>' +
        '</label>' +
        '<label class="flex items-center gap-2">' +
          '<input type="checkbox" data-k="_inheritPullQuoteStyle" class="pullquote-style-inherit" ' + (b._inheritPullQuoteStyle === true ? 'checked' : '') + '>' +
          '<span class="text-gray-600">Inherit styling from master</span>' +
        '</label>' +
      '</div>' +
      '<div class="pullquote-style-fields' + (pullQuoteFieldsDisabled ? ' opacity-50 pointer-events-none' : '') + '">' +
      // Panel 1 Pull Quote
      '<div class="p-3 mb-3 border-2 border-blue-200 rounded-lg bg-blue-50">' +
        '<div class="font-semibold text-blue-900 mb-2">Text Panel 1 Pull Quote</div>' +
        '<textarea data-k="panels.0.pullQuote" rows="2" class="w-full border rounded px-2 py-1 mb-2 bg-white" placeholder="Enter pull quote text...">' + (panel1.pullQuote || '') + '</textarea>' +
        '<div class="mb-2"><label class="block text-xs mb-1">Position (after paragraph #)</label><input type="number" data-k="panels.0.pullQuotePosition" min="0" max="20" value="' + (panel1.pullQuotePosition || '0') + '" class="w-full border rounded px-2 py-1 text-sm" placeholder="0 = hidden"><p class="text-xs text-slate-500 mt-1">0 = don\'t show, 1 = after first paragraph, etc.</p></div>' +
        '<div class="p-2 border rounded bg-white">' +
          '<div class="text-xs font-semibold mb-2">Pull Quote Style</div>' +
          '<div class="grid grid-cols-3 gap-2 mb-2">' +
            '<div><label class="block text-xs">Size</label><input data-k="panels.0.pullQuoteStyle.size" type="number" min="14" max="48" value="' + getStyle(pullQuoteStyle1, 'size', '24') + '" class="w-full border rounded px-2 py-1 text-sm"></div>' +
            '<div><label class="block text-xs">Weight</label><select data-k="panels.0.pullQuoteStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' + ['normal', '500', '600', 'bold'].map(w => '<option ' + (getStyle(pullQuoteStyle1, 'weight', '500') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') + '</select></div>' +
            '<div><label class="block text-xs">Color</label><input type="color" data-k="panels.0.pullQuoteStyle.color" value="' + getStyle(pullQuoteStyle1, 'color', '#ffffff') + '" class="w-full h-7 border rounded"></div>' +
          '</div>' +
          '<div class="grid grid-cols-2 gap-2 mb-2">' +
            '<div><label class="block text-xs">Background</label><input type="color" data-k="panels.0.pullQuoteStyle.bgColor" value="' + getStyle(pullQuoteStyle1, 'bgColor', '#3d3314') + '" class="w-full h-7 border rounded"></div>' +
            '<div><label class="block text-xs">Border</label><input type="color" data-k="panels.0.pullQuoteStyle.borderColor" value="' + getStyle(pullQuoteStyle1, 'borderColor', '#fbbf24') + '" class="w-full h-7 border rounded"></div>' +
          '</div>' +
          '<div class="flex items-center gap-4">' +
            '<div class="flex-1"><label class="block text-xs">Font</label><select data-k="panels.0.pullQuoteStyle.font" class="w-full border rounded px-2 py-1 text-xs">' + fontSelectHtml(getStyle(pullQuoteStyle1, 'font', 'IBM Plex Sans, sans-serif')) + '</select></div>' +
            '<label class="flex items-center gap-1 text-xs pt-4"><input type="checkbox" data-k="panels.0.pullQuoteStyle.italic" ' + (getStyle(pullQuoteStyle1, 'italic', false) ? 'checked' : '') + '><span>Italic</span></label>' +
          '</div>' +
        '</div>' +
      '</div>' +
      // Panel 2 Pull Quote
      '<div class="p-3 border-2 border-purple-200 rounded-lg bg-purple-50">' +
        '<div class="font-semibold text-purple-900 mb-2">Text Panel 2 Pull Quote</div>' +
        '<textarea data-k="panels.1.pullQuote" rows="2" class="w-full border rounded px-2 py-1 mb-2 bg-white" placeholder="Enter pull quote text...">' + (panel2.pullQuote || '') + '</textarea>' +
        '<div class="mb-2"><label class="block text-xs mb-1">Position (after paragraph #)</label><input type="number" data-k="panels.1.pullQuotePosition" min="0" max="20" value="' + (panel2.pullQuotePosition || '0') + '" class="w-full border rounded px-2 py-1 text-sm" placeholder="0 = hidden"><p class="text-xs text-slate-500 mt-1">0 = don\'t show, 1 = after first paragraph, etc.</p></div>' +
        '<div class="p-2 border rounded bg-white">' +
          '<div class="text-xs font-semibold mb-2">Pull Quote Style</div>' +
          '<div class="grid grid-cols-3 gap-2 mb-2">' +
            '<div><label class="block text-xs">Size</label><input data-k="panels.1.pullQuoteStyle.size" type="number" min="14" max="48" value="' + getStyle(pullQuoteStyle2, 'size', '24') + '" class="w-full border rounded px-2 py-1 text-sm"></div>' +
            '<div><label class="block text-xs">Weight</label><select data-k="panels.1.pullQuoteStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' + ['normal', '500', '600', 'bold'].map(w => '<option ' + (getStyle(pullQuoteStyle2, 'weight', '500') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') + '</select></div>' +
            '<div><label class="block text-xs">Color</label><input type="color" data-k="panels.1.pullQuoteStyle.color" value="' + getStyle(pullQuoteStyle2, 'color', '#ffffff') + '" class="w-full h-7 border rounded"></div>' +
          '</div>' +
          '<div class="grid grid-cols-2 gap-2 mb-2">' +
            '<div><label class="block text-xs">Background</label><input type="color" data-k="panels.1.pullQuoteStyle.bgColor" value="' + getStyle(pullQuoteStyle2, 'bgColor', '#3d3314') + '" class="w-full h-7 border rounded"></div>' +
            '<div><label class="block text-xs">Border</label><input type="color" data-k="panels.1.pullQuoteStyle.borderColor" value="' + getStyle(pullQuoteStyle2, 'borderColor', '#fbbf24') + '" class="w-full h-7 border rounded"></div>' +
          '</div>' +
          '<div class="flex items-center gap-4">' +
            '<div class="flex-1"><label class="block text-xs">Font</label><select data-k="panels.1.pullQuoteStyle.font" class="w-full border rounded px-2 py-1 text-xs">' + fontSelectHtml(getStyle(pullQuoteStyle2, 'font', 'IBM Plex Sans, sans-serif')) + '</select></div>' +
            '<label class="flex items-center gap-1 text-xs pt-4"><input type="checkbox" data-k="panels.1.pullQuoteStyle.italic" ' + (getStyle(pullQuoteStyle2, 'italic', false) ? 'checked' : '') + '><span>Italic</span></label>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '</div>';

    // Assemble all sections (alphabetically ordered)
    return labelFieldHtml(b.label, 'e.g., Journey Begins, Summit Approach...') +
      collapsibleSection('⚙️ Block Settings', blockSettingsContent, true) +
      collapsibleSection('📄 Body Text', bodyTextContent, true) +
      collapsibleSection('🔤 Drop Cap & First Line', dropCapContent, true) +
      collapsibleSection('🖼️ Media', mediaContent, true) +
      collapsibleSection('💬 Pull Quote', pullQuoteContent, true) +
      collapsibleSection('📰 Subhead', subheadContent, true);
  },

  preview({ block, project, blocks = [] }) {
    const b = block;
    const panels = b.panels || [];
    const panel1 = panels[0] || {};
    const panel2 = panels[1] || {};
    const isReversed = b.startMediaRight || false;
    const bgColor = getEffectiveBgColor(b, blocks);

    const pt = paddingClassMap[b.paddingTop || 'medium'].pt;
    const pb = paddingClassMap[b.paddingBottom || 'medium'].pb;

    // Check for inherited styles
    let inheritedSubheadStyle = null;
    if (b._inheritSubheadStyle !== false) {
      const masterBlock = blocks.find(blk => blk._isSubheadStyleMaster && blk !== b);
      if (masterBlock && masterBlock.panels && masterBlock.panels[0] && masterBlock.panels[0].subheadStyle) {
        inheritedSubheadStyle = masterBlock.panels[0].subheadStyle;
      }
    }

    let inheritedBodyStyle = null;
    if (b._inheritBodyStyle !== false) {
      const masterBlock = blocks.find(blk => blk._isBodyStyleMaster && blk !== b);
      if (masterBlock) {
        // Check for textStyle in panels (split-panel) or directly on block (text block)
        if (masterBlock.panels && masterBlock.panels[0] && masterBlock.panels[0].textStyle) {
          inheritedBodyStyle = masterBlock.panels[0].textStyle;
        } else if (masterBlock.textStyle) {
          inheritedBodyStyle = masterBlock.textStyle;
        }
      }
    }

    // Drop cap inheritance: external master OR Panel 1 as internal master
    let externalDropCapSettings = null;
    if (b._inheritDropCapStyle === true && !b._isDropCapStyleMaster) {
      const masterBlock = blocks.find(blk => blk._isDropCapStyleMaster && blk !== b);
      if (masterBlock) {
        // Check for drop cap settings in panels (split-panel) or directly on block (text)
        const masterDropCap = masterBlock.panels && masterBlock.panels[0] ? masterBlock.panels[0] : masterBlock;
        externalDropCapSettings = {
          dropCapColor: masterDropCap.dropCapColor,
          dropCapSize: masterDropCap.dropCapSize,
          firstLineSize: masterDropCap.firstLineSize,
          firstLineWeight: masterDropCap.firstLineWeight,
          firstLineColor: masterDropCap.firstLineColor
        };
      }
    }
    // Panel 1's settings for internal inheritance (Panel 2 inherits from Panel 1)
    const panel1DropCapSettings = {
      dropCapColor: panel1.dropCapColor,
      dropCapSize: panel1.dropCapSize,
      firstLineSize: panel1.firstLineSize,
      firstLineWeight: panel1.firstLineWeight,
      firstLineColor: panel1.firstLineColor
    };

    // Generate unique ID for this block
    const blockId = 'split-preview-' + Math.random().toString(36).substr(2, 9);

    // Build panel content
    const buildPanelContent = (panel, panelIdx) => {
      const effectiveSubheadStyle = inheritedSubheadStyle || panel.subheadStyle;
      const subheadStyle = buildInlineStyle(effectiveSubheadStyle, { color: '#d1d5db', size: '24', font: 'IBM Plex Sans, sans-serif', weight: 'normal' });
      const effectiveBodyStyle = inheritedBodyStyle || panel.textStyle;
      const textStyleStr = buildInlineStyle(effectiveBodyStyle, { color: '#ffffff', size: '18', font: 'IBM Plex Sans, sans-serif', weight: 'normal' });

      const subheadHtml = panel.subhead ? '<h3 class="text-left mb-6" style="' + subheadStyle + '">' + panel.subhead + '</h3>' : '';

      // Build paragraphs with pull quote
      const paragraphs = (panel.bodyText || '').split(/\n\n+/).filter(p => p.trim());
      const pullQuotePosition = parseInt(panel.pullQuotePosition || '0');
      const pullQuoteStyle = panel.pullQuoteStyle || {};

      let pullQuoteHtml = '';
      if (panel.pullQuote && pullQuotePosition > 0) {
        const pqStyle = buildInlineStyle(pullQuoteStyle, { color: '#ffffff', size: '24', font: 'IBM Plex Sans, sans-serif', weight: '500' });
        const pqBgColor = pullQuoteStyle.bgColor || '#3d3314';
        const pqBorderColor = pullQuoteStyle.borderColor || '#fbbf24';
        pullQuoteHtml = '<div style="background:' + pqBgColor + ';padding:30px 40px;border-left:4px solid ' + pqBorderColor + ';margin:30px 0;">' +
          '<p style="' + pqStyle + 'margin:0;">' + processBodyText(panel.pullQuote || '') + '</p></div>';
      }

      const dropCapClass = 'split-panel-drop-cap-' + panelIdx;
      let bodyParts = [];
      paragraphs.forEach((para, idx) => {
        const pClass = (idx === 0 && panel.showDropCap) ? dropCapClass : '';
        bodyParts.push('<p class="mb-4 ' + pClass + '">' + processBodyText(para) + '</p>');
        if (idx + 1 === pullQuotePosition && pullQuoteHtml) {
          bodyParts.push(pullQuoteHtml);
        }
      });

      let dropCapCss = '';
      if (panel.showDropCap) {
        // Determine effective drop cap settings:
        // - If external master: use external settings
        // - If this block is master or inheriting (no external): Panel 2 uses Panel 1's settings
        // - Otherwise: use panel's own settings
        let effectiveDropCap;
        if (externalDropCapSettings) {
          effectiveDropCap = externalDropCapSettings;
        } else if ((b._isDropCapStyleMaster || b._inheritDropCapStyle === true) && panelIdx === 1) {
          effectiveDropCap = panel1DropCapSettings;
        } else {
          effectiveDropCap = panel;
        }
        const dropCapSize = effectiveDropCap.dropCapSize || '56';
        const dropCapLineHeight = Math.floor(parseInt(dropCapSize) * 0.85);
        dropCapCss = '<style>.' + dropCapClass + '::first-letter{float:left;font-size:' + dropCapSize + 'px;line-height:' + dropCapLineHeight + 'px;padding-right:10px;margin-top:2px;color:' + (effectiveDropCap.dropCapColor || '#fbbf24') + ';font-weight:bold;}' +
          '.' + dropCapClass + '::first-line{font-size:' + (effectiveDropCap.firstLineSize || '24') + 'px;font-weight:' + (effectiveDropCap.firstLineWeight || '600') + ';color:' + (effectiveDropCap.firstLineColor || '#ffffff') + ';}</style>';
      }

      // Inline image
      let inlineImageHtml = '';
      if (panel.inlineImage) {
        const widthMode = panel.inlineImageWidth || 'medium';
        const imgWidthStyle = widthMode === 'small' ? 'max-width:24rem;' : widthMode === 'medium' ? 'max-width:40rem;' : '';
        const caption = panel.inlineImageCaption ? '<p class="text-sm text-slate-400 mt-2 text-center italic">' + panel.inlineImageCaption + '</p>' : '';
        inlineImageHtml = '<div class="mt-10 mb-6 mx-auto" style="' + imgWidthStyle + '">' +
          '<img src="' + resolvePreviewPath(panel.inlineImage, project) + '" class="w-full rounded" alt="">' + caption + '</div>';
      }

      const pos = panel.inlineImagePosition || 'top';
      let textContent = subheadHtml;
      if (pos === 'top') {
        textContent += inlineImageHtml;
      }
      textContent += '<div class="leading-relaxed" style="' + textStyleStr + '">' + bodyParts.join('') + '</div>';
      if (pos === 'bottom') {
        textContent += inlineImageHtml;
      } else if (pos === 'middle') {
        // Already handled above in position logic
      }

      const textWidthClass = textWidthClassMap[panel.textWidth || 'medium'];
      return dropCapCss + '<div class="w-full relative z-20 ' + textWidthClass + '">' + textContent + '</div>';
    };

    // Build media HTML
    const buildMediaHtml = (mediaPath, videoPath) => {
      const isVid = videoPath && videoPath.trim();
      return isVid
        ? '<video class="absolute inset-0 w-full h-full object-cover" autoplay muted loop playsinline src="' + resolvePreviewPath(videoPath, project) + '"></video>'
        : '<img class="absolute inset-0 w-full h-full object-cover" src="' + resolvePreviewPath(mediaPath, project) + '" alt="">';
    };

    // Desktop panels
    const desktopPanelsHtml = [0, 1].map((panelIdx) => {
      const panel = panelIdx === 0 ? panel1 : panel2;
      const mediaPath = panelIdx === 0 ? b.media1 : b.media2;
      const videoPath = panelIdx === 0 ? b.media1Video : b.media2Video;
      const isImageLeft = (panelIdx % 2 === 0) !== isReversed;

      const imageSide = buildMediaHtml(mediaPath, videoPath);
      const textContent = buildPanelContent(panel, panelIdx);

      const textSide = '<div class="flex items-center justify-center p-12 min-h-screen ' + pt + ' ' + pb + '" style="background-color:' + bgColor + ';">' + textContent + '</div>';
      const imageContainer = '<div class="relative h-screen">' + imageSide + '</div>';

      const layout = isImageLeft
        ? '<div class="w-1/2">' + imageContainer + '</div><div class="w-1/2">' + textSide + '</div>'
        : '<div class="w-1/2">' + textSide + '</div><div class="w-1/2">' + imageContainer + '</div>';

      return '<div class="flex min-h-screen">' + layout + '</div>';
    }).join('');

    // Mobile panels
    const mobilePanelsHtml = [0, 1].map((panelIdx) => {
      const panel = panelIdx === 0 ? panel1 : panel2;
      const mediaPath = panelIdx === 0 ? b.media1 : b.media2;
      const videoPath = panelIdx === 0 ? b.media1Video : b.media2Video;
      const isVid = videoPath && videoPath.trim();

      const mediaHtml = isVid
        ? '<video class="split-mobile-media" autoplay muted loop playsinline src="' + resolvePreviewPath(videoPath, project) + '"></video>'
        : '<img class="split-mobile-media" src="' + resolvePreviewPath(mediaPath, project) + '" alt="">';

      const textContent = buildPanelContent(panel, panelIdx);
      const textWidthClass = textWidthClassMap[panel.textWidth || 'medium'];

      return '<div class="split-mobile-panel" data-panel="' + panelIdx + '">' +
        '<div class="split-mobile-panel-image">' + mediaHtml + '</div>' +
        '<div class="split-mobile-panel-text ' + pt + ' ' + pb + '" style="background-color:' + bgColor + ';">' +
          '<div class="split-mobile-text-inner ' + textWidthClass + '">' + textContent + '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    const mobileHtml = '<div class="split-mobile-wrapper split-mobile-only" id="' + blockId + '-mobile" style="background-color:' + bgColor + ';">' +
      mobilePanelsHtml +
    '</div>';

    return '<div class="split-desktop-only">' + desktopPanelsHtml + '</div>' + mobileHtml;
  },

  exportHTML({ block, blocks = [] }) {
    const b = block;
    const panels = b.panels || [];
    const panel1 = panels[0] || {};
    const panel2 = panels[1] || {};
    const isReversed = b.startMediaRight || false;
    const bgColor = getEffectiveBgColor(b, blocks);

    const blockId = 'split-panel-' + Math.random().toString(36).substr(2, 9);

    const pt = paddingClassMap[b.paddingTop || 'medium'].pt;
    const pb = paddingClassMap[b.paddingBottom || 'medium'].pb;

    // Check for inherited styles
    let inheritedSubheadStyle = null;
    if (b._inheritSubheadStyle !== false) {
      const masterBlock = blocks.find(blk => blk._isSubheadStyleMaster && blk !== b);
      if (masterBlock && masterBlock.panels && masterBlock.panels[0] && masterBlock.panels[0].subheadStyle) {
        inheritedSubheadStyle = masterBlock.panels[0].subheadStyle;
      }
    }

    let inheritedBodyStyle = null;
    if (b._inheritBodyStyle !== false) {
      const masterBlock = blocks.find(blk => blk._isBodyStyleMaster && blk !== b);
      if (masterBlock) {
        // Check for textStyle in panels (split-panel) or directly on block (text block)
        if (masterBlock.panels && masterBlock.panels[0] && masterBlock.panels[0].textStyle) {
          inheritedBodyStyle = masterBlock.panels[0].textStyle;
        } else if (masterBlock.textStyle) {
          inheritedBodyStyle = masterBlock.textStyle;
        }
      }
    }

    // Drop cap inheritance: external master OR Panel 1 as internal master
    let externalDropCapSettings = null;
    if (b._inheritDropCapStyle === true && !b._isDropCapStyleMaster) {
      const masterBlock = blocks.find(blk => blk._isDropCapStyleMaster && blk !== b);
      if (masterBlock) {
        // Check for drop cap settings in panels (split-panel) or directly on block (text)
        const masterDropCap = masterBlock.panels && masterBlock.panels[0] ? masterBlock.panels[0] : masterBlock;
        externalDropCapSettings = {
          dropCapColor: masterDropCap.dropCapColor,
          dropCapSize: masterDropCap.dropCapSize,
          firstLineSize: masterDropCap.firstLineSize,
          firstLineWeight: masterDropCap.firstLineWeight,
          firstLineColor: masterDropCap.firstLineColor
        };
      }
    }
    // Panel 1's settings for internal inheritance (Panel 2 inherits from Panel 1)
    const panel1DropCapSettings = {
      dropCapColor: panel1.dropCapColor,
      dropCapSize: panel1.dropCapSize,
      firstLineSize: panel1.firstLineSize,
      firstLineWeight: panel1.firstLineWeight,
      firstLineColor: panel1.firstLineColor
    };

    // Collect all drop cap styles
    let allDropCapCss = '';

    // Build panel content for export
    const buildPanelContent = (panel, panelIdx) => {
      const effectiveSubheadStyle = inheritedSubheadStyle || panel.subheadStyle;
      const subheadStyle = buildInlineStyle(effectiveSubheadStyle, { color: '#d1d5db', size: '24', font: 'IBM Plex Sans, sans-serif', weight: 'normal' });
      const effectiveBodyStyle = inheritedBodyStyle || panel.textStyle;
      const textStyleStr = buildInlineStyle(effectiveBodyStyle, { color: '#ffffff', size: '18', font: 'IBM Plex Sans, sans-serif', weight: 'normal' });

      const subheadHtml = panel.subhead ? '<h3 class="text-left mb-6" style="' + subheadStyle + '">' + String(panel.subhead) + '</h3>' : '';

      // Build paragraphs with pull quote
      const paragraphs = String(panel.bodyText || '').split(/\n\n+/).filter(p => p.trim());
      const pullQuotePosition = parseInt(panel.pullQuotePosition || '0');
      const pullQuoteStyle = panel.pullQuoteStyle || {};

      let pullQuoteHtml = '';
      if (panel.pullQuote && pullQuotePosition > 0) {
        const pqStyle = buildInlineStyle(pullQuoteStyle, { color: '#ffffff', size: '24', font: 'IBM Plex Sans, sans-serif', weight: '500' });
        const pqBgColor = pullQuoteStyle.bgColor || '#3d3314';
        const pqBorderColor = pullQuoteStyle.borderColor || '#fbbf24';
        pullQuoteHtml = '<div style="background:' + pqBgColor + ';padding:30px 40px;border-left:4px solid ' + pqBorderColor + ';margin:30px 0;">' +
          '<p style="' + pqStyle + 'margin:0;">' + processBodyText(panel.pullQuote || '', { brTag: '<br/>' }) + '</p></div>';
      }

      const dropCapClass = 'split-panel-drop-cap-' + panelIdx;
      let bodyParts = [];
      paragraphs.forEach((para, idx) => {
        const pClass = (idx === 0 && panel.showDropCap) ? dropCapClass : '';
        bodyParts.push('<p class="mb-4 ' + pClass + '">' + processBodyText(para, { brTag: '<br/>' }) + '</p>');
        if (idx + 1 === pullQuotePosition && pullQuoteHtml) {
          bodyParts.push(pullQuoteHtml);
        }
      });

      if (panel.showDropCap) {
        // Determine effective drop cap settings:
        // - If external master: use external settings
        // - If this block is master or inheriting (no external): Panel 2 uses Panel 1's settings
        // - Otherwise: use panel's own settings
        let effectiveDropCap;
        if (externalDropCapSettings) {
          effectiveDropCap = externalDropCapSettings;
        } else if ((b._isDropCapStyleMaster || b._inheritDropCapStyle === true) && panelIdx === 1) {
          effectiveDropCap = panel1DropCapSettings;
        } else {
          effectiveDropCap = panel;
        }
        const dropCapSize = effectiveDropCap.dropCapSize || '56';
        const dropCapLineHeight = Math.floor(parseInt(dropCapSize) * 0.85);
        allDropCapCss += '.' + dropCapClass + '::first-letter{float:left;font-size:' + dropCapSize + 'px;line-height:' + dropCapLineHeight + 'px;padding-right:10px;margin-top:2px;color:' + (effectiveDropCap.dropCapColor || '#fbbf24') + ';font-weight:bold;}' +
          '.' + dropCapClass + '::first-line{font-size:' + (effectiveDropCap.firstLineSize || '24') + 'px;font-weight:' + (effectiveDropCap.firstLineWeight || '600') + ';color:' + (effectiveDropCap.firstLineColor || '#ffffff') + ';}';
      }

      // Inline image
      let inlineImageHtml = '';
      if (panel.inlineImage) {
        const widthMode = panel.inlineImageWidth || 'medium';
        const breakoutClass = widthMode === 'large' ? 'breakout-large' : widthMode === 'full' ? 'fullbleed' : '';
        const imgWidthStyle = widthMode === 'small' ? 'max-width:24rem;' : widthMode === 'medium' ? 'max-width:40rem;' : '';
        const caption = panel.inlineImageCaption ? '<p class="text-sm text-slate-400 mt-2 text-center italic">' + String(panel.inlineImageCaption) + '</p>' : '';
        inlineImageHtml = '<div class="mt-10 mb-6 mx-auto ' + breakoutClass + '" style="' + imgWidthStyle + '">' +
          '<img src="' + resolveExportPath(panel.inlineImage) + '" class="w-full rounded" alt="">' + caption + '</div>';
      }

      const pos = panel.inlineImagePosition || 'top';
      let textContent = subheadHtml;
      if (pos === 'top') {
        textContent += inlineImageHtml;
      }
      textContent += '<div class="leading-relaxed" style="' + textStyleStr + '">' + bodyParts.join('') + '</div>';
      if (pos === 'bottom') {
        textContent += inlineImageHtml;
      }

      return textContent;
    };

    // Build media HTML for export
    const buildMediaHtml = (mediaPath, videoPath, videoId) => {
      const isVid = videoPath && videoPath.trim();
      if (isVid) {
        return '<div style="position:relative;width:100%;height:100%;"><video id="' + videoId + '" autoplay muted loop playsinline src="' + resolveExportPath(videoPath) + '" style="width:100%;height:100%;object-fit:cover;"></video>' +
           '<button onclick="toggleMute(\'' + videoId + '\', this)" style="position:absolute;bottom:20px;left:20px;width:44px;height:44px;background:rgba(0,0,0,0.7);border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:100;" aria-label="Toggle mute">' +
           '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>' +
           '</button></div>';
      }
      return '<img src="' + resolveExportPath(mediaPath) + '" alt="">';
    };

    // Desktop panels for export
    const desktopPanelsHtml = [0, 1].map((panelIdx) => {
      const panel = panelIdx === 0 ? panel1 : panel2;
      const mediaPath = panelIdx === 0 ? b.media1 : b.media2;
      const videoPath = panelIdx === 0 ? b.media1Video : b.media2Video;
      const isImageLeft = (panelIdx % 2 === 0) !== isReversed;
      const videoId = blockId + '-video-' + panelIdx;

      const imageSide = buildMediaHtml(mediaPath, videoPath, videoId);
      const textContent = buildPanelContent(panel, panelIdx);
      const textWidthClass = textWidthClassMap[panel.textWidth || 'medium'];

      const imageContainer = '<div class="split-image-sticky"><div class="split-image-content">' + imageSide + '</div></div>';
      const textContainer = '<div class="split-text-scroll ' + pt + ' ' + pb + '" style="background-color:' + bgColor + ';">' +
        '<div class="split-text-inner ' + textWidthClass + '">' + textContent + '</div></div>';

      const layout = isImageLeft ? imageContainer + textContainer : textContainer + imageContainer;

      return '<section class="split-panel-row" style="background-color:' + bgColor + ';">' + layout + '</section>';
    }).join('');

    const reversedClass = isReversed ? ' split-panel-reversed' : '';
    const desktopHtml = '<div class="split-panel-wrapper split-desktop-only' + reversedClass + '" id="' + blockId + '" style="background-color:' + bgColor + ';">' +
      '<div class="split-panel-container" style="background-color:' + bgColor + ';">' + desktopPanelsHtml + '</div></div>';

    // Mobile panels for export
    const mobilePanelsHtml = [0, 1].map((panelIdx) => {
      const panel = panelIdx === 0 ? panel1 : panel2;
      const mediaPath = panelIdx === 0 ? b.media1 : b.media2;
      const videoPath = panelIdx === 0 ? b.media1Video : b.media2Video;
      const isVid = videoPath && videoPath.trim();
      const videoId = blockId + '-mobile-video-' + panelIdx;

      let mediaHtml;
      if (isVid) {
        const muteButtonSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>';
        mediaHtml = '<video id="' + videoId + '" class="split-mobile-media" autoplay muted loop playsinline src="' + resolveExportPath(videoPath) + '"></video>' +
          '<button onclick="toggleMute(\'' + videoId + '\', this)" class="mute-btn mobile-mute-btn" aria-label="Toggle mute">' + muteButtonSvg + '</button>';
      } else {
        mediaHtml = '<img class="split-mobile-media" src="' + resolveExportPath(mediaPath) + '" alt="">';
      }

      const textContent = buildPanelContent(panel, panelIdx);
      const textWidthClass = textWidthClassMap[panel.textWidth || 'medium'];

      return '<div class="split-mobile-panel" data-panel="' + panelIdx + '">' +
        '<div class="split-mobile-panel-image">' + mediaHtml + '</div>' +
        '<div class="split-mobile-panel-text ' + pt + ' ' + pb + '" style="background-color:' + bgColor + ';">' +
          '<div class="split-mobile-text-inner ' + textWidthClass + '">' + textContent + '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    const mobileHtml = '<div class="split-mobile-wrapper split-mobile-only" id="' + blockId + '-mobile" style="background-color:' + bgColor + ';">' +
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

      if (!block.panels) block.panels = [{}, {}];
      if (!block.panels[panelIndex]) block.panels[panelIndex] = {};

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
