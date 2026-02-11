export const isAbs = (u) => /^https?:\/\//i.test(u) || /^data:/.test(u) || (u || '').startsWith('/');
export const safe = (s) => (s || '').replace(/[^a-z0-9-_]/gi, '');

export function resolvePreviewPath(inputPath, projectFolder) {
  if (!inputPath) return '';
  if (isAbs(inputPath)) return inputPath;
  const p = safe(projectFolder || '');
  return 'projects/' + p + '/' + (inputPath || '').replace(/^\.?\/*/, '');
}
export function resolveExportPath(inputPath) {
  if (!inputPath) return '';
  if (isAbs(inputPath)) return inputPath;
  return (inputPath || '').replace(/^\.?\/*/, '');
}

export function dl(name, text) {
  const blob = new Blob([text], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}

export function setPreviewZoom(previewEl, labelEl, pct) {
  const z = Math.max(50, Math.min(150, Number(pct))) / 100;
  previewEl.style.setProperty('--sb-zoom', z);
  labelEl.textContent = Math.round(z * 100) + '%';
}

export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeOut = (t) => 1 - Math.pow(1 - t, 2);
export const easeInOut = (t) => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/**
 * Font families available for body text, alphabetically ordered with descriptions
 */
export const bodyFonts = [
  { value: 'Arial, sans-serif', label: 'Arial', desc: 'Safe default sans' },
  { value: 'Courier New, monospace', label: 'Courier New', desc: 'Typewriter / primary source' },
  { value: 'Crimson Text, serif', label: 'Crimson Text', desc: 'Bookish narrative tone' },
  { value: 'Georgia, serif', label: 'Georgia', desc: 'News-style readability' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica', desc: 'Institutional modernism' },
  { value: 'IBM Plex Sans, sans-serif', label: 'IBM Plex Sans', desc: 'Technical authority' },
  { value: 'Inter, sans-serif', label: 'Inter', desc: 'Clean product UI' },
  { value: 'Lora, serif', label: 'Lora', desc: 'Polished storytelling serif' },
  { value: 'Merriweather, serif', label: 'Merriweather', desc: 'Serious long-form serif' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat', desc: 'Headline / branding voice' },
  { value: 'system-ui', label: 'system-ui', desc: 'Platform-native feel' },
  { value: 'Times New Roman, serif', label: 'Times New Roman', desc: 'Formal document voice' }
];

/**
 * Generate font select options HTML with descriptions
 */
export function fontSelectHtml(selectedValue, dataKey) {
  return bodyFonts.map(f =>
    '<option value="' + f.value + '" ' + (selectedValue === f.value ? 'selected' : '') + '>' +
      f.label + ' — ' + f.desc +
    '</option>'
  ).join('');
}

/**
 * Global body text styling management
 * Stores which block is the "master" and what the global style settings are
 */
export const globalBodyStyle = {
  // The block ID that is set as master (null if none)
  masterBlockId: null,
  // The global style settings
  style: null,

  // Set a block as the master style source
  setMaster(blockId, styleSettings) {
    this.masterBlockId = blockId;
    this.style = { ...styleSettings };
  },

  // Clear master (when master block is deleted or unchecked)
  clearMaster() {
    this.masterBlockId = null;
    this.style = null;
  },

  // Check if a specific block is the master
  isMaster(blockId) {
    return this.masterBlockId === blockId;
  },

  // Get the global style (returns null if no master set)
  getStyle() {
    return this.style;
  }
};

/**
 * Generate body text style controls HTML with global styling checkboxes
 */
export function bodyTextStyleHtml(block, blockId, getStyle, textStyle) {
  const isMaster = globalBodyStyle.isMaster(blockId);
  const inheritChecked = block._inheritBodyStyle !== false; // Default true

  return `
    <div class="p-2 border rounded bg-slate-50">
      <div class="text-xs font-semibold mb-2">Style</div>

      <!-- Global styling controls -->
      <div class="mb-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
        <label class="flex items-center gap-2 mb-2">
          <input type="checkbox" data-k="_isBodyStyleMaster" class="body-style-master" data-block-id="${blockId}" ${isMaster ? 'checked' : ''}>
          <span>Set styling for all blocks</span>
        </label>
        <label class="flex items-center gap-2">
          <input type="checkbox" data-k="_inheritBodyStyle" ${inheritChecked ? 'checked' : ''}>
          <span class="text-gray-600">Inherit styling from master</span>
        </label>
      </div>

      <div class="grid grid-cols-3 gap-2 mb-2">
        <div>
          <label class="block text-xs">Size (px)</label>
          <input data-k="textStyle.size" type="number" min="12" max="32" value="${getStyle(textStyle, 'size', '18')}" class="w-full border rounded px-2 py-1 text-sm">
        </div>
        <div>
          <label class="block text-xs">Weight</label>
          <select data-k="textStyle.weight" class="w-full border rounded px-2 py-1 text-xs">
            <option value="normal" ${getStyle(textStyle, 'weight', 'normal') === 'normal' ? 'selected' : ''}>normal</option>
            <option value="500" ${getStyle(textStyle, 'weight', 'normal') === '500' ? 'selected' : ''}>500</option>
            <option value="600" ${getStyle(textStyle, 'weight', 'normal') === '600' ? 'selected' : ''}>600</option>
            <option value="bold" ${getStyle(textStyle, 'weight', 'normal') === 'bold' ? 'selected' : ''}>bold</option>
          </select>
        </div>
        <div>
          <label class="block text-xs">Color</label>
          <input type="color" data-k="textStyle.color" value="${getStyle(textStyle, 'color', '#e5e5e5')}" class="w-full h-7 border rounded">
        </div>
      </div>
      <div class="mb-2">
        <label class="block text-xs">Font</label>
        <select data-k="textStyle.font" class="w-full border rounded px-2 py-1 text-xs">
          ${fontSelectHtml(getStyle(textStyle, 'font', 'IBM Plex Sans, sans-serif'))}
        </select>
      </div>
      <div>
        <label class="block text-xs">Line Height: ${getStyle(textStyle, 'leading', '1.7')}</label>
        <input data-k="textStyle.leading" type="range" min="1.0" max="2.5" step="0.1" value="${getStyle(textStyle, 'leading', '1.7')}" class="w-full">
      </div>
    </div>
  `;
}

/**
 * Process body text for preview/export
 * - Converts newlines to <br> tags
 * - HTML tags (bold, italic, links) pass through
 * - External links get target="_blank" rel="noopener noreferrer"
 * - Internal links open in same tab
 */
export function processBodyText(text, options = {}) {
  if (!text) return '';
  let result = String(text);

  // Convert newlines to <br> unless disabled
  if (options.preserveNewlines !== false) {
    result = result.replace(/\n/g, options.brTag || '<br>');
  }

  // Process links: add target="_blank" rel="noopener noreferrer" for external links
  result = result.replace(/<a\s+href="([^"]*)"([^>]*)>/gi, (match, href, rest) => {
    // Check if it's an external link (starts with http://, https://, or //)
    const isExternal = /^(https?:)?\/\//i.test(href);

    if (isExternal) {
      // External link: open in new tab with security attributes
      // Check if target or rel already exist to avoid duplicates
      if (!rest.includes('target=')) {
        rest += ' target="_blank"';
      }
      if (!rest.includes('rel=')) {
        rest += ' rel="noopener noreferrer"';
      }
    }
    // Internal links: no modification needed (open in same tab by default)

    return '<a href="' + href + '"' + rest + '>';
  });

  return result;
}

