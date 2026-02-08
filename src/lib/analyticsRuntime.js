/**
 * Analytics Runtime for StoryBuilder
 * This code is injected into exported HTML to track reader engagement
 */

export const ANALYTICS_RUNTIME = `
<script>
(function() {
  // Configuration - set by export
  const SUPABASE_URL = '{{SUPABASE_URL}}';
  const SUPABASE_ANON_KEY = '{{SUPABASE_ANON_KEY}}';
  const STORY_ID = '{{STORY_ID}}';

  // Skip if not configured
  if (!SUPABASE_URL || SUPABASE_URL.includes('{{')) {
    console.log('[Analytics] Not configured, skipping');
    return;
  }

  // Generate session ID
  const SESSION_ID = 'ses_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();

  // Track block visibility and time
  const blockTimes = new Map(); // block index -> { startTime, totalTime, visible }
  let maxScrollDepth = 0;

  // Send event to Supabase
  async function sendEvent(eventType, data = {}) {
    try {
      const payload = {
        story_id: STORY_ID,
        session_id: SESSION_ID,
        event_type: eventType,
        block_index: data.blockIndex ?? null,
        block_type: data.blockType ?? null,
        event_data: data.eventData ?? {},
        user_agent: navigator.userAgent,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        referrer: document.referrer || null
      };

      await fetch(SUPABASE_URL + '/rest/v1/analytics_events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn('[Analytics] Failed to send event:', e);
    }
  }

  // Track page view
  sendEvent('page_view');

  // Find all blocks
  const blocks = document.querySelectorAll('[data-sb-block]');

  // Setup IntersectionObserver for block visibility
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const block = entry.target;
      const index = parseInt(block.dataset.sbBlock);
      const type = block.dataset.sbType || 'unknown';

      if (!blockTimes.has(index)) {
        blockTimes.set(index, { startTime: null, totalTime: 0, visible: false, tracked: false });
      }

      const state = blockTimes.get(index);

      if (entry.isIntersecting) {
        // Block entered viewport
        state.visible = true;
        state.startTime = Date.now();

        // Track first impression
        if (!state.tracked) {
          state.tracked = true;
          sendEvent('block_view', { blockIndex: index, blockType: type });
        }
      } else {
        // Block left viewport
        if (state.visible && state.startTime) {
          state.totalTime += Date.now() - state.startTime;
        }
        state.visible = false;
        state.startTime = null;
      }
    });
  }, { threshold: 0.5 }); // 50% visible

  blocks.forEach(block => observer.observe(block));

  // Track scroll depth
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollPct = Math.round(
        (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100
      );
      if (scrollPct > maxScrollDepth) {
        maxScrollDepth = scrollPct;
      }
    }, 100);
  }, { passive: true });

  // Send engagement data on page unload
  function sendEngagement() {
    // Update visible blocks' time
    blockTimes.forEach((state, index) => {
      if (state.visible && state.startTime) {
        state.totalTime += Date.now() - state.startTime;
      }
    });

    // Send block engagement times
    const blockElements = document.querySelectorAll('[data-sb-block]');
    blockTimes.forEach((state, index) => {
      if (state.totalTime > 1000) { // Only if viewed > 1 second
        const block = blockElements[index];
        const type = block?.dataset.sbType || 'unknown';

        // Use sendBeacon for reliability on page unload
        const payload = {
          story_id: STORY_ID,
          session_id: SESSION_ID,
          event_type: 'block_engage',
          block_index: index,
          block_type: type,
          event_data: { duration_ms: state.totalTime },
          user_agent: navigator.userAgent,
          viewport_width: window.innerWidth,
          viewport_height: window.innerHeight,
          referrer: document.referrer || null
        };

        navigator.sendBeacon(
          SUPABASE_URL + '/rest/v1/analytics_events',
          new Blob([JSON.stringify(payload)], { type: 'application/json' })
        );
      }
    });

    // Send scroll depth
    if (maxScrollDepth > 0) {
      const payload = {
        story_id: STORY_ID,
        session_id: SESSION_ID,
        event_type: 'scroll_depth',
        block_index: null,
        block_type: null,
        event_data: { scroll_pct: maxScrollDepth },
        user_agent: navigator.userAgent,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        referrer: document.referrer || null
      };

      navigator.sendBeacon(
        SUPABASE_URL + '/rest/v1/analytics_events',
        new Blob([JSON.stringify(payload)], { type: 'application/json' })
      );
    }
  }

  // Send on page unload
  window.addEventListener('beforeunload', sendEngagement);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      sendEngagement();
    }
  });
})();
</script>
`;

/**
 * Generate analytics runtime with config injected
 */
export function generateAnalyticsRuntime(config) {
  if (!config.supabaseUrl || !config.supabaseAnonKey || !config.storyId) {
    return '<!-- Analytics: not configured -->';
  }

  return ANALYTICS_RUNTIME
    .replace('{{SUPABASE_URL}}', config.supabaseUrl)
    .replace('{{SUPABASE_ANON_KEY}}', config.supabaseAnonKey)
    .replace('{{STORY_ID}}', config.storyId);
}
