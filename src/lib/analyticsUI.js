import { getAnalyticsSummary, getStoryAnalytics, getRetentionAnalytics } from './analytics.js';
import { isSupabaseConfigured } from './supabase.js';

/**
 * Analytics Dashboard UI
 */
export class AnalyticsUI {
  constructor(containerEl) {
    this.container = containerEl;
    this.userId = null;
    this.loading = false;
    this.summaries = [];
    this.selectedStoryId = null;
    this.storyDetails = null;
    this.retentionData = null;
    this.activeTab = 'overview'; // 'overview' or 'retention'
  }

  setUser(user) {
    this.userId = user?.id || null;
    if (this.userId) {
      this.loadSummary();
    } else {
      this.summaries = [];
      this.render();
    }
  }

  async loadSummary() {
    if (!this.userId) return;

    this.loading = true;
    this.render();

    const { data, error } = await getAnalyticsSummary(this.userId);

    this.loading = false;
    if (!error) {
      this.summaries = data;
    }
    this.render();
  }

  async loadStoryDetails(storyId) {
    if (!this.userId) return;

    this.loading = true;
    this.selectedStoryId = storyId;
    this.activeTab = 'overview';
    this.render();

    // Load both overview and retention data in parallel
    const [overviewResult, retentionResult] = await Promise.all([
      getStoryAnalytics(storyId, this.userId),
      getRetentionAnalytics(storyId, this.userId)
    ]);

    this.loading = false;
    if (!overviewResult.error) {
      this.storyDetails = overviewResult.data;
    }
    if (!retentionResult.error) {
      this.retentionData = retentionResult.data;
    }
    this.render();
  }

  switchTab(tab) {
    this.activeTab = tab;
    this.render();
  }

  backToSummary() {
    this.selectedStoryId = null;
    this.storyDetails = null;
    this.retentionData = null;
    this.activeTab = 'overview';
    this.render();
  }

  render() {
    if (!isSupabaseConfigured()) {
      this.container.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: #6b7280;">
          Analytics requires Supabase configuration
        </div>
      `;
      return;
    }

    if (!this.userId) {
      this.container.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: #6b7280;">
          Sign in to view analytics
        </div>
      `;
      return;
    }

    if (this.selectedStoryId && this.storyDetails) {
      this.renderStoryDetails();
    } else {
      this.renderSummary();
    }
  }

