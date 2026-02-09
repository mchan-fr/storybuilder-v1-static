import { resolvePreviewPath, resolveExportPath, processBodyText, textToolbarHtml, getLinkStyles, bodyFonts, fontSelectHtml, globalBodyStyle } from '../utils.js';

export const TextBlock = {
  type: 'text',
  title: 'Text only',

  defaults() {
    return {
      type: 'text',
      label: '',

      // Byline (optional)
      showByline: false,
      showReadTime: true,
      bylineText: 'By Author Name',
      bylineDateline: '',
      bylineDate: '',
      bylineStyle: {
        size: '16',
        weight: 'normal',
        color: '#374151',
        font: 'system-ui'
      },
      datelineStyle: {
        size: '14',
        weight: 'normal',
        color: '#6b7280'
      },

      // Subhead (optional)
      subhead: '',
      subheadStyle: {
        size: '24',
        weight: 'normal',
        italic: false,
        color: '#6b7280',
        font: 'system-ui'
      },

      // Pull quote (optional)
      pullQuote: '',
      pullQuotePosition: '0',
      pullQuoteStyle: {
        size: '24',
        weight: '500',
        italic: false,
        color: '#374151',
        font: 'system-ui',
        leading: '1.8',
        bgColor: '#f3f4f6',
        borderColor: '#3b82f6'
      },

      // Body text with drop cap
      text: 'Paragraph text...',
      textWidth: 'medium',

      // Drop cap settings
      showDropCap: false,
      dropCapColor: '#3b82f6',
      dropCapSize: '56',

      // First line style
      firstLineSize: '20',
      firstLineWeight: '600',
      firstLineColor: '#111827',

      // Body text style
      textStyle: {
        size: '16',
        weight: 'normal',
        color: '#374151',
        font: 'system-ui',
        leading: '1.7'
      },

      // Inline image
      inlineImage: '',
      inlineImagePosition: 'top',
      inlineImageWidth: 'medium',
      inlineImageCaption: '',

      // Block settings
      bgColor: '#ffffff',
      paddingTop: 'medium',
      paddingBottom: 'medium',
      expectedViewTime: null
    };
  },

  editor({ block }) {
    const b = block;
    const textWidthOpts = ['extra-narrow', 'narrow', 'medium', 'wide'];
    const paddingSizes = [
      { value: 'none', label: 'None (0px)' },
      { value: 'tiny', label: 'Tiny (8px)' },
      { value: 'extra-small', label: 'Extra Small (16px)' },
      { value: 'small', label: 'Small (32px)' },
      { value: 'medium', label: 'Medium (64px)' },
      { value: 'large', label: 'Large (96px)' }
    ];
    const weightOpts = ['normal', '500', '600', 'bold'];
    const posOpts = ['top', 'middle', 'bottom'];
    const imgWidthOpts = ['small', 'medium', 'large', 'full'];

    const getStyle = (obj, prop, fallback) => (obj && obj[prop]) || fallback;
    const subheadStyle = b.subheadStyle || {};
    const pullQuoteStyle = b.pullQuoteStyle || {};
    const textStyle = b.textStyle || {};

    // Build pull quote position options
    const paragraphs = (b.text || '').split(/\n\n+/).filter(p => p.trim());
    const numParagraphs = Math.max(paragraphs.length, 10);
    let pullQuotePositionOptions = '<option value="0">Don\'t show pull quote</option>';
    for (let i = 1; i <= numParagraphs; i++) {
      pullQuotePositionOptions += '<option value="' + i + '" ' + ((b.pullQuotePosition || '0') === String(i) ? 'selected' : '') + '>After paragraph ' + i + '</option>';
    }

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
    const labelFieldHtml = '<div class="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">' +
      '<label class="block text-sm font-semibold text-blue-900 mb-2">📝 Block Label (Optional)</label>' +
      '<input type="text" data-k="label" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" ' +
        'placeholder="e.g., Opening paragraph..." ' +
        'value="' + (b.label || '') + '" />' +
    '</div>';

    // SECTION: Block Settings (collapsed)
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
          '<input type="color" data-k="bgColor" value="' + (b.bgColor || '#ffffff') + '" class="w-full h-9 border rounded">' +
        '</div>' +
      '</div>' +
      '<div class="grid grid-cols-2 gap-3 mb-3">' +
        '<div>' +
          '<label class="block text-sm mb-1">Padding Top</label>' +
          '<select data-k="paddingTop" class="w-full border rounded px-2 py-1">' +
            paddingSizes.map(p => '<option value="' + p.value + '" ' + ((b.paddingTop || 'medium') === p.value ? 'selected' : '') + '>' + p.label + '</option>').join('') +
          '</select>' +
        '</div>' +
        '<div>' +
          '<label class="block text-sm mb-1">Padding Bottom</label>' +
          '<select data-k="paddingBottom" class="w-full border rounded px-2 py-1">' +
            paddingSizes.map(p => '<option value="' + p.value + '" ' + ((b.paddingBottom || 'medium') === p.value ? 'selected' : '') + '>' + p.label + '</option>').join('') +
          '</select>' +
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

    // SECTION: Byline (collapsed)
    const bylineContent =
      '<label class="flex items-center gap-2 font-semibold mb-3">' +
        '<input type="checkbox" data-k="showByline" class="byline-toggle" ' + (b.showByline ? 'checked' : '') + '>' +
        '<span>Enable Byline</span>' +
      '</label>' +
      '<div class="byline-fields' + (b.showByline ? '' : ' opacity-50') + '">' +
        '<div class="mb-3">' +
          '<label class="block text-xs mb-1">Byline Text</label>' +
          '<input data-k="bylineText" value="' + (b.bylineText || 'By Author Name') + '" class="w-full border rounded px-2 py-1 text-sm" placeholder="By Your Name">' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-3 mb-3">' +
          '<div>' +
            '<label class="block text-xs mb-1">Dateline</label>' +
            '<input data-k="bylineDateline" value="' + (b.bylineDateline || '') + '" class="w-full border rounded px-2 py-1 text-sm" placeholder="City, State">' +
          '</div>' +
          '<div>' +
            '<label class="block text-xs mb-1">Date</label>' +
            '<input data-k="bylineDate" value="' + (b.bylineDate || '') + '" class="w-full border rounded px-2 py-1 text-sm" placeholder="January 2025">' +
          '</div>' +
        '</div>' +
        '<label class="flex items-center gap-2 text-xs mb-3">' +
          '<input type="checkbox" data-k="showReadTime" ' + (b.showReadTime !== false ? 'checked' : '') + '>' +
          '<span>Show reading time (auto-calculated on export)</span>' +
        '</label>' +
        '<div class="p-2 border rounded bg-slate-50 mb-3">' +
          '<div class="text-xs font-semibold mb-2">Byline Text Style</div>' +
          '<div class="grid grid-cols-3 gap-2">' +
            '<div>' +
              '<label class="block text-xs">Size</label>' +
              '<input data-k="bylineStyle.size" type="number" min="10" max="24" value="' + getStyle(b.bylineStyle || {}, 'size', '16') + '" class="w-full border rounded px-2 py-1 text-sm">' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Weight</label>' +
              '<select data-k="bylineStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' +
                weightOpts.map(w => '<option ' + (getStyle(b.bylineStyle || {}, 'weight', 'normal') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
              '</select>' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Color</label>' +
              '<input type="color" data-k="bylineStyle.color" value="' + getStyle(b.bylineStyle || {}, 'color', '#374151') + '" class="w-full h-7 border rounded">' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="p-2 border rounded bg-slate-50">' +
          '<div class="text-xs font-semibold mb-2">Dateline + Date Style</div>' +
          '<div class="grid grid-cols-3 gap-2">' +
            '<div>' +
              '<label class="block text-xs">Size</label>' +
              '<input data-k="datelineStyle.size" type="number" min="10" max="20" value="' + getStyle(b.datelineStyle || {}, 'size', '14') + '" class="w-full border rounded px-2 py-1 text-sm">' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Weight</label>' +
              '<select data-k="datelineStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' +
                weightOpts.map(w => '<option ' + (getStyle(b.datelineStyle || {}, 'weight', 'normal') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
              '</select>' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Color</label>' +
              '<input type="color" data-k="datelineStyle.color" value="' + getStyle(b.datelineStyle || {}, 'color', '#6b7280') + '" class="w-full h-7 border rounded">' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // SECTION: Subhead (collapsed)
    const subheadContent =
      '<input data-k="subhead" value="' + (b.subhead || '') + '" class="w-full border rounded px-2 py-1 mb-3" placeholder="Appears above body text">' +
      '<div class="p-2 border rounded bg-slate-50">' +
        '<div class="text-xs font-semibold mb-2">Style</div>' +
        '<div class="grid grid-cols-3 gap-2 mb-2">' +
          '<div>' +
            '<label class="block text-xs">Size</label>' +
            '<input data-k="subheadStyle.size" type="number" min="12" max="48" value="' + getStyle(subheadStyle, 'size', '24') + '" class="w-full border rounded px-2 py-1 text-sm">' +
          '</div>' +
          '<div>' +
            '<label class="block text-xs">Weight</label>' +
            '<select data-k="subheadStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' +
              weightOpts.map(w => '<option ' + (getStyle(subheadStyle, 'weight', 'normal') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
            '</select>' +
          '</div>' +
          '<div>' +
            '<label class="block text-xs">Color</label>' +
            '<input type="color" data-k="subheadStyle.color" value="' + getStyle(subheadStyle, 'color', '#6b7280') + '" class="w-full h-7 border rounded">' +
          '</div>' +
        '</div>' +
        '<div class="flex items-center gap-4">' +
          '<div class="flex-1">' +
            '<label class="block text-xs">Font</label>' +
            '<select data-k="subheadStyle.font" class="w-full border rounded px-2 py-1 text-xs">' +
              fontSelectHtml(getStyle(subheadStyle, 'font', 'system-ui')) +
            '</select>' +
          '</div>' +
          '<label class="flex items-center gap-1 text-xs pt-4">' +
            '<input type="checkbox" data-k="subheadStyle.italic" ' + (getStyle(subheadStyle, 'italic', false) ? 'checked' : '') + '>' +
            '<span>Italic</span>' +
          '</label>' +
        '</div>' +
      '</div>';

    // SECTION: Drop Cap & First Line (collapsed)
    const dropCapContent =
      '<label class="flex items-center gap-2 font-semibold mb-3">' +
        '<input type="checkbox" data-k="showDropCap" ' + (b.showDropCap ? 'checked' : '') + '>' +
        '<span>Enable Drop Cap & First Line Style</span>' +
      '</label>' +
      '<div class="' + (b.showDropCap ? '' : 'opacity-50') + '">' +
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
        '<div class="dropcap-style-fields' + (b._inheritDropCapStyle === true && !b._isDropCapStyleMaster ? ' opacity-50 pointer-events-none' : '') + '">' +
          '<div class="grid grid-cols-2 gap-3 mb-3">' +
            '<div>' +
              '<label class="block text-xs mb-1">Drop Cap Color</label>' +
              '<input type="color" data-k="dropCapColor" value="' + (b.dropCapColor || '#3b82f6') + '" class="w-full h-8 border rounded">' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs mb-1">Drop Cap Size (px)</label>' +
              '<input data-k="dropCapSize" type="number" min="36" max="96" value="' + (b.dropCapSize || '56') + '" class="w-full border rounded px-2 py-1">' +
            '</div>' +
          '</div>' +
          '<div class="text-xs font-semibold mb-2">First Line Style</div>' +
          '<div class="grid grid-cols-3 gap-2">' +
            '<div>' +
              '<label class="block text-xs mb-1">Size</label>' +
              '<input data-k="firstLineSize" type="number" min="14" max="36" value="' + (b.firstLineSize || '20') + '" class="w-full border rounded px-2 py-1">' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs mb-1">Weight</label>' +
              '<select data-k="firstLineWeight" class="w-full border rounded px-2 py-1 text-xs">' +
                weightOpts.map(w => '<option ' + ((b.firstLineWeight || '600') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
              '</select>' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs mb-1">Color</label>' +
              '<input type="color" data-k="firstLineColor" value="' + (b.firstLineColor || '#111827') + '" class="w-full h-8 border rounded">' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // SECTION: Pull Quote (collapsed)
    const pullQuoteContent =
      '<textarea data-k="pullQuote" rows="2" class="w-full border rounded px-2 py-1 mb-2" placeholder="Enter pull quote text...">' + (b.pullQuote || '') + '</textarea>' +
      '<div class="mb-3">' +
        '<label class="block text-xs mb-1">Position</label>' +
        '<select data-k="pullQuotePosition" class="w-full border rounded px-2 py-1">' +
          pullQuotePositionOptions +
        '</select>' +
      '</div>' +
      '<div class="p-2 border rounded bg-slate-50">' +
        '<div class="text-xs font-semibold mb-2">Style</div>' +
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
        '<div class="pullquote-style-fields' + (b._inheritPullQuoteStyle === true && !b._isPullQuoteStyleMaster ? ' opacity-50 pointer-events-none' : '') + '">' +
          '<div class="grid grid-cols-3 gap-2 mb-2">' +
            '<div>' +
              '<label class="block text-xs">Size</label>' +
              '<input data-k="pullQuoteStyle.size" type="number" min="16" max="48" value="' + getStyle(pullQuoteStyle, 'size', '24') + '" class="w-full border rounded px-2 py-1 text-sm">' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Weight</label>' +
              '<select data-k="pullQuoteStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' +
                weightOpts.map(w => '<option ' + (getStyle(pullQuoteStyle, 'weight', '500') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
              '</select>' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Text Color</label>' +
              '<input type="color" data-k="pullQuoteStyle.color" value="' + getStyle(pullQuoteStyle, 'color', '#374151') + '" class="w-full h-7 border rounded">' +
            '</div>' +
          '</div>' +
          '<div class="grid grid-cols-2 gap-2 mb-2">' +
            '<div>' +
              '<label class="block text-xs">Background</label>' +
              '<input type="color" data-k="pullQuoteStyle.bgColor" value="' + getStyle(pullQuoteStyle, 'bgColor', '#f3f4f6') + '" class="w-full h-7 border rounded">' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Border</label>' +
              '<input type="color" data-k="pullQuoteStyle.borderColor" value="' + getStyle(pullQuoteStyle, 'borderColor', '#3b82f6') + '" class="w-full h-7 border rounded">' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<label class="block text-xs">Font</label>' +
            '<select data-k="pullQuoteStyle.font" class="w-full border rounded px-2 py-1 text-xs">' +
              fontSelectHtml(getStyle(pullQuoteStyle, 'font', 'system-ui')) +
            '</select>' +
          '</div>' +
        '</div>' +
      '</div>';

    // SECTION: Body Text (collapsed)
    const bodyTextContent =
      textToolbarHtml('text') +
      '<textarea data-k="text" rows="10" class="w-full border rounded px-2 py-1 mb-2">' + (b.text || '') + '</textarea>' +
      '<p class="text-xs text-slate-500 mb-3">Separate paragraphs with double line breaks.</p>' +
      '<div class="mb-3">' +
        '<label class="block text-xs mb-1">Text Width</label>' +
        '<select data-k="textWidth" class="w-full border rounded px-2 py-1">' +
          textWidthOpts.map(w => '<option ' + ((b.textWidth || 'medium') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
        '</select>' +
      '</div>' +
      '<div class="p-2 border rounded bg-slate-50 mb-3">' +
        '<div class="text-xs font-semibold mb-2">Style</div>' +
        '<div class="mb-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs">' +
          '<label class="flex items-center gap-2 mb-2">' +
            '<input type="checkbox" data-k="_isBodyStyleMaster" class="body-style-master" ' + (b._isBodyStyleMaster ? 'checked' : '') + '>' +
            '<span>Set styling for all blocks</span>' +
          '</label>' +
          '<label class="flex items-center gap-2">' +
            '<input type="checkbox" data-k="_inheritBodyStyle" class="body-style-inherit" ' + (b._inheritBodyStyle !== false ? 'checked' : '') + '>' +
            '<span class="text-gray-600">Inherit styling from master</span>' +
          '</label>' +
        '</div>' +
        '<div class="body-style-fields' + (b._inheritBodyStyle !== false && !b._isBodyStyleMaster ? ' opacity-50 pointer-events-none' : '') + '">' +
          '<div class="grid grid-cols-3 gap-2 mb-2">' +
            '<div>' +
              '<label class="block text-xs">Size (px)</label>' +
              '<input data-k="textStyle.size" type="number" min="12" max="32" value="' + getStyle(textStyle, 'size', '16') + '" class="w-full border rounded px-2 py-1 text-sm">' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Weight</label>' +
              '<select data-k="textStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' +
                weightOpts.map(w => '<option ' + (getStyle(textStyle, 'weight', 'normal') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
              '</select>' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Color</label>' +
              '<input type="color" data-k="textStyle.color" value="' + getStyle(textStyle, 'color', '#374151') + '" class="w-full h-7 border rounded">' +
            '</div>' +
          '</div>' +
          '<div class="mb-2">' +
            '<label class="block text-xs">Font</label>' +
            '<select data-k="textStyle.font" class="w-full border rounded px-2 py-1 text-xs">' +
              fontSelectHtml(getStyle(textStyle, 'font', 'system-ui')) +
            '</select>' +
          '</div>' +
          '<div>' +
            '<label class="block text-xs">Line Height: ' + getStyle(textStyle, 'leading', '1.7') + '</label>' +
            '<input data-k="textStyle.leading" type="range" min="1.0" max="2.5" step="0.1" value="' + getStyle(textStyle, 'leading', '1.7') + '" class="w-full">' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="p-2 border rounded bg-slate-50">' +
        '<div class="text-xs font-semibold mb-2">Inline Image (optional)</div>' +
        '<label class="block text-xs mb-1">Image Path</label>' +
        '<input data-k="inlineImage" value="' + (b.inlineImage || '') + '" class="w-full border rounded px-2 py-1 text-sm mb-2">' +
        '<div class="grid grid-cols-2 gap-2 mb-2">' +
          '<div>' +
            '<label class="block text-xs">Position</label>' +
            '<select data-k="inlineImagePosition" class="w-full border rounded px-2 py-1 text-xs">' +
              posOpts.map(p => '<option ' + ((b.inlineImagePosition || 'top') === p ? 'selected' : '') + ' value="' + p + '">' + p + '</option>').join('') +
            '</select>' +
          '</div>' +
          '<div>' +
            '<label class="block text-xs">Width</label>' +
            '<select data-k="inlineImageWidth" class="w-full border rounded px-2 py-1 text-xs">' +
              imgWidthOpts.map(w => '<option ' + ((b.inlineImageWidth || 'medium') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
            '</select>' +
          '</div>' +
        '</div>' +
        '<label class="block text-xs mb-1">Caption</label>' +
        '<input data-k="inlineImageCaption" value="' + (b.inlineImageCaption || '') + '" class="w-full border rounded px-2 py-1 text-sm">' +
      '</div>';

    // Assemble all sections (all collapsed by default)
    return labelFieldHtml +
      section('⚙️ Block Settings', blockSettingsContent, true) +
      section('📄 Body Text', bodyTextContent, true) +
      section('👤 Byline', bylineContent, true) +
      section('🔤 Drop Cap & First Line', dropCapContent, true) +
      section('💬 Pull Quote', pullQuoteContent, true) +
      section('📰 Subhead', subheadContent, true);
  },

  preview({ block, project, blocks = [] }) {
    const b = block;
    const textWidthMap = {
      'extra-narrow': 'max-w-lg mx-auto',
      'narrow': 'max-w-2xl mx-auto',
      'medium': 'max-w-4xl mx-auto',
      'wide': 'max-w-6xl mx-auto'
    };
    const textWidthClass = textWidthMap[b.textWidth || 'medium'];
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
    const pt = paddingTopMap[b.paddingTop || 'medium'];
    const pb = paddingBottomMap[b.paddingBottom || 'medium'];

    // Check for inherited background color
    let bgColor = b.bgColor || '#ffffff';
    if (b._inheritBgColor === true) {
      const masterBlock = blocks.find(blk => blk._isBgColorMaster && blk !== b);
      if (masterBlock) {
        bgColor = masterBlock.bgColor || bgColor;
      }
    }

    let bgStyle = 'background-color:' + bgColor + ';';

    // Check for inherited body text style
    let effectiveTextStyle = b.textStyle || {};
    if (b._inheritBodyStyle !== false) {
      const masterBlock = blocks.find(blk => blk._isBodyStyleMaster && blk !== b);
      if (masterBlock && masterBlock.textStyle) {
        effectiveTextStyle = masterBlock.textStyle;
      }
    }

    const buildStyle = (styleObj, fallbacks) => {
      const color = (styleObj && styleObj.color) || fallbacks.color;
      const size = (styleObj && styleObj.size) || fallbacks.size;
      const font = (styleObj && styleObj.font) || fallbacks.font;
      const weight = (styleObj && styleObj.weight) || fallbacks.weight;
      const italic = (styleObj && styleObj.italic) || false;
      const leading = (styleObj && styleObj.leading) || fallbacks.leading || '1.7';
      const fontStyle = italic ? 'italic' : 'normal';
      const fontWeight = weight === 'bold' ? '700' : weight === '600' ? '600' : weight === '500' ? '500' : '400';
      return 'color:' + color + ';font-size:' + size + 'px;font-family:' + font + ';font-weight:' + fontWeight + ';font-style:' + fontStyle + ';line-height:' + leading + ';';
    };

    // Build byline HTML
    let bylineHtml = '';
    if (b.showByline) {
      const bylineStyle = buildStyle(b.bylineStyle, { color: '#374151', size: '16', font: 'system-ui', weight: 'normal', leading: '1.6' });
      const datelineStyleObj = b.datelineStyle || {};
      const datelineSize = datelineStyleObj.size || '14';
      const datelineWeight = datelineStyleObj.weight || 'normal';
      const datelineColor = datelineStyleObj.color || '#6b7280';
      const datelineFontWeight = datelineWeight === 'bold' ? '700' : '400';

      const bylineText = b.bylineText || 'By Author Name';
      const dateline = b.bylineDateline || '';
      const date = b.bylineDate || '';
      const readTime = (b.showReadTime !== false && b.readTime) ? b.readTime : '';

      let secondLine = '';
      const parts = [];
      if (dateline) parts.push(dateline);
      if (date) parts.push(date);
      if (readTime) parts.push(readTime + ' min read');

      if (parts.length > 0) {
        const separator = ' <span style="color:' + datelineColor + ';opacity:0.6;padding:0 8px;">|</span> ';
        secondLine = '<div style="font-size:' + datelineSize + 'px;font-weight:' + datelineFontWeight + ';color:' + datelineColor + ';margin-top:4px;">' + parts.join(separator) + '</div>';
      }

      bylineHtml = '<div style="margin-bottom:24px;">' +
        '<div style="' + bylineStyle + '">' + bylineText + '</div>' +
        secondLine +
      '</div>';
    }

    // Build subhead HTML
    const subheadStyle = buildStyle(b.subheadStyle, { color: '#6b7280', size: '24', font: 'system-ui', weight: 'normal', leading: '1.5' });
    const subheadHtml = b.subhead ? '<h3 style="' + subheadStyle + 'margin-bottom:24px;">' + b.subhead + '</h3>' : '';

    // Check for inherited pull quote style
    let effectivePullQuoteStyle = b.pullQuoteStyle || {};
    if (b._inheritPullQuoteStyle === true) {
      const masterBlock = blocks.find(blk => blk._isPullQuoteStyleMaster && blk !== b);
      if (masterBlock && masterBlock.pullQuoteStyle) {
        effectivePullQuoteStyle = masterBlock.pullQuoteStyle;
      }
    }
    const pullQuoteStyle = buildStyle(effectivePullQuoteStyle, { color: '#374151', size: '24', font: 'system-ui', weight: '500', leading: '1.8' });
    const pullQuoteBgColor = (effectivePullQuoteStyle && effectivePullQuoteStyle.bgColor) || '#f3f4f6';
    const pullQuoteBorderColor = (effectivePullQuoteStyle && effectivePullQuoteStyle.borderColor) || '#3b82f6';

    // Build pull quote HTML
    const pullQuotePosition = parseInt(b.pullQuotePosition || '0');
    let pullQuoteHtml = '';
    if (b.pullQuote && b.pullQuote.trim() && pullQuotePosition > 0) {
      pullQuoteHtml = '<div style="background:' + pullQuoteBgColor + ';padding:24px 32px;border-left:4px solid ' + pullQuoteBorderColor + ';margin:24px 0;">' +
        '<p style="' + pullQuoteStyle + 'margin:0;">' + processBodyText(b.pullQuote || '') + '</p>' +
      '</div>';
    }

    // Build body text with drop cap and pull quote
    const textStyle = buildStyle(effectiveTextStyle, { color: '#374151', size: '16', font: 'system-ui', weight: 'normal', leading: '1.7' });
    const useDropCap = b.showDropCap;

    // Compute drop cap values
    let effDropCapColor = '#3b82f6';
    let effDropCapSize = '56';
    let effFirstLineSize = '20';
    let effFirstLineWeight = '600';
    let effFirstLineColor = '#111827';

    if (useDropCap) {
      effDropCapColor = b.dropCapColor || '#3b82f6';
      effDropCapSize = b.dropCapSize || '56';
      effFirstLineSize = b.firstLineSize || '20';
      effFirstLineWeight = b.firstLineWeight || '600';
      effFirstLineColor = b.firstLineColor || '#111827';

      if (b._inheritDropCapStyle === true) {
        const masterBlock = blocks.find(blk => blk._isDropCapStyleMaster && blk !== b);
        if (masterBlock) {
          effDropCapColor = masterBlock.dropCapColor || effDropCapColor;
          effDropCapSize = masterBlock.dropCapSize || effDropCapSize;
          effFirstLineSize = masterBlock.firstLineSize || effFirstLineSize;
          effFirstLineWeight = masterBlock.firstLineWeight || effFirstLineWeight;
          effFirstLineColor = masterBlock.firstLineColor || effFirstLineColor;
        }
      }
    }

    // Generate unique class for drop cap
    const blockId = 'txt-' + Math.random().toString(36).substr(2, 6);
    const dropCapClass = 'text-block-drop-cap-' + blockId;

    // Build paragraphs with pull quote inserted
    const paragraphs = (b.text || '').split(/\n\n+/).filter(p => p.trim());
    let bodyParts = [];
    paragraphs.forEach((para, idx) => {
      if (idx === 0 && useDropCap) {
        bodyParts.push('<p class="' + dropCapClass + '" style="' + textStyle + 'margin-bottom:20px;">' + processBodyText(para) + '</p>');
      } else {
        bodyParts.push('<p style="' + textStyle + 'margin-bottom:20px;">' + processBodyText(para) + '</p>');
      }
      if (idx + 1 === pullQuotePosition && pullQuoteHtml) {
        bodyParts.push(pullQuoteHtml);
      }
    });

    // Inline image
    const widthMode = b.inlineImageWidth || 'medium';
    const wrapperClass = widthMode === 'large' ? 'breakout-large' : widthMode === 'full' ? 'fullbleed' : 'mx-auto';
    const imgWidthStyle = widthMode === 'small' ? 'max-width:24rem;' : widthMode === 'medium' ? 'max-width:40rem;' : '';

    let inlineImageHtml = '';
    if (b.inlineImage) {
      const caption = b.inlineImageCaption ? '<p class="text-sm text-slate-600 mt-2 text-center">' + b.inlineImageCaption + '</p>' : '';
      inlineImageHtml = '<div class="my-8 ' + wrapperClass + '" style="' + imgWidthStyle + '">' +
        '<img src="' + resolvePreviewPath(b.inlineImage, project) + '" class="w-full rounded" alt="">' + caption + '</div>';
    }

    // Position inline image
    const pos = b.inlineImagePosition || 'top';
    let contentHtml = '';
    if (pos === 'top') {
      contentHtml = bylineHtml + subheadHtml + inlineImageHtml + bodyParts.join('');
    } else if (pos === 'bottom') {
      contentHtml = bylineHtml + subheadHtml + bodyParts.join('') + inlineImageHtml;
    } else {
      // middle - insert after first half of paragraphs
      const midPoint = Math.ceil(bodyParts.length / 2);
      const firstHalf = bodyParts.slice(0, midPoint).join('');
      const secondHalf = bodyParts.slice(midPoint).join('');
      contentHtml = bylineHtml + subheadHtml + firstHalf + inlineImageHtml + secondHalf;
    }

    // CSS for drop cap and links
    const linkStyles = getLinkStyles(bgColor, '.text-block-section');
    let dropCapStyles = '';
    if (useDropCap) {
      const dropCapLineHeight = Math.floor(parseInt(effDropCapSize) * 0.85);
      const firstLineWeightVal = effFirstLineWeight === 'bold' ? '700' : effFirstLineWeight === '600' ? '600' : effFirstLineWeight === '500' ? '500' : '400';

      dropCapStyles =
        '.' + dropCapClass + '::first-letter{float:left;font-size:' + effDropCapSize + 'px !important;line-height:' + dropCapLineHeight + 'px !important;padding-right:10px;margin-top:2px;color:' + effDropCapColor + ' !important;font-weight:bold;}' +
        '.' + dropCapClass + '::first-line{font-size:' + effFirstLineSize + 'px !important;font-weight:' + firstLineWeightVal + ' !important;color:' + effFirstLineColor + ' !important;}';
    }
    const styleTag = '<style>' + dropCapStyles + linkStyles + '</style>';

    const fadeAttr = b._fadeOnScroll ? ' data-fade-scroll="true"' : '';

    return styleTag + '<section class="text-block-section relative ' + pt + ' ' + pb + '"' + fadeAttr + ' style="' + bgStyle + '">' +
      '<div class="relative z-10 ' + pad + ' ' + textWidthClass + '">' + contentHtml + '</div>' +
    '</section>';
  },

  exportHTML({ block, blocks = [] }) {
    const b = block;
    const textWidthMap = {
      'extra-narrow': 'max-w-lg mx-auto',
      'narrow': 'max-w-2xl mx-auto',
      'medium': 'max-w-4xl mx-auto',
      'wide': 'max-w-6xl mx-auto'
    };
    const textWidthClass = textWidthMap[b.textWidth || 'medium'];
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
    const pt = paddingTopMap[b.paddingTop || 'medium'];
    const pb = paddingBottomMap[b.paddingBottom || 'medium'];

    // Check for inherited background color
    let bgColor = b.bgColor || '#ffffff';
    if (b._inheritBgColor === true) {
      const masterBlock = blocks.find(blk => blk._isBgColorMaster && blk !== b);
      if (masterBlock) {
        bgColor = masterBlock.bgColor || bgColor;
      }
    }

    let bgStyle = 'background-color:' + bgColor + ';';

    // Check for inherited body text style
    let effectiveTextStyle = b.textStyle || {};
    if (b._inheritBodyStyle !== false) {
      const masterBlock = blocks.find(blk => blk._isBodyStyleMaster && blk !== b);
      if (masterBlock && masterBlock.textStyle) {
        effectiveTextStyle = masterBlock.textStyle;
      }
    }

    const buildStyle = (styleObj, fallbacks) => {
      const color = (styleObj && styleObj.color) || fallbacks.color;
      const size = (styleObj && styleObj.size) || fallbacks.size;
      const font = (styleObj && styleObj.font) || fallbacks.font;
      const weight = (styleObj && styleObj.weight) || fallbacks.weight;
      const italic = (styleObj && styleObj.italic) || false;
      const leading = (styleObj && styleObj.leading) || fallbacks.leading || '1.7';
      const fontStyle = italic ? 'italic' : 'normal';
      const fontWeight = weight === 'bold' ? '700' : weight === '600' ? '600' : weight === '500' ? '500' : '400';
      return 'color:' + color + ';font-size:' + size + 'px;font-family:' + font + ';font-weight:' + fontWeight + ';font-style:' + fontStyle + ';line-height:' + leading + ';';
    };

    // Build byline HTML
    let bylineHtml = '';
    if (b.showByline) {
      const bylineStyle = buildStyle(b.bylineStyle, { color: '#374151', size: '16', font: 'system-ui', weight: 'normal', leading: '1.6' });
      const datelineStyleObj = b.datelineStyle || {};
      const datelineSize = datelineStyleObj.size || '14';
      const datelineWeight = datelineStyleObj.weight || 'normal';
      const datelineColor = datelineStyleObj.color || '#6b7280';
      const datelineFontWeight = datelineWeight === 'bold' ? '700' : '400';

      const bylineText = b.bylineText || 'By Author Name';
      const dateline = b.bylineDateline || '';
      const date = b.bylineDate || '';
      const readTime = (b.showReadTime !== false && b.readTime) ? b.readTime : '';

      let secondLine = '';
      const parts = [];
      if (dateline) parts.push(dateline);
      if (date) parts.push(date);
      if (readTime) parts.push(readTime + ' min read');

      if (parts.length > 0) {
        const separator = ' <span style="color:' + datelineColor + ';opacity:0.6;padding:0 8px;">|</span> ';
        secondLine = '<div style="font-size:' + datelineSize + 'px;font-weight:' + datelineFontWeight + ';color:' + datelineColor + ';margin-top:4px;">' + parts.join(separator) + '</div>';
      }

      bylineHtml = '<div style="margin-bottom:24px;">' +
        '<div style="' + bylineStyle + '">' + String(bylineText) + '</div>' +
        secondLine +
      '</div>';
    }

    // Build subhead HTML
    const subheadStyle = buildStyle(b.subheadStyle, { color: '#6b7280', size: '24', font: 'system-ui', weight: 'normal', leading: '1.5' });
    const subheadHtml = b.subhead ? '<h3 style="' + subheadStyle + 'margin-bottom:24px;">' + String(b.subhead) + '</h3>' : '';

    // Check for inherited pull quote style
    let effectivePullQuoteStyle = b.pullQuoteStyle || {};
    if (b._inheritPullQuoteStyle === true) {
      const masterBlock = blocks.find(blk => blk._isPullQuoteStyleMaster && blk !== b);
      if (masterBlock && masterBlock.pullQuoteStyle) {
        effectivePullQuoteStyle = masterBlock.pullQuoteStyle;
      }
    }
    const pullQuoteStyle = buildStyle(effectivePullQuoteStyle, { color: '#374151', size: '24', font: 'system-ui', weight: '500', leading: '1.8' });
    const pullQuoteBgColor = (effectivePullQuoteStyle && effectivePullQuoteStyle.bgColor) || '#f3f4f6';
    const pullQuoteBorderColor = (effectivePullQuoteStyle && effectivePullQuoteStyle.borderColor) || '#3b82f6';

    // Build pull quote HTML
    const pullQuotePosition = parseInt(b.pullQuotePosition || '0');
    let pullQuoteHtml = '';
    if (b.pullQuote && b.pullQuote.trim() && pullQuotePosition > 0) {
      pullQuoteHtml = '<div style="background:' + pullQuoteBgColor + ';padding:24px 32px;border-left:4px solid ' + pullQuoteBorderColor + ';margin:24px 0;">' +
        '<p style="' + pullQuoteStyle + 'margin:0;">' + processBodyText(b.pullQuote || '', { brTag: '<br/>' }) + '</p>' +
      '</div>';
    }

    // Build body text with drop cap and pull quote
    const textStyle = buildStyle(effectiveTextStyle, { color: '#374151', size: '16', font: 'system-ui', weight: 'normal', leading: '1.7' });
    const useDropCap = b.showDropCap;

    // Generate unique class for drop cap
    const blockId = 'txt-' + Math.random().toString(36).substr(2, 6);
    const dropCapClass = 'text-block-drop-cap-' + blockId;

    // Build paragraphs with pull quote inserted
    const paragraphs = String(b.text || '').split(/\n\n+/).filter(p => p.trim());
    let bodyParts = [];
    paragraphs.forEach((para, idx) => {
      if (idx === 0 && useDropCap) {
        bodyParts.push('<p class="' + dropCapClass + '" style="' + textStyle + 'margin-bottom:20px;">' + processBodyText(para, { brTag: '<br/>' }) + '</p>');
      } else {
        bodyParts.push('<p style="' + textStyle + 'margin-bottom:20px;">' + processBodyText(para, { brTag: '<br/>' }) + '</p>');
      }
      if (idx + 1 === pullQuotePosition && pullQuoteHtml) {
        bodyParts.push(pullQuoteHtml);
      }
    });

    // Inline image
    const widthMode = b.inlineImageWidth || 'medium';
    const breakoutClass = widthMode === 'large' ? 'breakout-large' : widthMode === 'full' ? 'fullbleed' : '';
    const imgWidthStyle = widthMode === 'small' ? 'max-width:24rem;' : widthMode === 'medium' ? 'max-width:40rem;' : '';

    let inlineImageHtml = '';
    if (b.inlineImage) {
      const caption = b.inlineImageCaption ? '<p class="text-sm text-slate-600 mt-2 text-center">' + String(b.inlineImageCaption) + '</p>' : '';
      inlineImageHtml = '<div class="my-8 mx-auto ' + breakoutClass + '" style="' + imgWidthStyle + '">' +
        '<img src="' + resolveExportPath(b.inlineImage) + '" class="w-full rounded" alt="">' + caption + '</div>';
    }

    // Position inline image
    const pos = b.inlineImagePosition || 'top';
    let contentHtml = '';
    if (pos === 'top') {
      contentHtml = bylineHtml + subheadHtml + inlineImageHtml + bodyParts.join('');
    } else if (pos === 'bottom') {
      contentHtml = bylineHtml + subheadHtml + bodyParts.join('') + inlineImageHtml;
    } else {
      // middle
      const midPoint = Math.ceil(bodyParts.length / 2);
      const firstHalf = bodyParts.slice(0, midPoint).join('');
      const secondHalf = bodyParts.slice(midPoint).join('');
      contentHtml = bylineHtml + subheadHtml + firstHalf + inlineImageHtml + secondHalf;
    }

    // CSS for drop cap and links
    const linkStyles = getLinkStyles(bgColor, '.text-block-section');
    let dropCapStyles = '';
    if (useDropCap) {
      // Start with block's own values (or defaults)
      let effDropCapColor = b.dropCapColor || '#3b82f6';
      let effDropCapSize = b.dropCapSize || '56';
      let effFirstLineSize = b.firstLineSize || '20';
      let effFirstLineWeight = b.firstLineWeight || '600';
      let effFirstLineColor = b.firstLineColor || '#111827';

      // Only inherit if explicitly checked AND there's a master block
      if (b._inheritDropCapStyle === true) {
        const masterBlock = blocks.find(blk => blk._isDropCapStyleMaster && blk !== b);
        if (masterBlock) {
          effDropCapColor = masterBlock.dropCapColor || effDropCapColor;
          effDropCapSize = masterBlock.dropCapSize || effDropCapSize;
          effFirstLineSize = masterBlock.firstLineSize || effFirstLineSize;
          effFirstLineWeight = masterBlock.firstLineWeight || effFirstLineWeight;
          effFirstLineColor = masterBlock.firstLineColor || effFirstLineColor;
        }
      }

      const dropCapLineHeight = Math.floor(parseInt(effDropCapSize) * 0.85);
      const firstLineWeightVal = effFirstLineWeight === 'bold' ? '700' : effFirstLineWeight === '600' ? '600' : effFirstLineWeight === '500' ? '500' : '400';

      dropCapStyles =
        '.' + dropCapClass + '::first-letter{float:left;font-size:' + effDropCapSize + 'px !important;line-height:' + dropCapLineHeight + 'px !important;padding-right:10px;margin-top:2px;color:' + effDropCapColor + ' !important;font-weight:bold;}' +
        '.' + dropCapClass + '::first-line{font-size:' + effFirstLineSize + 'px !important;font-weight:' + firstLineWeightVal + ' !important;color:' + effFirstLineColor + ' !important;}';
    }
    const styleTag = '<style>' + dropCapStyles + linkStyles + '</style>';

    const fadeAttr = b._fadeOnScroll ? ' data-fade-scroll="true"' : '';

    return styleTag + '<section class="text-block-section relative ' + pt + ' ' + pb + '"' + fadeAttr + ' style="position:relative;z-index:3;' + bgStyle + '">' +
      '<div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:100vw;height:100%;' + bgStyle + 'z-index:0;"></div>' +
      '<div class="relative z-10 ' + pad + ' ' + textWidthClass + '" style="position:relative;z-index:1;">' + contentHtml + '</div>' +
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
