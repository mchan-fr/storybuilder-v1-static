// Add this inside your renderEditor() function, after the existing input listeners
// This handles the interactive gallery controls

// Gallery block: Add media buttons
const addImageBtn = els.editorPanel.querySelector('#addImage');
const addVideoBtn = els.editorPanel.querySelector('#addVideo');
const newMediaInput = els.editorPanel.querySelector('#newMediaPath');

if (addImageBtn && newMediaInput) {
  addImageBtn.addEventListener('click', () => {
    const path = newMediaInput.value.trim();
    if (!path) return;
    if (!block.media) block.media = [];
    if (block.media.length >= 20) {
      alert('Maximum 20 media items');
      return;
    }
    block.media.push({ src: path, type: 'image', caption: '', isHero: false });
    newMediaInput.value = '';
    renderEditor();
  });
}

if (addVideoBtn && newMediaInput) {
  addVideoBtn.addEventListener('click', () => {
    const path = newMediaInput.value.trim();
    if (!path) return;
    if (!block.media) block.media = [];
    if (block.media.length >= 20) {
      alert('Maximum 20 media items');
      return;
    }
    block.media.push({ src: path, type: 'video', caption: '', isHero: false });
    newMediaInput.value = '';
    renderEditor();
  });
}

// Gallery block: Caption editing
els.editorPanel.querySelectorAll('[data-caption-index]').forEach(input => {
  input.addEventListener('input', (e) => {
    const idx = parseInt(e.target.dataset.captionIndex);
    if (block.media && block.media[idx]) {
      block.media[idx].caption = e.target.value;
    }
  });
});

// Gallery block: Move up
els.editorPanel.querySelectorAll('[data-move-up]').forEach(btn => {
  btn.addEventListener('click', () => {
    const idx = parseInt(btn.dataset.moveUp);
    if (idx > 0 && block.media) {
      [block.media[idx], block.media[idx - 1]] = [block.media[idx - 1], block.media[idx]];
      renderEditor();
    }
  });
});

// Gallery block: Move down
els.editorPanel.querySelectorAll('[data-move-down]').forEach(btn => {
  btn.addEventListener('click', () => {
    const idx = parseInt(btn.dataset.moveDown);
    if (block.media && idx < block.media.length - 1) {
      [block.media[idx], block.media[idx + 1]] = [block.media[idx + 1], block.media[idx]];
      renderEditor();
    }
  });
});

// Gallery block: Toggle hero
els.editorPanel.querySelectorAll('[data-toggle-hero]').forEach(btn => {
  btn.addEventListener('click', () => {
    const idx = parseInt(btn.dataset.toggleHero);
    if (block.media && block.media[idx]) {
      // Clear any existing hero
      block.media.forEach(m => m.isHero = false);
      // Set this one as hero
      block.media[idx].isHero = true;
      renderEditor();
    }
  });
});

// Gallery block: Remove media
els.editorPanel.querySelectorAll('[data-remove]').forEach(btn => {
  btn.addEventListener('click', () => {
    const idx = parseInt(btn.dataset.remove);
    if (block.media && confirm('Remove this media item?')) {
      block.media.splice(idx, 1);
      renderEditor();
    }
  });
});