/**
 * Generate formatting toolbar HTML for body text fields
 * @param {string} textareaId - The data-k attribute of the associated textarea
 */
export function textToolbarHtml(textareaId) {
  return `
    <div class="text-toolbar flex gap-1 mb-1" data-toolbar-for="${textareaId}">
      <button type="button" class="toolbar-btn" data-format="bold" title="Bold">
        <strong>B</strong>
      </button>
      <button type="button" class="toolbar-btn" data-format="italic" title="Italic">
        <em>I</em>
      </button>
      <button type="button" class="toolbar-btn" data-format="link" title="Insert Link">
        🔗
      </button>
    </div>
  `;
}

/**
 * Initialize text formatting toolbar handlers
 * Call this after rendering editor HTML
 */
export function initTextToolbars(container) {
  const toolbars = container.querySelectorAll('.text-toolbar');

  toolbars.forEach(toolbar => {
    const textareaId = toolbar.dataset.toolbarFor;
    const textarea = container.querySelector(`[data-k="${textareaId}"]`);
    if (!textarea) return;

    toolbar.querySelectorAll('.toolbar-btn').forEach(btn => {
      // Use mousedown to capture selection before focus changes
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevent textarea from losing focus
        const format = btn.dataset.format;
        applyFormat(textarea, format);
      });
    });
  });
}

