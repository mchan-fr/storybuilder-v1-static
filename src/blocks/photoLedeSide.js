import {
  resolvePreviewPath,
  resolveExportPath,
  processBodyText,
  textToolbarHtml,
  getLinkStyles,
  fontSelectHtml,
  paddingSizes,
  paddingClassMap,
  textWidthOpts,
  textWidthClassMap,
  weightOpts,
  getStyle,
  buildInlineStyle,
  collapsibleSection,
  labelFieldHtml,
  paddingSelectHtml,
  textWidthSelectHtml,
  weightSelectHtml,
  styleInheritControls,
  getEffectiveStyle,
  getEffectiveBgColor,
  getEffectiveDropCapSettings,
  getEffectivePullQuoteStyle,
  dropCapCss,
  generateBlockId
} from '../utils.js';

export const PhotoLedeSideBlock = {
  type: 'photo-lede-side',
  title: 'Photo Lede Side (image beside text)',

  defaults() {
    return {
      type: 'photo-lede-side',
      label: '',
      bgColor: '#000000',
      paddingTop: 'medium',
      paddingBottom: 'medium',
      mobileSubheadOverlay: false,
      mobileBylineOverlay: false,
      
      // Side image (mandatory)
      sideImage: '',
      sideVideo: '',
      sideImagePosition: 'left', // 'left' | 'right'
      sideImageWidth: '40', // '30' | '40' | '50' | '60'
      
      // Byline (optional, appears before body text)
      showByline: false,
      showReadTime: true, // Show reading time in byline (auto-calculated on export)
      bylineText: 'By Marcus Chan',
      bylineDateline: '', // e.g., "Lone Pine, California"
      bylineDate: 'November 2024',
      bylineStyle: {
        size: '16',
        weight: 'normal',
        color: '#e5e5e5',
        font: 'IBM Plex Sans, sans-serif'
      },
      datelineStyle: {
        size: '14',
        weight: 'normal',
        color: '#9ca3af'
      },
      
      // Subhead (above body text)
      subhead: '',
      subheadStyle: {
        size: '24',
        weight: 'normal',
        italic: false,
        color: '#d1d5db',
        font: 'IBM Plex Sans, sans-serif'
      },
      
      // Pull quote (optional, positioned in text)
      pullQuote: '',
      pullQuotePosition: '0', // '0' = don't show, '1' = after para 1, '2' = after para 2, etc.
      pullQuoteStyle: {
        size: '24',
        weight: '500',
        italic: false,
        color: '#ffffff',
        font: 'IBM Plex Sans, sans-serif',
        leading: '1.8',
        bgColor: '#3d3314',
        borderColor: '#fbbf24'
      },
      
      // Body text with drop cap and first line styling
      bodyText: 'Your opening paragraphs go here.\n\nSeparate paragraphs with double line breaks.',
      
      textWidth: 'narrow', // 'extra-narrow' | 'narrow' | 'medium' | 'wide'

      // Drop cap settings
      showDropCap: true,
      dropCapColor: '#fbbf24',
      dropCapSize: '56',
      
      // First line style
      firstLineSize: '24',
      firstLineWeight: '600',
      firstLineColor: '#ffffff',
      
      // Body text style
      textStyle: {
        size: '18',
        weight: 'normal',
        color: '#e5e5e5',
        font: 'IBM Plex Sans, sans-serif',
        leading: '1.7'
      },
      expectedViewTime: null
    };
  },

  editor({ block }) {
    const b = block;
    const imageWidthOpts = ['30', '40', '50', '60'];
    const positionOpts = ['left', 'right'];

    const subheadStyle = b.subheadStyle || {};
    const pullQuoteStyle = b.pullQuoteStyle || {};
    const textStyle = b.textStyle || {};

    // Build pull quote position options (show up to 10 options or actual paragraph count, whichever is greater)
    const paragraphs = (b.bodyText || '').split(/\n\n+/).filter(p => p.trim());
    const numParagraphs = Math.max(paragraphs.length, 10);
    let pullQuotePositionOptions = '<option value="0">Don\'t show pull quote</option>';
    for (let i = 1; i <= numParagraphs; i++) {
      pullQuotePositionOptions += '<option value="' + i + '" ' + ((b.pullQuotePosition || '0') === String(i) ? 'selected' : '') + '>After paragraph ' + i + '</option>';
    }

    // SECTION: Media (expanded)
    const mediaContent =
      '<label class="block text-sm mb-1">Image Path</label>' +
      '<input data-k="sideImage" value="' + (b.sideImage || '') + '" class="w-full border rounded px-2 py-1 mb-2" placeholder="Image path">' +
      '<label class="block text-sm mb-1">Video Path (optional - overrides image)</label>' +
      '<input data-k="sideVideo" value="' + (b.sideVideo || '') + '" class="w-full border rounded px-2 py-1 mb-3" placeholder="Video path">' +
      '<div class="grid grid-cols-2 gap-3">' +
        '<div>' +
          '<label class="block text-sm mb-1">Position</label>' +
          '<select data-k="sideImagePosition" class="w-full border rounded px-2 py-1">' +
            positionOpts.map(p => '<option ' + ((b.sideImagePosition || 'left') === p ? 'selected' : '') + ' value="' + p + '">' + p + '</option>').join('') +
          '</select>' +
        '</div>' +
        '<div>' +
          '<label class="block text-sm mb-1">Image Width (%)</label>' +
          '<select data-k="sideImageWidth" class="w-full border rounded px-2 py-1">' +
            imageWidthOpts.map(w => '<option ' + ((b.sideImageWidth || '40') === w ? 'selected' : '') + ' value="' + w + '">' + w + '%</option>').join('') +
          '</select>' +
        '</div>' +
      '</div>';

    // SECTION: Body Text (expanded) - includes style options
    const bodyTextContent =
      textToolbarHtml('bodyText') +
      '<textarea data-k="bodyText" rows="12" class="w-full border rounded px-2 py-1 mb-2">' + (b.bodyText || '') + '</textarea>' +
      '<p class="text-xs text-slate-500 mb-3">Separate paragraphs with double line breaks.</p>' +
      '<div class="mb-3">' +
        '<label class="block text-xs mb-1">Text Width</label>' +
        '<select data-k="textWidth" class="w-full border rounded px-2 py-1">' + textWidthSelectHtml(b.textWidth) + '</select>' +
      '</div>' +
      '<div class="p-2 border rounded bg-slate-50">' +
        '<div class="text-xs font-semibold mb-2">Style</div>' +
        styleInheritControls(b, '_isBodyStyleMaster', '_inheritBodyStyle', true, 'body') +
        '<div class="body-style-fields' + (b._inheritBodyStyle !== false && !b._isBodyStyleMaster ? ' opacity-50 pointer-events-none' : '') + '">' +
          '<div class="grid grid-cols-3 gap-2 mb-2">' +
            '<div>' +
              '<label class="block text-xs">Size (px)</label>' +
              '<input data-k="textStyle.size" type="number" min="12" max="32" value="' + getStyle(textStyle, 'size', '18') + '" class="w-full border rounded px-2 py-1 text-sm">' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Weight</label>' +
              '<select data-k="textStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' + weightSelectHtml(getStyle(textStyle, 'weight', 'normal')) + '</select>' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Color</label>' +
              '<input type="color" data-k="textStyle.color" value="' + getStyle(textStyle, 'color', '#e5e5e5') + '" class="w-full h-7 border rounded">' +
            '</div>' +
          '</div>' +
          '<div class="mb-2">' +
            '<label class="block text-xs">Font</label>' +
            '<select data-k="textStyle.font" class="w-full border rounded px-2 py-1 text-xs">' + fontSelectHtml(getStyle(textStyle, 'font', 'IBM Plex Sans, sans-serif')) + '</select>' +
          '</div>' +
          '<div>' +
            '<label class="block text-xs">Line Height: ' + getStyle(textStyle, 'leading', '1.7') + '</label>' +
            '<input data-k="textStyle.leading" type="range" min="1.0" max="2.5" step="0.1" value="' + getStyle(textStyle, 'leading', '1.7') + '" class="w-full">' +
          '</div>' +
        '</div>' +
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
          '<input data-k="bylineText" value="' + (b.bylineText || 'By Marcus Chan') + '" class="w-full border rounded px-2 py-1 text-sm" placeholder="By Your Name">' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-3 mb-3">' +
          '<div>' +
            '<label class="block text-xs mb-1">Dateline</label>' +
            '<input data-k="bylineDateline" value="' + (b.bylineDateline || '') + '" class="w-full border rounded px-2 py-1 text-sm" placeholder="Lone Pine, CA">' +
          '</div>' +
          '<div>' +
            '<label class="block text-xs mb-1">Date</label>' +
            '<input data-k="bylineDate" value="' + (b.bylineDate || 'November 2024') + '" class="w-full border rounded px-2 py-1 text-sm">' +
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
              '<select data-k="bylineStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' + weightSelectHtml(getStyle(b.bylineStyle || {}, 'weight', 'normal')) + '</select>' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Color</label>' +
              '<input type="color" data-k="bylineStyle.color" value="' + getStyle(b.bylineStyle || {}, 'color', '#e5e5e5') + '" class="w-full h-7 border rounded">' +
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
              '<select data-k="datelineStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' + weightSelectHtml(getStyle(b.datelineStyle || {}, 'weight', 'normal')) + '</select>' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Color</label>' +
              '<input type="color" data-k="datelineStyle.color" value="' + getStyle(b.datelineStyle || {}, 'color', '#9ca3af') + '" class="w-full h-7 border rounded">' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // SECTION: Subhead (collapsed)
    const subheadContent =
      '<input data-k="subhead" value="' + (b.subhead || '') + '" class="w-full border rounded px-2 py-1 mb-3" placeholder="Appears above body text">' +
      '<div class="p-2 border rounded bg-slate-50">' +
        '<div class="text-xs font-semibold mb-2">Style</div>' +
        styleInheritControls(b, '_isSubheadStyleMaster', '_inheritSubheadStyle', true, 'subhead') +
        '<div class="subhead-style-fields' + (b._inheritSubheadStyle !== false && !b._isSubheadStyleMaster ? ' opacity-50 pointer-events-none' : '') + '">' +
          '<div class="grid grid-cols-3 gap-2 mb-2">' +
            '<div>' +
              '<label class="block text-xs">Size</label>' +
              '<input data-k="subheadStyle.size" type="number" min="12" max="48" value="' + getStyle(subheadStyle, 'size', '24') + '" class="w-full border rounded px-2 py-1 text-sm">' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Weight</label>' +
              '<select data-k="subheadStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' + weightSelectHtml(getStyle(subheadStyle, 'weight', 'normal')) + '</select>' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Color</label>' +
              '<input type="color" data-k="subheadStyle.color" value="' + getStyle(subheadStyle, 'color', '#d1d5db') + '" class="w-full h-7 border rounded">' +
            '</div>' +
          '</div>' +
          '<div class="flex items-center gap-4">' +
            '<div class="flex-1">' +
              '<label class="block text-xs">Font</label>' +
              '<select data-k="subheadStyle.font" class="w-full border rounded px-2 py-1 text-xs">' + fontSelectHtml(getStyle(subheadStyle, 'font', 'IBM Plex Sans, sans-serif')) + '</select>' +
            '</div>' +
            '<label class="flex items-center gap-1 text-xs pt-4">' +
              '<input type="checkbox" data-k="subheadStyle.italic" ' + (getStyle(subheadStyle, 'italic', false) ? 'checked' : '') + '>' +
              '<span>Italic</span>' +
            '</label>' +
          '</div>' +
        '</div>' +
      '</div>';

    // SECTION: Pull Quote (collapsed)
    const pullQuoteContent =
      '<textarea data-k="pullQuote" rows="2" class="w-full border rounded px-2 py-1 mb-2" placeholder="Enter pull quote text...">' + (b.pullQuote || '') + '</textarea>' +
      '<div class="mb-3">' +
        '<label class="block text-xs mb-1">Position</label>' +
        '<select data-k="pullQuotePosition" class="w-full border rounded px-2 py-1">' + pullQuotePositionOptions + '</select>' +
      '</div>' +
      '<div class="p-2 border rounded bg-slate-50">' +
        '<div class="text-xs font-semibold mb-2">Style</div>' +
        styleInheritControls(b, '_isPullQuoteStyleMaster', '_inheritPullQuoteStyle', false, 'pullquote') +
        '<div class="pullquote-style-fields' + (b._inheritPullQuoteStyle === true && !b._isPullQuoteStyleMaster ? ' opacity-50 pointer-events-none' : '') + '">' +
          '<div class="grid grid-cols-3 gap-2 mb-2">' +
            '<div>' +
              '<label class="block text-xs">Size</label>' +
              '<input data-k="pullQuoteStyle.size" type="number" min="16" max="48" value="' + getStyle(pullQuoteStyle, 'size', '24') + '" class="w-full border rounded px-2 py-1 text-sm">' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Weight</label>' +
              '<select data-k="pullQuoteStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' + weightSelectHtml(getStyle(pullQuoteStyle, 'weight', '500')) + '</select>' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Text Color</label>' +
              '<input type="color" data-k="pullQuoteStyle.color" value="' + getStyle(pullQuoteStyle, 'color', '#ffffff') + '" class="w-full h-7 border rounded">' +
            '</div>' +
          '</div>' +
          '<div class="grid grid-cols-2 gap-2 mb-2">' +
            '<div>' +
              '<label class="block text-xs">Background</label>' +
              '<input type="color" data-k="pullQuoteStyle.bgColor" value="' + getStyle(pullQuoteStyle, 'bgColor', '#3d3314') + '" class="w-full h-7 border rounded">' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Border</label>' +
              '<input type="color" data-k="pullQuoteStyle.borderColor" value="' + getStyle(pullQuoteStyle, 'borderColor', '#fbbf24') + '" class="w-full h-7 border rounded">' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<label class="block text-xs">Font</label>' +
            '<select data-k="pullQuoteStyle.font" class="w-full border rounded px-2 py-1 text-xs">' + fontSelectHtml(getStyle(pullQuoteStyle, 'font', 'IBM Plex Sans, sans-serif')) + '</select>' +
          '</div>' +
        '</div>' +
      '</div>';

    // SECTION: Drop Cap & First Line (collapsed)
    const dropCapContent =
      '<label class="flex items-center gap-2 font-semibold mb-3">' +
        '<input type="checkbox" data-k="showDropCap" ' + (b.showDropCap !== false ? 'checked' : '') + '>' +
        '<span>Enable Drop Cap & First Line Style</span>' +
      '</label>' +
      '<div class="' + (b.showDropCap !== false ? '' : 'opacity-50') + '">' +
        styleInheritControls(b, '_isDropCapStyleMaster', '_inheritDropCapStyle', false, 'dropcap') +
        '<div class="dropcap-style-fields' + (b._inheritDropCapStyle === true && !b._isDropCapStyleMaster ? ' opacity-50 pointer-events-none' : '') + '">' +
          '<div class="grid grid-cols-2 gap-3 mb-3">' +
            '<div>' +
              '<label class="block text-xs mb-1">Drop Cap Color</label>' +
              '<input type="color" data-k="dropCapColor" value="' + (b.dropCapColor || '#fbbf24') + '" class="w-full h-8 border rounded">' +
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
              '<input data-k="firstLineSize" type="number" min="18" max="36" value="' + (b.firstLineSize || '24') + '" class="w-full border rounded px-2 py-1">' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs mb-1">Weight</label>' +
              '<select data-k="firstLineWeight" class="w-full border rounded px-2 py-1 text-xs">' + weightSelectHtml(b.firstLineWeight || '600') + '</select>' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs mb-1">Color</label>' +
              '<input type="color" data-k="firstLineColor" value="' + (b.firstLineColor || '#ffffff') + '" class="w-full h-8 border rounded">' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // SECTION: Block Settings (collapsed)
    const blockSettingsContent =
      '<div class="mb-3">' +
        '<label class="block text-sm mb-1">Background Color</label>' +
        styleInheritControls(b, '_isBgColorMaster', '_inheritBgColor', false, 'bgcolor', 'color') +
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
      '<div class="p-2 border rounded bg-slate-100 mb-2">' +
        '<label class="flex items-center gap-2 text-sm">' +
          '<input type="checkbox" data-k="_fadeOnScroll" ' + (b._fadeOnScroll ? 'checked' : '') + '>' +
          '<span>Enable fade effect on scroll</span>' +
        '</label>' +
        '<p class="text-xs text-slate-500 mt-1 ml-5">Content fades in when scrolled into view</p>' +
      '</div>' +
      '<div class="p-2 border rounded bg-purple-50 border-purple-200 mb-2">' +
        '<label class="flex items-center gap-2 text-sm">' +
          '<input type="checkbox" data-k="mobileSubheadOverlay" ' + (b.mobileSubheadOverlay ? 'checked' : '') + '>' +
          '<span>Mobile: Overlay subhead on image</span>' +
        '</label>' +
      '</div>' +
      '<div class="p-2 border rounded bg-purple-50 border-purple-200 mb-3">' +
        '<label class="flex items-center gap-2 text-sm">' +
          '<input type="checkbox" data-k="mobileBylineOverlay" ' + (b.mobileBylineOverlay ? 'checked' : '') + '>' +
          '<span>Mobile: Overlay byline on image</span>' +
        '</label>' +
      '</div>' +
      '<div>' +
        '<label class="block text-xs mb-1">Expected View Time (seconds)</label>' +
        '<input type="number" data-k="expectedViewTime" min="1" max="300" step="1" ' +
          'value="' + (b.expectedViewTime || '') + '" ' +
          'placeholder="Auto-calculated if empty" ' +
          'class="w-full px-2 py-1 border border-gray-300 rounded text-sm" />' +
        '<p class="text-xs text-slate-500 mt-1">Override for analytics. Leave empty for auto.</p>' +
      '</div>';

    // Assemble all sections (alphabetical order, all collapsed)
    return labelFieldHtml(b.label, 'e.g., Opening scene...') +
      collapsibleSection('⚙️ Block Settings', blockSettingsContent, true) +
      collapsibleSection('📄 Body Text', bodyTextContent, true) +
      collapsibleSection('👤 Byline', bylineContent, true) +
      collapsibleSection('🔤 Drop Cap & First Line', dropCapContent, true) +
      collapsibleSection('🖼️ Media', mediaContent, true) +
      collapsibleSection('💬 Pull Quote', pullQuoteContent, true) +
      collapsibleSection('📰 Subhead', subheadContent, true);
  },

  preview({ block, project, blocks = [] }) {
    const b = block;
    const pt = paddingClassMap[b.paddingTop || 'medium'].pt;
    const pb = paddingClassMap[b.paddingBottom || 'medium'].pb;

    // Get effective styles using shared utilities
    const effectiveTextStyle = getEffectiveStyle(b, blocks, 'textStyle', '_isBodyStyleMaster', '_inheritBodyStyle', true);
    const effectiveSubheadStyle = getEffectiveStyle(b, blocks, 'subheadStyle', '_isSubheadStyleMaster', '_inheritSubheadStyle', true);
    const effectivePullQuoteStyle = getEffectivePullQuoteStyle(b, blocks);

    // Debug: log what photoLedeSide preview is receiving
    console.log('[PLS Preview] _inheritPullQuoteStyle:', b._inheritPullQuoteStyle);
    console.log('[PLS Preview] effectivePullQuoteStyle:', effectivePullQuoteStyle);
    console.log('[PLS Preview] effectivePullQuoteStyle.bgColor:', effectivePullQuoteStyle.bgColor);

    const subheadStyleStr = buildInlineStyle(effectiveSubheadStyle, { color: '#d1d5db', size: '24', font: 'IBM Plex Sans, sans-serif', weight: 'normal', leading: '1.5' });
    const pullQuoteStyleStr = buildInlineStyle(effectivePullQuoteStyle, { color: '#ffffff', size: '24', font: 'IBM Plex Sans, sans-serif', weight: '500', leading: '1.8' });
    const pullQuoteBgColor = effectivePullQuoteStyle.bgColor || '#3d3314';
    const pullQuoteBorderColor = effectivePullQuoteStyle.borderColor || '#fbbf24';
    const textStyleStr = buildInlineStyle(effectiveTextStyle, { color: '#e5e5e5', size: '18', font: 'IBM Plex Sans, sans-serif', weight: 'normal', leading: '1.7' });

    // Build pull quote HTML (only if text exists and position > 0)
    const pullQuotePosition = parseInt(b.pullQuotePosition || '0');
    let pullQuoteHtml = '';
    if (b.pullQuote && b.pullQuote.trim() && pullQuotePosition > 0) {
      pullQuoteHtml = '<div style="background:' + pullQuoteBgColor + ';padding:30px 40px;border-left:4px solid ' + pullQuoteBorderColor + ';margin:30px 0;">' +
        '<p style="' + pullQuoteStyleStr + 'margin:0;">' + processBodyText(b.pullQuote || '') + '</p>' +
      '</div>';
    }

    // Build byline HTML
    let bylineHtml = '';
    if (b.showByline) {
      const bylineStyle = buildInlineStyle(b.bylineStyle, { color: '#e5e5e5', size: '16', font: 'IBM Plex Sans, sans-serif', weight: 'normal', leading: '1.6' });
      const datelineStyleObj = b.datelineStyle || {};
      const datelineSize = datelineStyleObj.size || '14';
      const datelineWeight = datelineStyleObj.weight || 'normal';
      const datelineColor = datelineStyleObj.color || '#9ca3af';
      const datelineFontWeight = datelineWeight === 'bold' ? '700' : '400';

      const bylineText = b.bylineText || 'By Marcus Chan';
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

      bylineHtml = '<div style="margin-bottom:36px;">' +
        '<div style="' + bylineStyle + '">' + bylineText + '</div>' +
        secondLine +
      '</div>';
    }

    // Build subhead HTML - for desktop text
    const subheadHtml = b.subhead ? '<h3 style="' + subheadStyleStr + 'margin-bottom:24px;">' + b.subhead + '</h3>' : '';

    // Compute drop cap values
    const useDropCap = b.showDropCap !== false;
    const dropCapSettings = useDropCap ? getEffectiveDropCapSettings(b, blocks) : null;

    // Generate unique ID for this block's drop cap
    const blockId = generateBlockId('pls');
    const dropCapClass = 'photo-lede-side-drop-cap-' + blockId;

    // Build body text with pull quote inserted
    const paragraphs = (b.bodyText || '').split(/\n\n+/).filter(p => p.trim());
    let bodyParts = [];
    paragraphs.forEach((para, idx) => {
      if (idx === 0 && useDropCap) {
        bodyParts.push('<p class="' + dropCapClass + '" style="' + textStyleStr + 'margin-bottom:20px;">' + processBodyText(para) + '</p>');
      } else {
        bodyParts.push('<p style="' + textStyleStr + 'margin-bottom:20px;">' + processBodyText(para) + '</p>');
      }
      if (idx + 1 === pullQuotePosition && pullQuoteHtml) {
        bodyParts.push(pullQuoteHtml);
      }
    });

    // Desktop text content always includes subhead
    const textContentHtml = bylineHtml + subheadHtml + bodyParts.join('');
    
    // Mobile: handle overlay options
    const mobileSubheadOverlay = b.mobileSubheadOverlay || false;
    const mobileBylineOverlay = b.mobileBylineOverlay || false;

    // Mobile subhead: only in text if NOT using overlay
    const mobileSubheadHtml = (!mobileSubheadOverlay && b.subhead) ? '<h3 style="' + subheadStyleStr + 'margin-bottom:24px;">' + b.subhead + '</h3>' : '';
    
    // Mobile byline: only in text if NOT using overlay
    const mobileBylineHtml = (!mobileBylineOverlay && b.showByline) ? bylineHtml : '';
    
    const mobileTextContentHtml = mobileBylineHtml + mobileSubheadHtml + bodyParts.join('');
    
    // Build subhead overlay HTML for mobile (if enabled)
    let subheadOverlayHtml = '';
    if (mobileSubheadOverlay && b.subhead) {
      subheadOverlayHtml = '<div class="pls-mobile-subhead-overlay"><div class="pls-mobile-subhead-text" style="' + subheadStyleStr + '">' + b.subhead + '</div></div>';
    }

    // Build byline overlay HTML for mobile (if enabled)
    let bylineOverlayHtml = '';
    if (mobileBylineOverlay && b.showByline) {
      const mobileBylineStyle = buildInlineStyle(b.bylineStyle, { color: '#9ca3af', size: '16', font: 'IBM Plex Sans, sans-serif', weight: 'normal', leading: '1.6' });
      const bylineText = b.bylineText || 'By Marcus Chan';
      const dateline = b.bylineDateline || '';
      const date = b.bylineDate || '';
      
      let secondLine = '';
      const parts = [];
      if (dateline) parts.push(dateline);
      if (date) parts.push(date);
      
      if (parts.length > 0) {
        const separator = ' <span style="color:#6b7280;padding:0 6px;">|</span> ';
        secondLine = '<div style="font-size:14px;margin-top:4px;">' + parts.join(separator) + '</div>';
      }
      
      bylineOverlayHtml = '<div class="pls-mobile-byline-overlay"><div class="pls-mobile-byline-text" style="' + mobileBylineStyle + '">' + bylineText + secondLine + '</div></div>';
    }

    // Text width class
    const textWidthClass = textWidthClassMap[b.textWidth || 'medium'];

    // Build side image and text
    const imgWidth = b.sideImageWidth || '40';
    const textWidth = 100 - parseInt(imgWidth);
    
    const mediaHtml = (b.sideVideo && b.sideVideo.trim()) 
      ? '<video autoplay muted loop playsinline src="' + resolvePreviewPath(b.sideVideo, project) + '" class="pls-media"></video>'
      : '<img src="' + resolvePreviewPath(b.sideImage, project) + '" class="pls-media" alt="">';
    
    const imageHtml = '<div class="pls-image" style="width:' + imgWidth + '%;">' + mediaHtml + '</div>';
    const textHtml = '<div class="pls-text" style="width:' + textWidth + '%;padding-left:' + (b.sideImagePosition === 'left' ? '40px' : '0') + ';padding-right:' + (b.sideImagePosition === 'right' ? '40px' : '0') + ';"><div class="' + textWidthClass + ' mx-auto">' + textContentHtml + '</div></div>';

    // Desktop layout (respects position setting)
    const desktopContent = '<div class="pls-desktop">' +
      (b.sideImagePosition === 'left' ? imageHtml + textHtml : textHtml + imageHtml) +
    '</div>';

    // Mobile layout (image always on top, with optional overlays)
    const overlayHtml = subheadOverlayHtml + bylineOverlayHtml;
    const mobileImageHtml = '<div class="pls-mobile-image">' + mediaHtml + overlayHtml + '</div>';
    const mobileTextHtml = '<div class="pls-mobile-text"><div class="' + textWidthClass + '">' + mobileTextContentHtml + '</div></div>';
    const mobileContent = '<div class="pls-mobile">' + mobileImageHtml + mobileTextHtml + '</div>';

    // CSS for drop cap, first line, and links
    const bgColor = getEffectiveBgColor(b, blocks);
    const linkStyles = getLinkStyles(bgColor, '.pls-section');
    const dropCapStyles = useDropCap ? dropCapCss(dropCapClass, dropCapSettings) : '';
    const styleTag = '<style>' + dropCapStyles + linkStyles + '</style>';

    const fadeAttr = block._fadeOnScroll ? ' data-fade-scroll="true"' : '';

    return styleTag + '<section class="pls-section ' + pt + ' ' + pb + '" style="background-color:' + bgColor + ';"' + fadeAttr + '>' + desktopContent + mobileContent + '</section>';
  },

  exportHTML({ block, blocks = [] }) {
    const b = block;
    const pt = paddingClassMap[b.paddingTop || 'medium'].pt;
    const pb = paddingClassMap[b.paddingBottom || 'medium'].pb;

    // Get effective styles using shared utilities
    const effectiveTextStyle = getEffectiveStyle(b, blocks, 'textStyle', '_isBodyStyleMaster', '_inheritBodyStyle', true);
    const effectiveSubheadStyle = getEffectiveStyle(b, blocks, 'subheadStyle', '_isSubheadStyleMaster', '_inheritSubheadStyle', true);
    const effectivePullQuoteStyle = getEffectivePullQuoteStyle(b, blocks);

    const subheadStyleStr = buildInlineStyle(effectiveSubheadStyle, { color: '#d1d5db', size: '24', font: 'IBM Plex Sans, sans-serif', weight: 'normal', leading: '1.5' });
    const pullQuoteStyleStr = buildInlineStyle(effectivePullQuoteStyle, { color: '#ffffff', size: '24', font: 'IBM Plex Sans, sans-serif', weight: '500', leading: '1.8' });
    const pullQuoteBgColor = effectivePullQuoteStyle.bgColor || '#3d3314';
    const pullQuoteBorderColor = effectivePullQuoteStyle.borderColor || '#fbbf24';
    const textStyleStr = buildInlineStyle(effectiveTextStyle, { color: '#e5e5e5', size: '18', font: 'IBM Plex Sans, sans-serif', weight: 'normal', leading: '1.7' });

    // Build pull quote HTML
    const pullQuotePosition = parseInt(b.pullQuotePosition || '0');
    let pullQuoteHtml = '';
    if (b.pullQuote && b.pullQuote.trim() && pullQuotePosition > 0) {
      pullQuoteHtml = '<div style="background:' + pullQuoteBgColor + ';padding:30px 40px;border-left:4px solid ' + pullQuoteBorderColor + ';margin:30px 0;">' +
        '<p style="' + pullQuoteStyleStr + 'margin:0;">' + processBodyText(b.pullQuote || '', { brTag: '<br/>' }) + '</p>' +
      '</div>';
    }

    // Build byline HTML
    let bylineHtml = '';
    if (b.showByline) {
      const bylineStyleLocal = buildInlineStyle(b.bylineStyle, { color: '#e5e5e5', size: '16', font: 'IBM Plex Sans, sans-serif', weight: 'normal', leading: '1.6' });
      const datelineStyleObj = b.datelineStyle || {};
      const datelineSize = datelineStyleObj.size || '14';
      const datelineWeight = datelineStyleObj.weight || 'normal';
      const datelineColor = datelineStyleObj.color || '#9ca3af';
      const datelineFontWeight = datelineWeight === 'bold' ? '700' : '400';

      const bylineText = b.bylineText || 'By Marcus Chan';
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

      bylineHtml = '<div style="margin-bottom:36px;">' +
        '<div style="' + bylineStyleLocal + '">' + String(bylineText) + '</div>' +
        secondLine +
      '</div>';
    }

    // Build subhead HTML - for desktop
    const subheadHtml = b.subhead ? '<h3 style="' + subheadStyleStr + 'margin-bottom:24px;">' + String(b.subhead) + '</h3>' : '';

    // Build body text with pull quote inserted
    const paragraphs = String(b.bodyText || '').split(/\n\n+/).filter(p => p.trim());
    const useDropCap = b.showDropCap !== false;
    const dropCapSettings = useDropCap ? getEffectiveDropCapSettings(b, blocks) : null;

    // Generate unique ID for this block's drop cap
    const blockId = generateBlockId('pls');
    const dropCapClass = 'photo-lede-side-drop-cap-' + blockId;

    let bodyParts = [];
    paragraphs.forEach((para, idx) => {
      if (idx === 0 && useDropCap) {
        bodyParts.push('<p class="' + dropCapClass + '" style="' + textStyleStr + 'margin-bottom:20px;">' + processBodyText(para, { brTag: '<br/>' }) + '</p>');
      } else {
        bodyParts.push('<p style="' + textStyleStr + 'margin-bottom:20px;">' + processBodyText(para, { brTag: '<br/>' }) + '</p>');
      }
      if (idx + 1 === pullQuotePosition && pullQuoteHtml) {
        bodyParts.push(pullQuoteHtml);
      }
    });

    // Desktop text content always includes subhead
    const textContentHtml = bylineHtml + subheadHtml + bodyParts.join('');

    // Mobile: handle overlay options
    const mobileSubheadOverlay = b.mobileSubheadOverlay || false;
    const mobileBylineOverlay = b.mobileBylineOverlay || false;

    // Mobile subhead: only in text if NOT using overlay
    const mobileSubheadHtml = (!mobileSubheadOverlay && b.subhead) ? '<h3 style="' + subheadStyleStr + 'margin-bottom:24px;">' + String(b.subhead) + '</h3>' : '';

    // Mobile byline: only in text if NOT using overlay
    const mobileBylineHtml = (!mobileBylineOverlay && b.showByline) ? bylineHtml : '';

    const mobileTextContentHtml = mobileBylineHtml + mobileSubheadHtml + bodyParts.join('');

    // Build subhead overlay HTML for mobile (if enabled)
    let subheadOverlayHtml = '';
    if (mobileSubheadOverlay && b.subhead) {
      subheadOverlayHtml = '<div class="pls-mobile-subhead-overlay"><div class="pls-mobile-subhead-text" style="' + subheadStyleStr + '">' + String(b.subhead) + '</div></div>';
    }

    // Build byline overlay HTML for mobile (if enabled)
    let bylineOverlayHtml = '';
    if (mobileBylineOverlay && b.showByline) {
      const bylineOverlayStyle = buildInlineStyle(b.bylineStyle, { color: '#9ca3af', size: '16', font: 'IBM Plex Sans, sans-serif', weight: 'normal', leading: '1.6' });
      const bylineText = b.bylineText || 'By Marcus Chan';
      const dateline = b.bylineDateline || '';
      const date = b.bylineDate || '';
      const readTime = (b.showReadTime !== false && b.readTime) ? b.readTime : '';

      let secondLine = '';
      const parts = [];
      if (dateline) parts.push(dateline);
      if (date) parts.push(date);
      if (readTime) parts.push(readTime + ' min read');

      if (parts.length > 0) {
        const separator = ' <span style="color:#6b7280;padding:0 6px;">|</span> ';
        secondLine = '<div style="font-size:14px;margin-top:4px;">' + parts.join(separator) + '</div>';
      }

      bylineOverlayHtml = '<div class="pls-mobile-byline-overlay"><div class="pls-mobile-byline-text" style="' + bylineOverlayStyle + '">' + String(bylineText) + secondLine + '</div></div>';
    }

    // Text width class
    const textWidthClass = textWidthClassMap[b.textWidth || 'medium'];

    // Build side image and text
    const imgWidth = b.sideImageWidth || '40';
    const textWidth = 100 - parseInt(imgWidth);
    
    let mediaHtml;
    if (b.sideVideo && b.sideVideo.trim()) {
      const videoId = 'pls-video-' + Math.random().toString(36).substr(2, 9);
      mediaHtml = '<div style="position:relative;width:100%;height:100%;"><video id="' + videoId + '" autoplay muted loop playsinline src="' + resolveExportPath(b.sideVideo) + '" class="pls-media"></video>' +
        '<button onclick="toggleMute(\'' + videoId + '\', this)" style="position:absolute;bottom:20px;left:20px;width:44px;height:44px;background:rgba(0,0,0,0.7);border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:100;" aria-label="Toggle mute">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" opacity="0.3" class="unmuted-path"/><line x1="2" y1="2" x2="22" y2="22" stroke="white" stroke-width="2" class="muted-line" style="display:none;"/></svg>' +
        '</button></div>';
    } else {
      mediaHtml = '<img src="' + resolveExportPath(b.sideImage) + '" class="pls-media" alt="">';
    }
    
    const imageHtml = '<div class="pls-image" style="width:' + imgWidth + '%;">' + mediaHtml + '</div>';
    const textHtml = '<div class="pls-text" style="width:' + textWidth + '%;padding-left:' + (b.sideImagePosition === 'left' ? '40px' : '0') + ';padding-right:' + (b.sideImagePosition === 'right' ? '40px' : '0') + ';"><div class="' + textWidthClass + ' mx-auto">' + textContentHtml + '</div></div>';

    // Desktop layout (respects position setting)
    const desktopContent = '<div class="pls-desktop">' + 
      (b.sideImagePosition === 'left' ? imageHtml + textHtml : textHtml + imageHtml) +
    '</div>';
    
    // Mobile layout (image always on top, with optional overlays)
    // Include mute button for video on mobile
    let mobileMediaHtml;
    if (b.sideVideo && b.sideVideo.trim()) {
      const mobileVideoId = 'pls-mobile-video-' + Math.random().toString(36).substr(2, 9);
      const muteButtonSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" opacity="0.3" class="unmuted-path"/><line x1="2" y1="2" x2="22" y2="22" stroke="white" stroke-width="2" class="muted-line" style="display:none;"/></svg>';
      mobileMediaHtml = '<video id="' + mobileVideoId + '" autoplay muted loop playsinline src="' + resolveExportPath(b.sideVideo) + '" class="pls-media"></video>' +
        '<button onclick="toggleMute(\'' + mobileVideoId + '\', this)" class="mute-btn mobile-mute-btn" aria-label="Toggle mute">' + muteButtonSvg + '</button>';
    } else {
      mobileMediaHtml = '<img src="' + resolveExportPath(b.sideImage) + '" class="pls-media" alt="">';
    }
    
    const overlayHtml = subheadOverlayHtml + bylineOverlayHtml;
    const mobileImageHtml = '<div class="pls-mobile-image">' + mobileMediaHtml + overlayHtml + '</div>';
    const mobileTextHtml = '<div class="pls-mobile-text"><div class="' + textWidthClass + '">' + mobileTextContentHtml + '</div></div>';
    const mobileContent = '<div class="pls-mobile">' + mobileImageHtml + mobileTextHtml + '</div>';

    // CSS for drop cap, first line, and links
    const bgColor = getEffectiveBgColor(b, blocks);
    const linkStyles = getLinkStyles(bgColor, '.pls-section');
    const dropCapStyles = useDropCap ? dropCapCss(dropCapClass, dropCapSettings) : '';
    const styleTag = '<style>' + dropCapStyles + linkStyles + '</style>';

    const fadeAttr = block._fadeOnScroll ? ' data-fade-scroll="true"' : '';

    return styleTag + '<section class="pls-section ' + pt + ' ' + pb + '" style="position:relative;z-index:3;background-color:' + bgColor + ';"' + fadeAttr + '>' +
      '<div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:100vw;height:100%;background-color:' + bgColor + ';z-index:0;"></div>' +
      '<div style="position:relative;z-index:1;">' + desktopContent + mobileContent + '</div>' +
    '</section>';
  },

  set(block, key, value) {
    console.log('[PLS set] key:', key, 'value:', value);
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      if (!block[parent]) block[parent] = {};
      block[parent][child] = value;
    } else {
      block[key] = value;

      // When setting as pull quote style master, ensure pullQuoteStyle exists with defaults
      if (key === '_isPullQuoteStyleMaster' && value && !block.pullQuoteStyle) {
        block.pullQuoteStyle = {
          size: '24',
          weight: '500',
          italic: false,
          color: '#ffffff',
          font: 'IBM Plex Sans, sans-serif',
          leading: '1.8',
          bgColor: '#3d3314',
          borderColor: '#fbbf24'
        };
      }
    }
    console.log('[PLS set] after set, block._inheritPullQuoteStyle:', block._inheritPullQuoteStyle);
  }
};