  renderSummary() {
    const formatDate = (dateStr) => {
      if (!dateStr) return 'Never';
      const d = new Date(dateStr);
      return d.toLocaleDateString();
    };

    this.container.innerHTML = `
      <div class="analytics-dashboard" style="padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 style="margin: 0; font-size: 1.25rem; font-weight: 600;">Analytics Dashboard</h2>
          <button id="analytics-refresh" style="padding: 0.5rem 1rem; border: 1px solid #e5e7eb; background: white; border-radius: 6px; font-size: 13px; cursor: pointer;">
            ${this.loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        ${this.summaries.length === 0 && !this.loading ? `
          <div style="padding: 2rem; text-align: center; color: #9ca3af; background: #f9fafb; border-radius: 8px;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📊</div>
            <div>No analytics data yet</div>
            <div style="font-size: 13px; margin-top: 0.5rem;">Export a story and share it to start collecting data</div>
          </div>
        ` : ''}

        <div class="analytics-grid" style="display: grid; gap: 1rem;">
          ${this.summaries.map(s => `
            <div class="analytics-card" data-story-id="${s.storyId}" style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; background: white; cursor: pointer; transition: all 0.2s;">
              <div style="font-weight: 600; margin-bottom: 0.75rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${s.title}
              </div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; font-size: 13px;">
                <div>
                  <div style="color: #6b7280;">Visitors</div>
                  <div style="font-size: 1.25rem; font-weight: 600; color: #3b82f6;">${s.uniqueVisitors}</div>
                </div>
                <div>
                  <div style="color: #6b7280;">Views</div>
                  <div style="font-size: 1.25rem; font-weight: 600;">${s.pageViews}</div>
                </div>
                <div>
                  <div style="color: #6b7280;">Avg Time</div>
                  <div style="font-size: 1.25rem; font-weight: 600;">${s.avgEngageTimeSec}s</div>
                </div>
                <div>
                  <div style="color: #6b7280;">Scroll</div>
                  <div style="font-size: 1.25rem; font-weight: 600;">${s.avgScrollDepth}%</div>
                </div>
              </div>
              <div style="margin-top: 0.75rem; font-size: 12px; color: #9ca3af;">
                Last view: ${formatDate(s.lastView)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Event listeners
    this.container.querySelector('#analytics-refresh')?.addEventListener('click', () => this.loadSummary());

    this.container.querySelectorAll('.analytics-card').forEach(card => {
      card.addEventListener('click', () => this.loadStoryDetails(card.dataset.storyId));
      card.addEventListener('mouseenter', () => card.style.borderColor = '#3b82f6');
      card.addEventListener('mouseleave', () => card.style.borderColor = '#e5e7eb');
    });
  }

  renderStoryDetails() {
    const d = this.storyDetails;
    if (!d) return;

    const tabStyle = (isActive) => `
      padding: 0.5rem 1rem;
      border: none;
      background: ${isActive ? 'white' : 'transparent'};
      border-radius: 6px;
      cursor: pointer;
      font-weight: ${isActive ? '600' : '400'};
      color: ${isActive ? '#1f2937' : '#6b7280'};
      ${isActive ? 'box-shadow: 0 1px 3px rgba(0,0,0,0.1);' : ''}
    `;

    this.container.innerHTML = `
      <div class="analytics-details" style="padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <button id="analytics-back" style="padding: 0.5rem 1rem; border: 1px solid #e5e7eb; background: white; border-radius: 6px; font-size: 13px; cursor: pointer;">
            ← Back to all stories
          </button>

          <!-- Tabs -->
          <div style="display: flex; background: #f3f4f6; border-radius: 8px; padding: 0.25rem; gap: 0.25rem;">
            <button id="tab-overview" style="${tabStyle(this.activeTab === 'overview')}">Overview</button>
            <button id="tab-retention" style="${tabStyle(this.activeTab === 'retention')}">
              Reader Flow
              ${this.retentionData?.hasAnomaly ? '<span style="color: #ef4444; margin-left: 4px;">⚠️</span>' : ''}
            </button>
          </div>
        </div>

        <h2 style="margin: 0 0 1.5rem 0; font-size: 1.25rem; font-weight: 600;">
          ${d.story.title || 'Untitled Story'}
        </h2>

        ${this.activeTab === 'overview' ? this.renderOverviewContent() : this.renderRetentionContent()}
      </div>
    `;

    // Event listeners
    this.container.querySelector('#analytics-back')?.addEventListener('click', () => this.backToSummary());
    this.container.querySelector('#tab-overview')?.addEventListener('click', () => this.switchTab('overview'));
    this.container.querySelector('#tab-retention')?.addEventListener('click', () => this.switchTab('retention'));
  }

  renderOverviewContent() {
    const d = this.storyDetails;
    if (!d) return '';

    return `
        <!-- Overview Stats -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
          <div style="padding: 1rem; background: #eff6ff; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; font-weight: 700; color: #3b82f6;">${d.uniqueVisitors}</div>
            <div style="font-size: 13px; color: #6b7280;">Unique Visitors</div>
          </div>
          <div style="padding: 1rem; background: #f0fdf4; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; font-weight: 700; color: #22c55e;">${d.pageViews}</div>
            <div style="font-size: 13px; color: #6b7280;">Page Views</div>
          </div>
          <div style="padding: 1rem; background: #fef3c7; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; font-weight: 700; color: #f59e0b;">${d.avgScrollDepth}%</div>
            <div style="font-size: 13px; color: #6b7280;">Avg Scroll Depth</div>
          </div>
        </div>

        <!-- Block Performance -->
        <h3 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Block Performance</h3>
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb;">#</th>
                <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb;">Block Type</th>
                <th style="padding: 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">Views</th>
                <th style="padding: 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">Expected</th>
                <th style="padding: 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">Actual</th>
                <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb;">Engagement</th>
              </tr>
            </thead>
            <tbody>
              ${d.blockStats.map((b, i) => {
                const expectedSec = b.avgExpectedTimeSec || 0;
                const actualSec = b.avgEngageTimeSec || 0;
                const engagementPct = b.avgEngagementPct || (expectedSec > 0 ? Math.round((actualSec / expectedSec) * 100) : 0);

                // Color based on engagement: red < 50%, yellow 50-80%, green 80-120%, blue > 120%
                let engageColor = '#9ca3af'; // grey default
                let engageLabel = '-';
                if (engagementPct > 0) {
                  if (engagementPct < 50) { engageColor = '#ef4444'; engageLabel = 'Low'; }
                  else if (engagementPct < 80) { engageColor = '#f59e0b'; engageLabel = 'Fair'; }
                  else if (engagementPct <= 120) { engageColor = '#22c55e'; engageLabel = 'Good'; }
                  else { engageColor = '#3b82f6'; engageLabel = 'High'; }
                }

                return `
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 0.75rem; color: #6b7280;">${i + 1}</td>
                    <td style="padding: 0.75rem;">
                      <span style="padding: 0.25rem 0.5rem; background: #e5e7eb; border-radius: 4px; font-size: 12px;">
                        ${b.type}
                      </span>
                    </td>
                    <td style="padding: 0.75rem; text-align: right; font-weight: 500;">${b.views}</td>
                    <td style="padding: 0.75rem; text-align: right; color: #6b7280;">${expectedSec > 0 ? expectedSec + 's' : '-'}</td>
                    <td style="padding: 0.75rem; text-align: right; font-weight: 500;">${actualSec}s</td>
                    <td style="padding: 0.75rem; width: 120px;">
                      ${engagementPct > 0 ? `
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                          <div style="background: #e5e7eb; border-radius: 4px; height: 8px; width: 60px; overflow: hidden;">
                            <div style="background: ${engageColor}; height: 100%; width: ${Math.min(100, engagementPct)}%;"></div>
                          </div>
                          <span style="font-size: 11px; color: ${engageColor}; font-weight: 600;">${engagementPct}%</span>
                        </div>
                      ` : '<span style="color: #9ca3af;">-</span>'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Engagement Legend -->
        <div style="margin-top: 1rem; padding: 0.75rem; background: #f9fafb; border-radius: 6px; font-size: 12px; color: #6b7280;">
          <span style="font-weight: 600;">Engagement Key:</span>
          <span style="margin-left: 0.75rem; color: #ef4444;">●</span> Low (&lt;50%)
          <span style="margin-left: 0.5rem; color: #f59e0b;">●</span> Fair (50-80%)
          <span style="margin-left: 0.5rem; color: #22c55e;">●</span> Good (80-120%)
          <span style="margin-left: 0.5rem; color: #3b82f6;">●</span> High (&gt;120%)
        </div>
    `;
  }

  renderRetentionContent() {
    const r = this.retentionData;
    if (!r) return '<div style="color: #6b7280; text-align: center; padding: 2rem;">Loading retention data...</div>';

    if (r.totalSessions === 0) {
      return `
        <div style="padding: 2rem; text-align: center; color: #9ca3af; background: #f9fafb; border-radius: 8px;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">📊</div>
          <div>No reader data yet</div>
          <div style="font-size: 13px; margin-top: 0.5rem;">Share your story to start collecting retention data</div>
        </div>
      `;
    }

    // Summary stats
    const completionRate = r.completionRate || 0;
    const anomalyBlocks = r.blocks.filter(b => b.isAnomaly);

    return `
      <!-- Retention Summary -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
        <div style="padding: 1rem; background: #eff6ff; border-radius: 8px; text-align: center;">
          <div style="font-size: 2rem; font-weight: 700; color: #3b82f6;">${r.totalSessions}</div>
          <div style="font-size: 13px; color: #6b7280;">Readers Started</div>
        </div>
        <div style="padding: 1rem; background: ${completionRate >= 50 ? '#f0fdf4' : '#fef2f2'}; border-radius: 8px; text-align: center;">
          <div style="font-size: 2rem; font-weight: 700; color: ${completionRate >= 50 ? '#22c55e' : '#ef4444'};">${completionRate}%</div>
          <div style="font-size: 13px; color: #6b7280;">Completion Rate</div>
        </div>
        <div style="padding: 1rem; background: ${anomalyBlocks.length > 0 ? '#fef2f2' : '#f0fdf4'}; border-radius: 8px; text-align: center;">
          <div style="font-size: 2rem; font-weight: 700; color: ${anomalyBlocks.length > 0 ? '#ef4444' : '#22c55e'};">${anomalyBlocks.length}</div>
          <div style="font-size: 13px; color: #6b7280;">Problem Blocks</div>
        </div>
      </div>

      ${anomalyBlocks.length > 0 ? `
        <div style="margin-bottom: 1.5rem; padding: 1rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;">
          <div style="font-weight: 600; color: #991b1b; margin-bottom: 0.5rem;">⚠️ High Drop-off Detected</div>
          <div style="font-size: 13px; color: #991b1b;">
            ${anomalyBlocks.map(b => `Block ${b.index + 1} (${b.type}${b.label ? ': ' + b.label : ''}) - ${b.dropOffPct}% drop-off`).join('<br>')}
          </div>
        </div>
      ` : ''}

      <!-- Retention Funnel -->
      <h3 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Reader Flow</h3>
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: white;">
        ${r.blocks.map((b, i) => {
          const barWidth = b.retentionPct;
          const isLast = i === r.blocks.length - 1;
          const barColor = b.isAnomaly ? '#ef4444' : '#3b82f6';
          const bgColor = b.isAnomaly ? '#fef2f2' : 'transparent';

          return `
            <div style="display: grid; grid-template-columns: 80px 1fr 60px; align-items: center; padding: 0.5rem 1rem; border-bottom: ${isLast ? 'none' : '1px solid #f3f4f6'}; background: ${bgColor};">
              <div style="font-size: 12px;">
                <span style="color: #6b7280;">${i + 1}.</span>
                <span style="padding: 0.125rem 0.375rem; background: #e5e7eb; border-radius: 3px; font-size: 11px; margin-left: 4px;">${b.type}</span>
                ${b.isAnomaly ? '<span style="color: #ef4444; margin-left: 4px;">⚠️</span>' : ''}
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div style="background: #e5e7eb; border-radius: 4px; height: 20px; flex: 1; overflow: hidden; position: relative;">
                  <div style="background: ${barColor}; height: 100%; width: ${barWidth}%; transition: width 0.3s;"></div>
                </div>
                ${!isLast && b.dropOffPct > 0 ? `
                  <span style="font-size: 10px; color: ${b.isAnomaly ? '#ef4444' : '#9ca3af'}; white-space: nowrap;">
                    -${b.dropOffPct}%
                  </span>
                ` : ''}
              </div>
              <div style="text-align: right; font-weight: 600; font-size: 13px; color: ${b.isAnomaly ? '#ef4444' : '#1f2937'};">
                ${b.retentionPct}%
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Legend -->
      <div style="margin-top: 1rem; padding: 0.75rem; background: #f9fafb; border-radius: 6px; font-size: 12px; color: #6b7280;">
        <span style="font-weight: 600;">How to read:</span>
        Each bar shows what % of readers reached that block.
        <span style="color: #ef4444;">⚠️ Red blocks</span> have unusually high drop-off compared to neighboring blocks.
      </div>
    `;
  }
}
