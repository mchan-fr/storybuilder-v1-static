import { HeroBlock } from './hero.js';
import { FullBleedBlock } from './fullBleed.js';
import { TextBlock } from './text.js';
import { SplitPanelBlock } from './splitPanel.js';
import { ZoomPhotoBlock } from './zoomPhoto.js';
import { SplitLayoutBlock } from './splitLayout.js';
import { GalleryBlock } from './gallery.js';  // ← ADD THIS
import { PhotoLedeBlock } from './photoLede.js';
import { PhotoLedeSideBlock } from './photoLedeSide.js';

export const BLOCKS = {
  [HeroBlock.type]: HeroBlock,
  [FullBleedBlock.type]: FullBleedBlock,
  [TextBlock.type]: TextBlock,
  [SplitPanelBlock.type]: SplitPanelBlock,
  [ZoomPhotoBlock.type]: ZoomPhotoBlock,
  [SplitLayoutBlock.type]: SplitLayoutBlock,
  [GalleryBlock.type]: GalleryBlock,  // ← ADD THIS
  [PhotoLedeBlock.type]: PhotoLedeBlock,
  [PhotoLedeSideBlock.type]: PhotoLedeSideBlock,
};

export function newBlock(type) {
  const mod = BLOCKS[type];
  return mod?.defaults ? mod.defaults() : { type: 'text', text: '' };
}