/**
 * Calculate expected view time for a block based on its content
 * Returns time in seconds
 */

const READING_SPEED_WPM = 200;
const BASE_IMAGE_TIME = 4;
const BASE_VIDEO_TIME = 30; // Default if duration unknown
const GALLERY_IMAGE_TIME = 3;

/**
 * Count words in text
 */
function countWords(text) {
  if (!text) return 0;
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Calculate reading time for text in seconds
 */
function readingTime(text) {
  const words = countWords(text);
  return Math.ceil((words / READING_SPEED_WPM) * 60);
}

/**
 * Calculate standardized expected view time for a block
 * This is the "standard" calculation used for cross-story benchmarking
 */
export function calculateExpectedTime(block) {
  if (!block || !block.type) return BASE_IMAGE_TIME;

  switch (block.type) {
    case 'text':
      // Pure text block - based on word count
      const textWords = countWords(block.text || block.bodyText || '');
      return Math.max(4, readingTime(block.text || block.bodyText || ''));

    case 'hero':
    case 'fullBleed':
      // Image/video blocks - base time, more if has video
      if (block.video || block.videoMobile) {
        return block.videoDuration || BASE_VIDEO_TIME;
      }
      return BASE_IMAGE_TIME;

    case 'zoomPhoto':
      // Zoom photos are meant to be lingered on
      return 6;

    case 'gallery':
      // Count gallery images
      const imageCount = (block.images || []).filter(img => img && img.src).length;
      return Math.max(4, imageCount * GALLERY_IMAGE_TIME);

    case 'splitPanel':
    case 'photoLedeSide':
    case 'photoLede':
      // Combined image + text blocks
      let textTime = 0;
      if (block.panels && Array.isArray(block.panels)) {
        block.panels.forEach(panel => {
          textTime += readingTime(panel.text || '');
          textTime += readingTime(panel.headline || '');
        });
      }
      textTime += readingTime(block.bodyText || '');
      textTime += readingTime(block.headline || '');
      return Math.max(4, textTime + BASE_IMAGE_TIME);

    case 'splitLayout':
      // Similar to splitPanel
      let splitTextTime = 0;
      if (block.panels && Array.isArray(block.panels)) {
        block.panels.forEach(panel => {
          splitTextTime += readingTime(panel.text || '');
        });
      }
      return Math.max(4, splitTextTime + BASE_IMAGE_TIME);

    default:
      return BASE_IMAGE_TIME;
  }
}

/**
 * Get the effective expected time for a block
 * Uses creator override if set, otherwise uses calculated time
 */
export function getEffectiveExpectedTime(block) {
  if (block.expectedViewTime && block.expectedViewTime > 0) {
    return block.expectedViewTime;
  }
  return calculateExpectedTime(block);
}

/**
 * Calculate engagement ratio
 * Returns percentage (100 = met expectations, >100 = exceeded)
 */
export function calculateEngagement(actualTimeMs, expectedTimeSec) {
  if (!expectedTimeSec || expectedTimeSec <= 0) return 0;
  const actualTimeSec = actualTimeMs / 1000;
  return Math.round((actualTimeSec / expectedTimeSec) * 100);
}
