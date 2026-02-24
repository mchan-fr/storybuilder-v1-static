import { loadStories, loadStory, saveStory, deleteStory, duplicateStory } from './stories.js';
import { isSupabaseConfigured } from './supabase.js';

// Bundled demo story that all users can access
const DEMO_STORY = {
  id: '__demo__',
  title: 'Mt. Whitney Demo',
  isDemo: true,
  updated_at: '2024-01-01'
};

// Track if currently viewing demo (can't save)
let isDemoMode = false;

export function isInDemoMode() {
  return isDemoMode;
}

/**
 * Stories UI Manager
 * Handles rendering story list and save/load operations
 */
export class StoriesUI {
  constructor(containerEl, options = {}) {
    this.container = containerEl;
    this.userId = null;
    this.stories = [];
    this.currentStoryId = null;
    this.loading = false;
    this.saving = false;
    this.onLoad = options.onLoad || (() => {});
    this.onNew = options.onNew || (() => {});
    this.getState = options.getState || (() => ({}));
  }

  async loadDemoStory() {
    try {
      // Try relative path first (works in dev), fall back to base-aware path
      let response = await fetch('projects/mt_whitney_demo/story.json');
      if (!response.ok) {
        // Try with base path for production (GitHub Pages)
        response = await fetch('./projects/mt_whitney_demo/story.json');
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      console.log('Demo story loaded:', data.pageTitle, 'with', data.blocks?.length, 'blocks');
      // Debug: log first block to verify content is correct
      if (data.blocks?.[0]) {
        console.log('First block type:', data.blocks[0].type);
        console.log('First block headline:', data.blocks[0].headline);
        console.log('First block image:', data.blocks[0].image);
      }
      return data;
    } catch (err) {
      console.error('Failed to load demo story:', err);
      return null;
    }
  }

  setUser(user) {
    this.userId = user?.id || null;
    if (this.userId) {
      this.loadStoryList();
    } else {
      this.stories = [];
      this.currentStoryId = null;
      this.render();
    }
  }

  async loadStoryList() {
    if (!this.userId) return;

    this.loading = true;
    this.render();

    const { data, error } = await loadStories(this.userId);

    this.loading = false;
    if (!error) {
      this.stories = data;
    }
    this.render();
  }

  async handleLoad(storyId) {
    this.loading = true;
    this.render();

    // Handle demo story specially
    if (storyId === '__demo__') {
      const demoData = await this.loadDemoStory();
      this.loading = false;
      if (demoData) {
        isDemoMode = true;
        this.currentStoryId = null;
        this.onLoad(demoData, { isDemo: true });
      } else {
        alert('Error loading demo story');
      }
      this.render();
      return;
    }

    // Loading a real story exits demo mode
    isDemoMode = false;

    if (!this.userId) return;

    const { data, error } = await loadStory(storyId, this.userId);

    this.loading = false;
    if (error) {
      alert('Error loading story: ' + error.message);
    } else {
      this.currentStoryId = storyId;
      this.onLoad(data);
    }
    this.render();
  }

  async handleSave() {
    if (!this.userId) return;

    const state = this.getState();
    this.saving = true;
    this.render();

    const { data, error } = await saveStory({
      id: this.currentStoryId,
      title: state.pageTitle || state.project || 'Untitled Story',
      project: state.project || '',
      blocks: state.blocks || [],
      userId: this.userId
    });

    this.saving = false;
    if (error) {
      alert('Error saving story: ' + error.message);
    } else {
      this.currentStoryId = data.id;
      await this.loadStoryList();
    }
  }

  async handleSaveAs() {
    if (!this.userId) return;

    const state = this.getState();
    const newTitle = prompt('Enter a name for the new story:', (state.pageTitle || state.project || 'Untitled Story') + ' (copy)');
    if (!newTitle) return;

    this.saving = true;
    this.render();

    const { data, error } = await saveStory({
      id: null, // Force create new
      title: newTitle,
      project: state.project || '',
      blocks: state.blocks || [],
      userId: this.userId
    });

    this.saving = false;
    if (error) {
      alert('Error saving story: ' + error.message);
    } else {
      this.currentStoryId = data.id;
      await this.loadStoryList();
    }
  }

  async handleDelete(storyId) {
    if (!this.userId) return;
    if (!confirm('Delete this story? This cannot be undone.')) return;

    const { error } = await deleteStory(storyId, this.userId);

    if (error) {
      alert('Error deleting story: ' + error.message);
    } else {
      if (this.currentStoryId === storyId) {
        this.currentStoryId = null;
        this.onNew();
      }
      await this.loadStoryList();
    }
  }

  handleNew() {
    isDemoMode = false;
    this.currentStoryId = null;
    this.onNew();
    this.render();
  }

  render() {
    const formatDate = (dateStr) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString();
    };

    // Build list of all stories (demo + user stories)
    const allStories = [DEMO_STORY, ...this.stories];

    this.container.innerHTML = `
      <div class="stories-ui" style="padding: 0.5rem;">
        <!-- Story selector dropdown -->
        <div style="position: relative; margin-bottom: 0.5rem;">
          <button id="stories-dropdown-btn" style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; background: white; border-radius: 6px; font-size: 13px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; text-align: left;">
            <span>Stories</span>
            <span style="color: #6b7280; margin-left: 8px;">▼</span>
          </button>

          <!-- Dropdown menu (hidden by default) -->
          <div id="stories-dropdown-menu" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #d1d5db; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 100; max-height: 280px; overflow-y: auto; margin-top: 4px;">
            ${allStories.map(story => `
              <div class="story-option" data-id="${story.id}" style="padding: 0.625rem 0.75rem; cursor: pointer; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; ${story.id === this.currentStoryId ? 'background: #eff6ff;' : ''} ${story.isDemo ? 'background: #fefce8;' : ''}">
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 13px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; align-items: center; gap: 6px;">
                    ${story.isDemo ? '<span style="font-size: 10px; background: #fbbf24; color: #78350f; padding: 1px 5px; border-radius: 3px;">DEMO</span>' : ''}
                    ${story.title || 'Untitled'}
                  </div>
                  ${!story.isDemo ? `<div style="font-size: 11px; color: #9ca3af;">${formatDate(story.updated_at)}</div>` : '<div style="font-size: 11px; color: #6b7280;">Sample project to explore, edit <span style="color: #dc2626;">(can\'t save)</span></div>'}
                </div>
                ${!story.isDemo ? `
                  <button class="story-delete-btn" data-id="${story.id}" style="padding: 0.25rem 0.5rem; font-size: 11px; border: none; background: transparent; color: #ef4444; cursor: pointer; flex-shrink: 0;">
                    ✕
                  </button>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Action buttons -->
        <div style="display: flex; gap: 0.375rem;">
          <button id="stories-new-btn" style="padding: 0.4rem 0.75rem; border: 1px solid #d1d5db; background: white; border-radius: 5px; font-size: 12px; cursor: pointer; white-space: nowrap;">
            + New
          </button>
          ${isDemoMode ? `
            <div style="flex: 1; padding: 0.4rem 0.5rem; font-size: 11px; color: #9ca3af; text-align: center; background: #f3f4f6; border-radius: 5px;">
              Demo mode
            </div>
          ` : this.userId ? `
            <button id="stories-save-btn" ${this.saving ? 'disabled' : ''} style="flex: 1; padding: 0.4rem 0.75rem; border: none; background: ${this.saving ? '#9ca3af' : '#3b82f6'}; color: white; border-radius: 5px; font-size: 12px; cursor: ${this.saving ? 'wait' : 'pointer'};">
              ${this.saving ? 'Saving...' : 'Save'}
            </button>
            ${this.currentStoryId ? `
              <button id="stories-saveas-btn" style="padding: 0.4rem 0.75rem; border: 1px solid #d1d5db; background: white; border-radius: 5px; font-size: 12px; cursor: pointer; white-space: nowrap; color: #6b7280;">
                Save As
              </button>
            ` : ''}
          ` : `
            <div style="flex: 1; padding: 0.4rem 0.5rem; font-size: 11px; color: #6b7280; text-align: center;">
              Sign in to save
            </div>
          `}
        </div>
      </div>
    `;

    // Dropdown toggle
    const dropdownBtn = this.container.querySelector('#stories-dropdown-btn');
    const dropdownMenu = this.container.querySelector('#stories-dropdown-menu');

    dropdownBtn?.addEventListener('click', () => {
      const isOpen = dropdownMenu.style.display !== 'none';
      dropdownMenu.style.display = isOpen ? 'none' : 'block';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        dropdownMenu.style.display = 'none';
      }
    });

    // Story option clicks
    this.container.querySelectorAll('.story-option').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('story-delete-btn')) return;
        dropdownMenu.style.display = 'none';
        this.handleLoad(item.dataset.id);
      });
      item.addEventListener('mouseenter', () => {
        if (item.dataset.id !== this.currentStoryId) {
          item.style.background = '#f9fafb';
        }
      });
      item.addEventListener('mouseleave', () => {
        item.style.background = item.dataset.id === this.currentStoryId ? '#eff6ff' : '';
      });
    });

    // Delete buttons
    this.container.querySelectorAll('.story-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleDelete(btn.dataset.id);
      });
    });

    // Other buttons
    this.container.querySelector('#stories-new-btn')?.addEventListener('click', () => {
      dropdownMenu.style.display = 'none';
      this.handleNew();
    });
    this.container.querySelector('#stories-save-btn')?.addEventListener('click', () => this.handleSave());
    this.container.querySelector('#stories-saveas-btn')?.addEventListener('click', () => this.handleSaveAs());
  }
}
