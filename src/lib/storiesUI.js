import { loadStories, loadStory, saveStory, deleteStory, duplicateStory } from './stories.js';
import { isSupabaseConfigured } from './supabase.js';

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
    if (!this.userId) return;

    this.loading = true;
    this.render();

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
    this.currentStoryId = null;
    this.onNew();
    this.render();
  }

  render() {
    if (!isSupabaseConfigured()) {
      this.container.innerHTML = '';
      return;
    }

    if (!this.userId) {
      this.container.innerHTML = `
        <div style="padding: 0.75rem; text-align: center; color: #6b7280; font-size: 13px;">
          Sign in to save stories to the cloud
        </div>
      `;
      return;
    }

    const formatDate = (dateStr) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString();
    };

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
            ${this.stories.length === 0 ? `
              <div style="padding: 0.75rem; text-align: center; color: #9ca3af; font-size: 13px;">
                No saved stories
              </div>
            ` : this.stories.map(story => `
              <div class="story-option" data-id="${story.id}" style="padding: 0.625rem 0.75rem; cursor: pointer; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; ${story.id === this.currentStoryId ? 'background: #eff6ff;' : ''}">
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 13px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${story.title || 'Untitled'}
                  </div>
                  <div style="font-size: 11px; color: #9ca3af;">${formatDate(story.updated_at)}</div>
                </div>
                <button class="story-delete-btn" data-id="${story.id}" style="padding: 0.25rem 0.5rem; font-size: 11px; border: none; background: transparent; color: #ef4444; cursor: pointer; flex-shrink: 0;">
                  ✕
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Action buttons -->
        <div style="display: flex; gap: 0.375rem;">
          <button id="stories-new-btn" style="padding: 0.4rem 0.75rem; border: 1px solid #d1d5db; background: white; border-radius: 5px; font-size: 12px; cursor: pointer; white-space: nowrap;">
            + New
          </button>
          <button id="stories-save-btn" ${this.saving ? 'disabled' : ''} style="flex: 1; padding: 0.4rem 0.75rem; border: none; background: ${this.saving ? '#9ca3af' : '#3b82f6'}; color: white; border-radius: 5px; font-size: 12px; cursor: ${this.saving ? 'wait' : 'pointer'};">
            ${this.saving ? 'Saving...' : 'Save'}
          </button>
          ${this.currentStoryId ? `
            <button id="stories-saveas-btn" style="padding: 0.4rem 0.75rem; border: 1px solid #d1d5db; background: white; border-radius: 5px; font-size: 12px; cursor: pointer; white-space: nowrap; color: #6b7280;">
              Save As
            </button>
          ` : ''}
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
