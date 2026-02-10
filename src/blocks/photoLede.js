import { resolvePreviewPath, resolveExportPath, processBodyText, textToolbarHtml, getLinkStyles, bodyFonts, fontSelectHtml, globalBodyStyle } from '../utils.js';

export const PhotoLedeBlock = {
  type: 'photo-lede',
  title: 'Photo Lede (optional photo + drop cap text)',

  defaults() {
    return {
      type: 'photo-lede',
      label: '',
      bgColor: '#000000',
      paddingTop: 'medium',
      paddingBottom: 'medium',

      // Media section (optional)
      showMedia: true,
      image: '',
      video: '',
      imageWidth: 'medium', // 'narrow' | 'medium' | 'wide' | 'full'

      // Photo caption
      caption: '',
      captionStyle: {
        size: '16',
        color: '#aaaaaa',
        italic: true,
        font: 'IBM Plex Sans, sans-serif'
      },

      // Byline (optional)
      showByline: false,
      showReadTime: true,
      bylineText: 'By Author Name',
      bylineDateline: '',
      bylineDate: '',
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

      // Pull quote (optional)
      pullQuote: '',
      pullQuotePosition: '0',
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

      // Body text
      bodyText: '',

      textWidth: 'narrow', // 'extra-narrow' | 'narrow' | 'medium' | 'wide'

      // Drop cap settings (optional)
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
    const imageWidthOpts = ['narrow', 'medium', 'wide', 'full'];
    const textWidthOpts = ['extra-narrow', 'narrow', 'medium', 'wide'];
    const paddingSizes = [
      { value: 'none', label: 'None (0px)' },
      { value: 'tight', label: 'Tight (15px)' },
      { value: 'medium', label: 'Medium (30px)' },
      { value: 'spacious', label: 'Spacious (50px)' }
    ];
    const weightOpts = ['normal', '500', '600', 'bold'];
    // Use shared bodyFonts from utils.js

    const getStyle = (obj, prop, fallback) => (obj && obj[prop]) || fallback;
    const captionStyle = b.captionStyle || {};
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

    // Helper to create collapsible section
    const section = (title, content, collapsed = false) => {
      return '<div class="collapsible-section' + (collapsed ? ' collapsed' : '') + '">' +
        '<div class="collapsible-header">' +
          '<span>' + title + '</span>' +
          '<span class="collapsible-chevron">▼</span>' +
        '</div>' +
        '<div class="collapsible-content">' + content + '</div>' +
      '</div>';
    };

    // Block Label (always visible, not collapsible)
    const labelFieldHtml = '<div class="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">' +
      '<label class="block text-sm font-semibold text-blue-900 mb-2">📝 Block Label (Optional)</label>' +
      '<input type="text" data-k="label" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" ' +
        'placeholder="e.g., Journey begins..." ' +
        'value="' + (b.label || '') + '" />' +
    '</div>';

    // SECTION: Media (collapsed)
    const mediaContent =
      '<label class="flex items-center gap-2 font-semibold mb-3">' +
        '<input type="checkbox" data-k="showMedia" ' + (b.showMedia !== false ? 'checked' : '') + '>' +
        '<span>Enable Media</span>' +
      '</label>' +
      '<div class="' + (b.showMedia !== false ? '' : 'opacity-50') + '">' +
        '<label class="block text-sm mb-1">Image Path</label>' +
        '<input data-k="image" value="' + (b.image || '') + '" class="w-full border rounded px-2 py-1 mb-2" placeholder="Image path">' +
        '<label class="block text-sm mb-1">Video Path (optional - overrides image)</label>' +
        '<input data-k="video" value="' + (b.video || '') + '" class="w-full border rounded px-2 py-1 mb-3" placeholder="Video path">' +
        '<label class="block text-sm mb-1">Media Width</label>' +
        '<select data-k="imageWidth" class="w-full border rounded px-2 py-1 mb-3">' +
          imageWidthOpts.map(w => '<option ' + ((b.imageWidth || 'medium') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
        '</select>' +

        '<div class="pt-3 border-t border-gray-200">' +
          '<label class="block font-semibold text-sm mb-2">Caption (optional)</label>' +
          '<textarea data-k="caption" rows="2" class="w-full border rounded px-2 py-1 mb-2">' + (b.caption || '') + '</textarea>' +
          '<div class="p-2 border rounded bg-slate-50">' +
            '<div class="text-xs font-semibold mb-2">Caption Style</div>' +
            // Global styling controls for caption
            '<div class="mb-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs">' +
              '<label class="flex items-center gap-2 mb-2">' +
                '<input type="checkbox" data-k="_isCaptionStyleMaster" class="caption-style-master" ' + (b._isCaptionStyleMaster ? 'checked' : '') + '>' +
                '<span>Set styling for all blocks</span>' +
              '</label>' +
              '<label class="flex items-center gap-2">' +
                '<input type="checkbox" data-k="_inheritCaptionStyle" class="caption-style-inherit" ' + (b._inheritCaptionStyle === true ? 'checked' : '') + '>' +
                '<span class="text-gray-600">Inherit styling from master</span>' +
              '</label>' +
            '</div>' +
            '<div class="caption-style-fields' + (b._inheritCaptionStyle === true && !b._isCaptionStyleMaster ? ' opacity-50 pointer-events-none' : '') + '">' +
              '<div class="grid grid-cols-3 gap-2 mb-2">' +
                '<div>' +
                  '<label class="block text-xs">Size (px)</label>' +
                  '<input data-k="captionStyle.size" type="number" min="12" max="24" value="' + getStyle(captionStyle, 'size', '16') + '" class="w-full border rounded px-2 py-1 text-sm">' +
                '</div>' +
                '<div>' +
                  '<label class="block text-xs">Color</label>' +
                  '<input type="color" data-k="captionStyle.color" value="' + getStyle(captionStyle, 'color', '#aaaaaa') + '" class="w-full h-7 border rounded">' +
                '</div>' +
                '<div class="flex items-end">' +
                  '<label class="flex items-center gap-1 text-xs">' +
                    '<input type="checkbox" data-k="captionStyle.italic" ' + (getStyle(captionStyle, 'italic', true) ? 'checked' : '') + '>' +
                    '<span>Italic</span>' +
                  '</label>' +
                '</div>' +
              '</div>' +
              '<div>' +
                '<label class="block text-xs">Font</label>' +
                '<select data-k="captionStyle.font" class="w-full border rounded px-2 py-1 text-xs">' +
                  fontSelectHtml(getStyle(captionStyle, 'font', 'IBM Plex Sans, sans-serif')) +
                '</select>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // SECTION: Body Text (expanded)
    const bodyTextContent =
      textToolbarHtml('bodyText') +
      '<textarea data-k="bodyText" rows="12" class="w-full border rounded px-2 py-1 mb-2">' + (b.bodyText || '') + '</textarea>' +
      '<p class="text-xs text-slate-500 mb-3">Separate paragraphs with double line breaks.</p>' +
      '<div class="mb-3">' +
        '<label class="block text-xs mb-1">Text Width</label>' +
        '<select data-k="textWidth" class="w-full border rounded px-2 py-1">' +
          textWidthOpts.map(w => '<option ' + ((b.textWidth || 'narrow') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
        '</select>' +
      '</div>' +
      '<div class="p-2 border rounded bg-slate-50">' +
        '<div class="text-xs font-semibold mb-2">Style</div>' +
        // Global styling controls
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
              '<input data-k="textStyle.size" type="number" min="12" max="32" value="' + getStyle(textStyle, 'size', '18') + '" class="w-full border rounded px-2 py-1 text-sm">' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Weight</label>' +
              '<select data-k="textStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' +
                weightOpts.map(w => '<option ' + (getStyle(textStyle, 'weight', 'normal') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
              '</select>' +
            '</div>' +
            '<div>' +
              '<label class="block text-xs">Color</label>' +
              '<input type="color" data-k="textStyle.color" value="' + getStyle(textStyle, 'color', '#e5e5e5') + '" class="w-full h-7 border rounded">' +
            '</div>' +
          '</div>' +
          '<div class="mb-2">' +
            '<label class="block text-xs">Font</label>' +
            '<select data-k="textStyle.font" class="w-full border rounded px-2 py-1 text-xs">' +
              fontSelectHtml(getStyle(textStyle, 'font', 'IBM Plex Sans, sans-serif')) +
            '</select>' +
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
        '<input type="checkbox" data-k="showByline" ' + (b.showByline ? 'checked' : '') + '>' +
        '<span>Enable Byline</span>' +
      '</label>' +
      '<div class="' + (b.showByline ? '' : 'opacity-50') + '">' +
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
            '<input data-k="bylineDate" value="' + (b.bylineDate || '') + '" class="w-full border rounded px-2 py-1 text-sm" placeholder="November 2024">' +
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
              '<select data-k="datelineStyle.weight" class="w-full border rounded px-2 py-1 text-xs">' +
                weightOpts.map(w => '<option ' + (getStyle(b.datelineStyle || {}, 'weight', 'normal') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
              '</select>' +
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
        '<div class="subhead-style-fields' + (b._inheritSubheadStyle !== false && !b._isSubheadStyleMaster ? ' opacity-50 pointer-events-none' : '') + '">' +
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
              '<input type="color" data-k="subheadStyle.color" value="' + getStyle(subheadStyle, 'color', '#d1d5db') + '" class="w-full h-7 border rounded">' +
            '</div>' +
          '</div>' +
          '<div class="flex items-center gap-4">' +
            '<div class="flex-1">' +
              '<label class="block text-xs">Font</label>' +
              '<select data-k="subheadStyle.font" class="w-full border rounded px-2 py-1 text-xs">' +
                fontSelectHtml(getStyle(subheadStyle, 'font', 'IBM Plex Sans, sans-serif')) +
              '</select>' +
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
        '<select data-k="pullQuotePosition" class="w-full border rounded px-2 py-1">' +
          pullQuotePositionOptions +
        '</select>' +
      '</div>' +
      '<div class="p-2 border rounded bg-slate-50">' +
        '<div class="text-xs font-semibold mb-2">Style</div>' +
        // Global styling controls for pull quote
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
            '<select data-k="pullQuoteStyle.font" class="w-full border rounded px-2 py-1 text-xs">' +
              fontSelectHtml(getStyle(pullQuoteStyle, 'font', 'IBM Plex Sans, sans-serif')) +
            '</select>' +
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
        // Global styling controls for drop cap
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
              '<select data-k="firstLineWeight" class="w-full border rounded px-2 py-1 text-xs">' +
                weightOpts.map(w => '<option ' + ((b.firstLineWeight || '600') === w ? 'selected' : '') + ' value="' + w + '">' + w + '</option>').join('') +
              '</select>' +
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
        // Global styling controls for background color
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
    return labelFieldHtml +
      section('⚙️ Block Settings', blockSettingsContent, true) +
      section('📄 Body Text', bodyTextContent, true) +
      section('👤 Byline', bylineContent, true) +
      section('🔤 Drop Cap & First Line', dropCapContent, true) +
      section('🖼️ Media', mediaContent, true) +
      section('💬 Pull Quote', pullQuoteContent, true) +
      section('📰 Subhead', subheadContent, true);
  },

  preview({ block, project, blocks = [] }) {
    const b = block;
    const paddingMap = { none: 'py-0', tight: 'py-4', medium: 'py-16', spacious: 'py-24' };
    const pt = paddingMap[b.paddingTop || 'medium'].replace('py', 'pt');
    const pb = paddingMap[b.paddingBottom || 'medium'].replace('py', 'pb');

    // Check for inherited body text style
    let effectiveTextStyle = b.textStyle || {};
    if (b._inheritBodyStyle !== false) {
      const masterBlock = blocks.find(blk => blk._isBodyStyleMaster && blk !== b);
      if (masterBlock && masterBlock.textStyle) {
        effectiveTextStyle = masterBlock.textStyle;
      }
    }

    const imageWidthMap = {
      'narrow': 'max-w-2xl',
      'medium': 'max-w-4xl',
      'wide': 'max-w-6xl',
      'full': 'w-full'
    };
    const imgWidthClass = imageWidthMap[b.imageWidth || 'medium'];

    const textWidthMap = {
      'extra-narrow': 'max-w-md',
      'narrow': 'max-w-lg',
      'medium': 'max-w-4xl',
      'wide': 'max-w-6xl'
    };
    const textWidthClass = textWidthMap[b.textWidth || 'narrow'];

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

    // Check for inherited caption style
    let effectiveCaptionStyle = b.captionStyle || {};
    if (b._inheritCaptionStyle === true) {
      const masterBlock = blocks.find(blk => blk._isCaptionStyleMaster && blk !== b);
      if (masterBlock && masterBlock.captionStyle) {
        effectiveCaptionStyle = masterBlock.captionStyle;
      }
    }

    const captionStyle = buildStyle(effectiveCaptionStyle, { color: '#aaaaaa', size: '16', font: 'IBM Plex Sans, sans-serif', weight: 'normal', leading: '1.5' });

    // Check for inherited subhead style
    let effectiveSubheadStyle = b.subheadStyle || {};
    if (b._inheritSubheadStyle !== false) {
      const masterBlock = blocks.find(blk => blk._isSubheadStyleMaster && blk !== b);
      if (masterBlock && masterBlock.subheadStyle) {
        effectiveSubheadStyle = masterBlock.subheadStyle;
      }
    }
    const subheadStyle = buildStyle(effectiveSubheadStyle, { color: '#d1d5db', size: '24', font: 'IBM Plex Sans, sans-serif', weight: 'normal', leading: '1.5' });

    // Check for inherited pull quote style
    let effectivePullQuoteStyle = b.pullQuoteStyle || {};
    if (b._inheritPullQuoteStyle === true) {
      const masterBlock = blocks.find(blk => blk._isPullQuoteStyleMaster && blk !== b);
      if (masterBlock && masterBlock.pullQuoteStyle) {
        effectivePullQuoteStyle = masterBlock.pullQuoteStyle;
      }
    }
    const pullQuoteStyle = buildStyle(effectivePullQuoteStyle, { color: '#ffffff', size: '24', font: 'IBM Plex Sans, sans-serif', weight: '500', leading: '1.8' });
    const pullQuoteBgColor = (effectivePullQuoteStyle && effectivePullQuoteStyle.bgColor) || '#3d3314';
    const pullQuoteBorderColor = (effectivePullQuoteStyle && effectivePullQuoteStyle.borderColor) || '#fbbf24';

    const textStyle = buildStyle(effectiveTextStyle, { color: '#e5e5e5', size: '18', font: 'IBM Plex Sans, sans-serif', weight: 'normal', leading: '1.7' });

    // Build photo section (only if enabled)
    let photoHtml = '';
    if (b.showMedia !== false && (b.image || b.video)) {
      const mediaEl = b.video
        ? '<video autoplay muted loop playsinline src="' + resolvePreviewPath(b.video, project) + '" class="w-full"></video>'
        : '<img src="' + resolvePreviewPath(b.image, project) + '" class="w-full" alt="">';

      photoHtml = '<div class="photo-lede-photo" data-desktop-width="' + imgWidthClass + '">' +
        mediaEl +
        '<div class="photo-lede-caption">' +
          (b.caption ? '<p style="' + captionStyle + 'margin:0;">' + (b.caption || '') + '</p>' : '') +
        '</div>' +
      '</div>';
    }

    // Build pull quote HTML
    const pullQuotePosition = parseInt(b.pullQuotePosition || '0');
    let pullQuoteHtml = '';
    if (b.pullQuote && b.pullQuote.trim() && pullQuotePosition > 0) {
      pullQuoteHtml = '<div style="background:' + pullQuoteBgColor + ';padding:30px 40px;border-left:4px solid ' + pullQuoteBorderColor + ';margin:30px 0;">' +
        '<p style="' + pullQuoteStyle + 'margin:0;">' + processBodyText(b.pullQuote || '') + '</p>' +
      '</div>';
    }

    // Build byline HTML
    let bylineHtml = '';
    if (b.showByline) {
      const bylineStyleStr = buildStyle(b.bylineStyle, { color: '#e5e5e5', size: '16', font: 'IBM Plex Sans, sans-serif', weight: 'normal', leading: '1.6' });
      const datelineStyleObj = b.datelineStyle || {};
      const datelineSize = datelineStyleObj.size || '14';
      const datelineWeight = datelineStyleObj.weight || 'normal';
      const datelineColor = datelineStyleObj.color || '#9ca3af';
      const datelineFontWeight = datelineWeight === 'bold' ? '700' : '400';

      const parts = [];
      if (b.bylineDateline) parts.push(b.bylineDateline);
      if (b.bylineDate) parts.push(b.bylineDate);
      const separator = ' <span style="color:' + datelineColor + ';opacity:0.6;padding:0 8px;">|</span> ';
      const secondLine = parts.length > 0 ? '<div style="font-size:' + datelineSize + 'px;font-weight:' + datelineFontWeight + ';color:' + datelineColor + ';margin-top:4px;">' + parts.join(separator) + '</div>' : '';
      bylineHtml = '<div style="margin-bottom:24px;">' +
        '<div style="' + bylineStyleStr + '">' + (b.bylineText || '') + '</div>' +
        secondLine +
      '</div>';
    }

    // Build subhead HTML
    const subheadHtml = b.subhead ? '<h3 style="' + subheadStyle + 'margin-bottom:24px;">' + b.subhead + '</h3>' : '';

    // Build drop cap values first (needed for paragraph styling)
    const useDropCap = b.showDropCap !== false;
    let effDropCapColor = '#fbbf24';
    let effDropCapSize = '56';
    let effFirstLineSize = '24';
    let effFirstLineWeight = '600';
    let effFirstLineColor = '#ffffff';

    if (useDropCap) {
      // Start with block's own values (or defaults)
      effDropCapColor = b.dropCapColor || '#fbbf24';
      effDropCapSize = b.dropCapSize || '56';
      effFirstLineSize = b.firstLineSize || '24';
      effFirstLineWeight = b.firstLineWeight || '600';
      effFirstLineColor = b.firstLineColor || '#ffffff';

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
    }

    // Generate unique ID for this block's drop cap
    const blockId = 'pl-' + Math.random().toString(36).substr(2, 6);
    const dropCapClass = 'photo-lede-drop-cap-' + blockId;

    // Build text with optional drop cap
    const paragraphs = (b.bodyText || '').split(/\n\n+/).filter(p => p.trim());
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

    let textHtml = '<div class="photo-lede-text" data-desktop-width="' + textWidthClass + '">' +
      bylineHtml + subheadHtml + bodyParts.join('') +
    '</div>';

    // CSS for drop cap, first line, and links
    // Check for inherited background color
    let bgColor = b.bgColor || '#000000';
    if (b._inheritBgColor === true) {
      const masterBlock = blocks.find(blk => blk._isBgColorMaster && blk !== b);
      if (masterBlock) {
        bgColor = masterBlock.bgColor || bgColor;
      }
    }
    const linkStyles = getLinkStyles(bgColor, '.photo-lede-section');
    let dropCapStyles = '';
    if (useDropCap) {
      const dropCapLineHeight = Math.floor(parseInt(effDropCapSize) * 0.85);
      const firstLineWeightVal = effFirstLineWeight === 'bold' ? '700' : effFirstLineWeight === '600' ? '600' : effFirstLineWeight === '500' ? '500' : '400';

      dropCapStyles =
        '.' + dropCapClass + '::first-letter{float:left;font-size:' + effDropCapSize + 'px !important;line-height:' + dropCapLineHeight + 'px !important;padding-right:10px;margin-top:2px;color:' + effDropCapColor + ' !important;font-weight:bold;}' +
        '.' + dropCapClass + '::first-line{font-size:' + effFirstLineSize + 'px !important;font-weight:' + firstLineWeightVal + ' !important;color:' + effFirstLineColor + ' !important;}';
    }
    const styleTag = '<style>' + dropCapStyles + linkStyles + '</style>';

    const fadeAttr = block._fadeOnScroll ? ' data-fade-scroll="true"' : '';

    return styleTag + '<section class="photo-lede-section ' + pt + ' ' + pb + ' px-6" style="background-color:' + bgColor + ';"' + fadeAttr + '>' +
      photoHtml + textHtml + '</section>';
  },

  exportHTML({ block, blocks = [] }) {
    const b = block;
    const paddingMap = { none: 'py-0', tight: 'py-4', medium: 'py-16', spacious: 'py-24' };
    const pt = paddingMap[b.paddingTop || 'medium'].replace('py', 'pt');
    const pb = paddingMap[b.paddingBottom || 'medium'].replace('py', 'pb');

    // Check for inherited body text style
    let effectiveTextStyle = b.textStyle || {};
    if (b._inheritBodyStyle !== false) {
      const masterBlock = blocks.find(blk => blk._isBodyStyleMaster && blk !== b);
      if (masterBlock && masterBlock.textStyle) {
        effectiveTextStyle = masterBlock.textStyle;
      }
    }

    const imageWidthMap = {
      'narrow': 'max-w-2xl',
      'medium': 'max-w-4xl',
      'wide': 'max-w-6xl',
      'full': 'w-full'
    };
    const imgWidthClass = imageWidthMap[b.imageWidth || 'medium'];

    const textWidthMap = {
      'extra-narrow': 'max-w-md',
      'narrow': 'max-w-lg',
      'medium': 'max-w-4xl',
      'wide': 'max-w-6xl'
    };
    const textWidthClass = textWidthMap[b.textWidth || 'narrow'];

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

    // Check for inherited caption style
    let effectiveCaptionStyle = b.captionStyle || {};
    if (b._inheritCaptionStyle === true) {
      const masterBlock = blocks.find(blk => blk._isCaptionStyleMaster && blk !== b);
      if (masterBlock && masterBlock.captionStyle) {
        effectiveCaptionStyle = masterBlock.captionStyle;
      }
    }

    const captionStyle = buildStyle(effectiveCaptionStyle, { color: '#aaaaaa', size: '16', font: 'IBM Plex Sans, sans-serif', weight: 'normal', leading: '1.5' });

    // Check for inherited subhead style
    let effectiveSubheadStyle = b.subheadStyle || {};
    if (b._inheritSubheadStyle !== false) {
      const masterBlock = blocks.find(blk => blk._isSubheadStyleMaster && blk !== b);
      if (masterBlock && masterBlock.subheadStyle) {
        effectiveSubheadStyle = masterBlock.subheadStyle;
      }
    }
    const subheadStyle = buildStyle(effectiveSubheadStyle, { color: '#d1d5db', size: '24', font: 'IBM Plex Sans, sans-serif', weight: 'normal', leading: '1.5' });

    // Check for inherited pull quote style
    let effectivePullQuoteStyle = b.pullQuoteStyle || {};
    if (b._inheritPullQuoteStyle === true) {
      const masterBlock = blocks.find(blk => blk._isPullQuoteStyleMaster && blk !== b);
      if (masterBlock && masterBlock.pullQuoteStyle) {
        effectivePullQuoteStyle = masterBlock.pullQuoteStyle;
      }
    }
    const pullQuoteStyle = buildStyle(effectivePullQuoteStyle, { color: '#ffffff', size: '24', font: 'IBM Plex Sans, sans-serif', weight: '500', leading: '1.8' });
    const pullQuoteBgColor = (effectivePullQuoteStyle && effectivePullQuoteStyle.bgColor) || '#3d3314';
    const pullQuoteBorderColor = (effectivePullQuoteStyle && effectivePullQuoteStyle.borderColor) || '#fbbf24';

    const textStyle = buildStyle(effectiveTextStyle, { color: '#e5e5e5', size: '18', font: 'IBM Plex Sans, sans-serif', weight: 'normal', leading: '1.7' });

    // Build photo section (only if enabled)
    let photoHtml = '';
    if (b.showMedia !== false && (b.image || b.video)) {
      const mediaEl = b.video
        ? '<video autoplay muted loop playsinline src="' + resolveExportPath(b.video) + '" class="w-full"></video>'
        : '<img src="' + resolveExportPath(b.image) + '" class="w-full" alt="">';

      photoHtml = '<div class="photo-lede-photo" data-desktop-width="' + imgWidthClass + '">' +
        mediaEl +
        '<div class="photo-lede-caption">' +
          (b.caption ? '<p style="' + captionStyle + 'margin:0;">' + String(b.caption || '') + '</p>' : '') +
        '</div>' +
      '</div>';
    }

    // Build pull quote HTML
    const pullQuotePosition = parseInt(b.pullQuotePosition || '0');
    let pullQuoteHtml = '';
    if (b.pullQuote && b.pullQuote.trim() && pullQuotePosition > 0) {
      pullQuoteHtml = '<div style="background:' + pullQuoteBgColor + ';padding:30px 40px;border-left:4px solid ' + pullQuoteBorderColor + ';margin:30px 0;">' +
        '<p style="' + pullQuoteStyle + 'margin:0;">' + processBodyText(b.pullQuote || '', { brTag: '<br/>' }) + '</p>' +
      '</div>';
    }

    // Build byline HTML
    let bylineHtml = '';
    if (b.showByline) {
      const bylineStyleStr = buildStyle(b.bylineStyle, { color: '#e5e5e5', size: '16', font: 'IBM Plex Sans, sans-serif', weight: 'normal', leading: '1.6' });
      const datelineStyleObj = b.datelineStyle || {};
      const datelineSize = datelineStyleObj.size || '14';
      const datelineWeight = datelineStyleObj.weight || 'normal';
      const datelineColor = datelineStyleObj.color || '#9ca3af';
      const datelineFontWeight = datelineWeight === 'bold' ? '700' : '400';

      const parts = [];
      if (b.bylineDateline) parts.push(b.bylineDateline);
      if (b.bylineDate) parts.push(b.bylineDate);
      if (b.showReadTime !== false && b.readTime) parts.push(b.readTime + ' min read');
      const separator = ' <span style="color:' + datelineColor + ';opacity:0.6;padding:0 8px;">|</span> ';
      const secondLine = parts.length > 0 ? '<div style="font-size:' + datelineSize + 'px;font-weight:' + datelineFontWeight + ';color:' + datelineColor + ';margin-top:4px;">' + parts.join(separator) + '</div>' : '';
      bylineHtml = '<div style="margin-bottom:24px;">' +
        '<div style="' + bylineStyleStr + '">' + String(b.bylineText || '') + '</div>' +
        secondLine +
      '</div>';
    }

    // Build subhead HTML
    const subheadHtml = b.subhead ? '<h3 style="' + subheadStyle + 'margin-bottom:24px;">' + String(b.subhead) + '</h3>' : '';

    // Build drop cap values first
    const useDropCap = b.showDropCap !== false;
    let effDropCapColor = '#fbbf24';
    let effDropCapSize = '56';
    let effFirstLineSize = '24';
    let effFirstLineWeight = '600';
    let effFirstLineColor = '#ffffff';

    if (useDropCap) {
      // Start with block's own values (or defaults)
      effDropCapColor = b.dropCapColor || '#fbbf24';
      effDropCapSize = b.dropCapSize || '56';
      effFirstLineSize = b.firstLineSize || '24';
      effFirstLineWeight = b.firstLineWeight || '600';
      effFirstLineColor = b.firstLineColor || '#ffffff';

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
    }

    // Generate unique ID for this block's drop cap
    const blockId = 'pl-' + Math.random().toString(36).substr(2, 6);
    const dropCapClass = 'photo-lede-drop-cap-' + blockId;

    // Build text with optional drop cap
    const paragraphs = String(b.bodyText || '').split(/\n\n+/).filter(p => p.trim());
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

    let textHtml = '<div class="photo-lede-text" data-desktop-width="' + textWidthClass + '">' +
      bylineHtml + subheadHtml + bodyParts.join('') +
    '</div>';

    // CSS for drop cap, first line, and links
    // Check for inherited background color
    let bgColor = b.bgColor || '#000000';
    if (b._inheritBgColor === true) {
      const masterBlock = blocks.find(blk => blk._isBgColorMaster && blk !== b);
      if (masterBlock) {
        bgColor = masterBlock.bgColor || bgColor;
      }
    }
    const linkStyles = getLinkStyles(bgColor, '.photo-lede-section');
    let dropCapStyles = '';
    if (useDropCap) {
      const dropCapLineHeight = Math.floor(parseInt(effDropCapSize) * 0.85);
      const firstLineWeightVal = effFirstLineWeight === 'bold' ? '700' : effFirstLineWeight === '600' ? '600' : effFirstLineWeight === '500' ? '500' : '400';

      dropCapStyles =
        '.' + dropCapClass + '::first-letter{float:left;font-size:' + effDropCapSize + 'px !important;line-height:' + dropCapLineHeight + 'px !important;padding-right:10px;margin-top:2px;color:' + effDropCapColor + ' !important;font-weight:bold;}' +
        '.' + dropCapClass + '::first-line{font-size:' + effFirstLineSize + 'px !important;font-weight:' + firstLineWeightVal + ' !important;color:' + effFirstLineColor + ' !important;}';
    }
    const styleTag = '<style>' + dropCapStyles + linkStyles + '</style>';

    const fadeAttr = block._fadeOnScroll ? ' data-fade-scroll="true"' : '';

    return styleTag + '<section class="photo-lede-section ' + pt + ' ' + pb + ' px-6" style="position:relative;z-index:3;background-color:' + bgColor + ';"' + fadeAttr + '>' +
      '<div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:100vw;height:100%;background-color:' + bgColor + ';z-index:0;"></div>' +
      '<div style="position:relative;z-index:1;">' + photoHtml + textHtml + '</div>' +
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