/**
 * Apply formatting to selected text in textarea
 */
function applyFormat(textarea, format) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selectedText = text.substring(start, end);

  let before = '';
  let after = '';
  let replacement = selectedText;

  switch (format) {
    case 'bold':
      before = '<strong>';
      after = '</strong>';
      replacement = before + (selectedText || 'bold text') + after;
      break;
    case 'italic':
      before = '<em>';
      after = '</em>';
      replacement = before + (selectedText || 'italic text') + after;
      break;
    case 'link':
      const url = prompt('Enter URL:', 'https://');
      if (!url) return;
      const linkText = selectedText || 'link text';
      replacement = `<a href="${url}">${linkText}</a>`;
      break;
    default:
      return;
  }

  // Update textarea value
  textarea.value = text.substring(0, start) + replacement + text.substring(end);

  // Trigger input event so the block state updates
  textarea.dispatchEvent(new Event('input', { bubbles: true }));

  // Restore focus and set cursor position
  textarea.focus();
  const newCursorPos = start + replacement.length;
  textarea.setSelectionRange(newCursorPos, newCursorPos);
}

/**
 * Parse a color string (hex, rgb, rgba) to RGB values
 */
export function parseColor(color) {
  if (!color) return { r: 0, g: 0, b: 0 };

  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16)
      };
    }
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16)
    };
  }

  // Handle rgb/rgba colors
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3])
    };
  }

  return { r: 0, g: 0, b: 0 };
}

/**
 * Calculate relative luminance for WCAG contrast
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getLuminance(color) {
  const { r, g, b } = parseColor(color);
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
export function getContrastRatio(color1, color2) {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get an accessible link color that meets WCAG AA (4.5:1 contrast ratio)
 * @param {string} bgColor - Background color
 * @returns {string} - Accessible link color
 */
export function getAccessibleLinkColor(bgColor) {
  const candidates = [
    '#0066cc', // Blue (primary choice)
    '#0052a3', // Darker blue
    '#003d7a', // Even darker blue
    '#1a1a1a', // Near black
    '#e6e6e6', // Light gray
    '#ff6b35', // Orange
    '#2ec4b6'  // Teal
  ];

  const minContrast = 4.5; // WCAG AA requirement

  // Try each candidate color
  for (const candidate of candidates) {
    const ratio = getContrastRatio(candidate, bgColor);
    if (ratio >= minContrast) {
      return candidate;
    }
  }

  // Fallback: use black or white based on background luminance
  const bgLuminance = getLuminance(bgColor);
  return bgLuminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Generate CSS for accessible link styling
 * @param {string} bgColor - Background color
 * @param {string} selector - CSS selector prefix (e.g., '.photo-lede-section')
 * @returns {string} - CSS rules for links
 */
export function getLinkStyles(bgColor, selector) {
  const linkColor = getAccessibleLinkColor(bgColor);
  return `
${selector} a {
  color: ${linkColor};
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
  cursor: pointer;
  transition: text-decoration-thickness 0.15s ease, opacity 0.15s ease;
}
${selector} a:hover {
  text-decoration-thickness: 2px;
  opacity: 0.85;
}
  `.trim();
}

// ============================================
// SHARED EDITOR & RENDER UTILITIES
// ============================================

/**
 * Padding size options for editor dropdowns
 */
export const paddingSizes = [
  { value: 'none', label: 'None (0px)' },
  { value: 'tight', label: 'Tight (15px)' },
  { value: 'medium', label: 'Medium (30px)' },
  { value: 'spacious', label: 'Spacious (50px)' }
];

/**
 * Padding value map for CSS classes (preview)
 */
export const paddingClassMap = {
  none: { pt: 'pt-0', pb: 'pb-0', py: 'py-0' },
  tight: { pt: 'pt-4', pb: 'pb-4', py: 'py-4' },
  medium: { pt: 'pt-16', pb: 'pb-16', py: 'py-16' },
  spacious: { pt: 'pt-24', pb: 'pb-24', py: 'py-24' }
};

/**
 * Padding value map for inline styles (export)
 */
export const paddingValueMap = {
  none: '0',
  tight: '15px',
  medium: '30px',
  spacious: '50px'
};

/**
 * Text/content width options
 */
export const textWidthOpts = ['extra-narrow', 'narrow', 'medium', 'wide'];

/**
 * Text width to CSS class mapping
 */
export const textWidthClassMap = {
  'extra-narrow': 'max-w-md',
  'narrow': 'max-w-lg',
  'medium': 'max-w-4xl',
  'wide': 'max-w-6xl'
};

/**
 * Font weight options
 */
export const weightOpts = ['normal', '500', '600', 'bold'];

/**
 * Simple font weight options (normal/bold only)
 */
export const simpleWeightOpts = ['normal', 'bold'];

/**
 * Get style property with fallback
 */
export function getStyle(styleObj, prop, fallback) {
  return (styleObj && styleObj[prop]) || fallback;
}

/**
 * Convert font weight string to numeric value
 */
export function fontWeightToValue(weight) {
  if (weight === 'bold') return '700';
  if (weight === '600') return '600';
  if (weight === '500') return '500';
  return '400';
}

/**
 * Build inline style string from style object
 * @param {Object} styleObj - Style properties object
 * @param {Object} fallbacks - Default values for each property
 * @param {Object} options - Additional options (addTextShadow, etc)
 */
export function buildInlineStyle(styleObj, fallbacks, options = {}) {
  const color = getStyle(styleObj, 'color', fallbacks.color);
  const size = getStyle(styleObj, 'size', fallbacks.size);
  const font = getStyle(styleObj, 'font', fallbacks.font);
  const weight = getStyle(styleObj, 'weight', fallbacks.weight);
  const italic = getStyle(styleObj, 'italic', false);
  const leading = getStyle(styleObj, 'leading', fallbacks.leading || '1.2');

  const fontStyle = italic ? 'italic' : 'normal';
  const fontWeight = fontWeightToValue(weight);

  let style = 'color:' + color + ';font-size:' + size + 'px;font-family:' + font + ';font-weight:' + fontWeight + ';font-style:' + fontStyle + ';line-height:' + leading + ';';

  if (options.addTextShadow) {
    style += 'text-shadow:0 2px 8px rgba(0,0,0,0.55);';
  }

  return style;
}

/**
 * Create collapsible section HTML for editor panels
 */
export function collapsibleSection(title, content, collapsed = true) {
  return '<div class="collapsible-section' + (collapsed ? ' collapsed' : '') + '">' +
    '<div class="collapsible-header">' +
      '<span>' + title + '</span>' +
      '<span class="collapsible-chevron">&#9660;</span>' +
    '</div>' +
    '<div class="collapsible-content">' + content + '</div>' +
  '</div>';
}

/**
 * Generate block label field HTML
 */
export function labelFieldHtml(label, placeholder = 'e.g., Section name...') {
  return '<div class="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">' +
    '<label class="block text-sm font-semibold text-blue-900 mb-2">📝 Block Label (Optional)</label>' +
    '<input type="text" data-k="label" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" ' +
      'placeholder="' + placeholder + '" ' +
      'value="' + (label || '') + '" />' +
  '</div>';
}

/**
 * Generate padding select options HTML
 */
export function paddingSelectHtml(selectedValue, defaultValue = 'medium') {
  return paddingSizes.map(p =>
    '<option value="' + p.value + '" ' + ((selectedValue || defaultValue) === p.value ? 'selected' : '') + '>' + p.label + '</option>'
  ).join('');
}

/**
 * Generate text width select options HTML
 */
export function textWidthSelectHtml(selectedValue, defaultValue = 'medium') {
  return textWidthOpts.map(w =>
    '<option value="' + w + '" ' + ((selectedValue || defaultValue) === w ? 'selected' : '') + '>' + w + '</option>'
  ).join('');
}

/**
 * Generate weight select options HTML
 */
export function weightSelectHtml(selectedValue, defaultValue = 'normal', useSimple = false) {
  const opts = useSimple ? simpleWeightOpts : weightOpts;
  return opts.map(w =>
    '<option value="' + w + '" ' + ((selectedValue || defaultValue) === w ? 'selected' : '') + '>' + w + '</option>'
  ).join('');
}

/**
 * Generate master/inherit style controls HTML
 * @param {Object} block - The block data
 * @param {string} masterKey - The data key for the master flag (e.g., '_isBgColorMaster')
 * @param {string} inheritKey - The data key for the inherit flag (e.g., '_inheritBgColor')
 * @param {boolean} inheritDefault - Whether inherit is checked by default
 * @param {string} classPrefix - CSS class prefix for JS handlers (e.g., 'bgcolor' -> 'bgcolor-style-master')
 * @param {string} label - What's being set/inherited (e.g., 'color' or 'styling')
 */
export function styleInheritControls(block, masterKey, inheritKey, inheritDefault = true, classPrefix = '', label = 'styling') {
  const isMaster = block[masterKey] || false;
  const inherits = inheritDefault ? block[inheritKey] !== false : block[inheritKey] === true;
  const masterClass = classPrefix ? ' class="' + classPrefix + '-style-master"' : '';
  const inheritClass = classPrefix ? ' class="' + classPrefix + '-style-inherit"' : '';

  return '<div class="mb-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs">' +
    '<label class="flex items-center gap-2 mb-2">' +
      '<input type="checkbox" data-k="' + masterKey + '"' + masterClass + ' ' + (isMaster ? 'checked' : '') + '>' +
      '<span>Set ' + label + ' for all blocks</span>' +
    '</label>' +
    '<label class="flex items-center gap-2">' +
      '<input type="checkbox" data-k="' + inheritKey + '"' + inheritClass + ' ' + (inherits ? 'checked' : '') + '>' +
      '<span class="text-gray-600">Inherit ' + label + ' from master</span>' +
    '</label>' +
  '</div>';
}

/**
 * Get effective style from block or master block
 */
export function getEffectiveStyle(block, blocks, styleKey, masterFlag, inheritFlag, inheritDefault = true) {
  const shouldInherit = inheritDefault ? block[inheritFlag] !== false : block[inheritFlag] === true;

  if (shouldInherit && blocks && blocks.length > 0) {
    // Find master block - use truthy check for the flag
    const masterBlock = blocks.find(blk => blk[masterFlag] && blk !== block);
    if (masterBlock) {
      // For split-panel master: style is in panels[0], not at block level
      // For text/photoLede/photoLedeSide master: style is at block level
      // Check panels first (split-panel), then direct (text/photoLede/photoLedeSide)
      const panelStyle = masterBlock.panels && masterBlock.panels[0] && masterBlock.panels[0][styleKey];
      const directStyle = masterBlock[styleKey];

      // Return whichever exists and has properties
      if (panelStyle && typeof panelStyle === 'object' && Object.keys(panelStyle).length > 0) {
        return { ...panelStyle }; // Return a copy
      }
      if (directStyle && typeof directStyle === 'object' && Object.keys(directStyle).length > 0) {
        return { ...directStyle }; // Return a copy
      }
    }
  }

  return block[styleKey] || {};
}

/**
 * Pull quote style defaults - used to ensure all properties exist when inheriting
 * These are generic defaults that get merged with master's style
 */
const PULL_QUOTE_DEFAULTS = {
  size: '24',
  weight: '500',
  italic: false,
  color: '#ffffff',
  font: 'system-ui',
  leading: '1.8',
  bgColor: '#3d3314',
  borderColor: '#fbbf24'
};

/**
 * Get effective pull quote style - returns master's style when inheriting,
 * or block's own style when not inheriting (without merging defaults)
 */
export function getEffectivePullQuoteStyle(block, blocks) {
  // Use truthy check instead of strict === true, since checkbox values may vary
  const shouldInherit = block._inheritPullQuoteStyle === true || block._inheritPullQuoteStyle === 'true';

  if (shouldInherit && blocks && blocks.length > 0) {
    // Use truthy check for master flag as well
    const masterBlock = blocks.find(blk => (blk._isPullQuoteStyleMaster === true || blk._isPullQuoteStyleMaster === 'true' || blk._isPullQuoteStyleMaster) && blk !== block);

    if (masterBlock) {
      // Check panels first (split-panel), then direct (text/photoLede/photoLedeSide)
      const panelStyle = masterBlock.panels && masterBlock.panels[0] && masterBlock.panels[0].pullQuoteStyle;
      const directStyle = masterBlock.pullQuoteStyle;

      // Get the master's style - use whichever exists, or empty object if neither
      const masterStyle = (panelStyle && typeof panelStyle === 'object' && Object.keys(panelStyle).length > 0)
        ? panelStyle
        : (directStyle && typeof directStyle === 'object' && Object.keys(directStyle).length > 0)
          ? directStyle
          : {}; // Use empty object instead of null - we'll merge with defaults

      // Always merge with defaults to ensure all properties exist
      // This handles cases where master block was created before pullQuoteStyle was added
      return { ...PULL_QUOTE_DEFAULTS, ...masterStyle };
    }
  }

  // Return block's own style WITHOUT merging defaults
  // Each block type has its own defaults that are applied at render time
  return block.pullQuoteStyle || {};
}

/**
 * Get effective background color from block or master block
 */
export function getEffectiveBgColor(block, blocks, defaultColor = '#000000') {
  if (block._inheritBgColor === true) {
    const masterBlock = blocks.find(blk => blk._isBgColorMaster && blk !== block);
    if (masterBlock && masterBlock.bgColor) {
      return masterBlock.bgColor;
    }
  }
  return block.bgColor || defaultColor;
}

/**
 * Get effective drop cap settings from block or master block
 */
export function getEffectiveDropCapSettings(block, blocks) {
  const defaults = {
    dropCapColor: '#fbbf24',
    dropCapSize: '56',
    firstLineSize: '24',
    firstLineWeight: '600',
    firstLineColor: '#ffffff'
  };

  if (block._inheritDropCapStyle === true) {
    const masterBlock = blocks.find(blk => blk._isDropCapStyleMaster && blk !== block);
    if (masterBlock) {
      // Check for drop cap settings directly on block (text, photoLedeSide) or in panels (split-panel)
      const masterDropCap = masterBlock.panels && masterBlock.panels[0] ? masterBlock.panels[0] : masterBlock;
      return {
        dropCapColor: masterDropCap.dropCapColor || defaults.dropCapColor,
        dropCapSize: masterDropCap.dropCapSize || defaults.dropCapSize,
        firstLineSize: masterDropCap.firstLineSize || defaults.firstLineSize,
        firstLineWeight: masterDropCap.firstLineWeight || defaults.firstLineWeight,
        firstLineColor: masterDropCap.firstLineColor || defaults.firstLineColor
      };
    }
  }

  return {
    dropCapColor: block.dropCapColor || defaults.dropCapColor,
    dropCapSize: block.dropCapSize || defaults.dropCapSize,
    firstLineSize: block.firstLineSize || defaults.firstLineSize,
    firstLineWeight: block.firstLineWeight || defaults.firstLineWeight,
    firstLineColor: block.firstLineColor || defaults.firstLineColor
  };
}

/**
 * Generate drop cap CSS
 */
export function dropCapCss(className, settings) {
  const dropCapLineHeight = Math.floor(parseInt(settings.dropCapSize) * 0.85);
  const firstLineWeightVal = fontWeightToValue(settings.firstLineWeight);

  return '.' + className + '::first-letter{float:left;font-size:' + settings.dropCapSize + 'px !important;line-height:' + dropCapLineHeight + 'px !important;padding-right:10px;margin-top:2px;color:' + settings.dropCapColor + ' !important;font-weight:bold;}' +
    '.' + className + '::first-line{font-size:' + settings.firstLineSize + 'px !important;font-weight:' + firstLineWeightVal + ' !important;color:' + settings.firstLineColor + ' !important;}';
}

/**
 * Generate unique block ID
 */
export function generateBlockId(prefix = 'block') {
  return prefix + '-' + Math.random().toString(36).substr(2, 9);
}