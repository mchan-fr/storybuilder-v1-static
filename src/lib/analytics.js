import { supabase, isSupabaseConfigured } from './supabase.js';

/**
 * Get retention/funnel analytics for a story
 * Shows what % of readers reached each block and detects anomalies
 */
export async function getRetentionAnalytics(storyId, userId) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }

  // Verify user owns this story
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('id, title, blocks')
    .eq('id', storyId)
    .eq('user_id', userId)
    .single();

  if (storyError) return { data: null, error: storyError };

  // Get all block_view events for this story
  const { data: events, error: eventsError } = await supabase
    .from('analytics_events')
    .select('session_id, block_index, block_type, event_type')
    .eq('story_id', storyId)
    .in('event_type', ['page_view', 'block_view']);

  if (eventsError) return { data: null, error: eventsError };

  // Get unique sessions that started (had a page_view)
  const sessionsWithPageView = new Set(
    events.filter(e => e.event_type === 'page_view').map(e => e.session_id)
  );
  const totalSessions = sessionsWithPageView.size;

  if (totalSessions === 0) {
    return { data: { story, totalSessions: 0, blocks: [], hasAnomaly: false }, error: null };
  }

  // For each session, find which blocks they viewed
  const sessionBlocks = new Map(); // session_id -> Set of block indices
  events.filter(e => e.event_type === 'block_view').forEach(e => {
    if (e.block_index == null) return;
    if (!sessionBlocks.has(e.session_id)) {
      sessionBlocks.set(e.session_id, new Set());
    }
    sessionBlocks.get(e.session_id).add(e.block_index);
  });

  // Calculate retention for each block
  const blockCount = story.blocks?.length || 0;
  const blocks = Array.from({ length: blockCount }, (_, i) => {
    const block = story.blocks[i] || {};
    // Count sessions that reached this block
    let reached = 0;
    sessionBlocks.forEach(blockSet => {
      if (blockSet.has(i)) reached++;
    });

    return {
      index: i,
      type: block.type || 'unknown',
      label: block.label || null,
      reached,
      retentionPct: Math.round((reached / totalSessions) * 100),
      dropOffCount: 0,
      dropOffPct: 0,
      isAnomaly: false,
      anomalyScore: 0
    };
  });

  // Calculate drop-off for each block
  // Drop-off at block N = readers who reached N but not N+1
  for (let i = 0; i < blocks.length - 1; i++) {
    const current = blocks[i];
    const next = blocks[i + 1];
    current.dropOffCount = current.reached - next.reached;
    current.dropOffPct = current.reached > 0
      ? Math.round((current.dropOffCount / current.reached) * 100)
      : 0;
  }

  // Last block: anyone who reached it but didn't "complete" (we'll just set to 0)
  if (blocks.length > 0) {
    blocks[blocks.length - 1].dropOffCount = 0;
    blocks[blocks.length - 1].dropOffPct = 0;
  }

  // Anomaly detection: compare each block's drop-off to neighbors
  // Use 2 blocks before and 2 after (when available)
  for (let i = 0; i < blocks.length - 1; i++) {
    const neighbors = [];
    for (let j = Math.max(0, i - 2); j <= Math.min(blocks.length - 2, i + 2); j++) {
      if (j !== i) neighbors.push(blocks[j].dropOffPct);
    }

    if (neighbors.length > 0) {
      const avgNeighbor = neighbors.reduce((a, b) => a + b, 0) / neighbors.length;
      const diff = blocks[i].dropOffPct - avgNeighbor;
      blocks[i].anomalyScore = diff;

      // Flag as anomaly if drop-off is significantly higher than neighbors
      // Threshold: 15 percentage points above average, and at least 2x the average
      if (diff > 15 && blocks[i].dropOffPct > avgNeighbor * 2 && blocks[i].dropOffPct > 10) {
        blocks[i].isAnomaly = true;
      }
    }
  }

  const hasAnomaly = blocks.some(b => b.isAnomaly);
  const completionRate = blocks.length > 0 ? blocks[blocks.length - 1].retentionPct : 0;

  return {
    data: {
      story,
      totalSessions,
      completionRate,
      blocks,
      hasAnomaly
    },
    error: null
  };
}

/**
 * Get analytics summary for all user's stories
 */
export async function getAnalyticsSummary(userId) {
  if (!isSupabaseConfigured()) {
    return { data: [], error: { message: 'Supabase not configured' } };
  }

  // First get user's stories
  const { data: stories, error: storiesError } = await supabase
    .from('stories')
    .select('id, title, project')
    .eq('user_id', userId);

  if (storiesError) return { data: [], error: storiesError };
  if (!stories?.length) return { data: [], error: null };

  // Get analytics for each story
  const storyIds = stories.map(s => s.id);

  const { data: events, error: eventsError } = await supabase
    .from('analytics_events')
    .select('story_id, event_type, block_type, event_data, created_at, session_id')
    .in('story_id', storyIds);

  if (eventsError) return { data: [], error: eventsError };

  // Aggregate data per story
  const summaries = stories.map(story => {
    const storyEvents = (events || []).filter(e => e.story_id === story.id);
    const sessions = new Set(storyEvents.map(e => e.session_id));
    const pageViews = storyEvents.filter(e => e.event_type === 'page_view').length;
    const blockViews = storyEvents.filter(e => e.event_type === 'block_view');
    const blockEngagements = storyEvents.filter(e => e.event_type === 'block_engage');
    const scrollEvents = storyEvents.filter(e => e.event_type === 'scroll_depth');

    // Calculate average engagement time
    const totalEngageTime = blockEngagements.reduce((sum, e) =>
      sum + (e.event_data?.duration_ms || 0), 0);
    const avgEngageTime = blockEngagements.length > 0
      ? Math.round(totalEngageTime / blockEngagements.length / 1000)
      : 0;

    // Calculate average scroll depth
    const maxScrolls = scrollEvents.map(e => e.event_data?.scroll_pct || 0);
    const avgScrollDepth = maxScrolls.length > 0
      ? Math.round(maxScrolls.reduce((a, b) => a + b, 0) / maxScrolls.length)
      : 0;

    // Block type breakdown
    const blockTypeViews = {};
    blockViews.forEach(e => {
      const type = e.block_type || 'unknown';
      blockTypeViews[type] = (blockTypeViews[type] || 0) + 1;
    });

    return {
      storyId: story.id,
      title: story.title || story.project || 'Untitled',
      uniqueVisitors: sessions.size,
      pageViews,
      blockImpressions: blockViews.length,
      avgEngageTimeSec: avgEngageTime,
      avgScrollDepth,
      blockTypeViews,
      lastView: storyEvents.length > 0
        ? new Date(Math.max(...storyEvents.map(e => new Date(e.created_at)))).toISOString()
        : null
    };
  });

  return { data: summaries, error: null };
}

/**
 * Get detailed analytics for a single story
 */
export async function getStoryAnalytics(storyId, userId) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }

  // Verify user owns this story
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('id, title, blocks')
    .eq('id', storyId)
    .eq('user_id', userId)
    .single();

  if (storyError) return { data: null, error: storyError };

  // Get all events for this story
  const { data: events, error: eventsError } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('story_id', storyId)
    .order('created_at', { ascending: false });

  if (eventsError) return { data: null, error: eventsError };

  // Per-block analytics
  const blockCount = story.blocks?.length || 0;
  const blockStats = Array.from({ length: blockCount }, (_, i) => ({
    index: i,
    type: story.blocks[i]?.type || 'unknown',
    views: 0,
    totalEngageTime: 0,
    engageCount: 0,
    totalExpectedTime: 0,
    totalEngagementPct: 0
  }));

  const sessions = new Set();
  const pageViews = [];
  const scrollDepths = [];

  events.forEach(e => {
    sessions.add(e.session_id);

    if (e.event_type === 'page_view') {
      pageViews.push(e);
    } else if (e.event_type === 'scroll_depth') {
      scrollDepths.push(e.event_data?.scroll_pct || 0);
    } else if (e.event_type === 'block_view' && e.block_index != null) {
      if (blockStats[e.block_index]) {
        blockStats[e.block_index].views++;
      }
    } else if (e.event_type === 'block_engage' && e.block_index != null) {
      if (blockStats[e.block_index]) {
        blockStats[e.block_index].totalEngageTime += e.event_data?.duration_ms || 0;
        blockStats[e.block_index].engageCount++;
        // Track expected time and engagement percentage
        if (e.event_data?.expected_time_sec) {
          blockStats[e.block_index].totalExpectedTime += e.event_data.expected_time_sec;
        }
        if (e.event_data?.engagement_pct) {
          blockStats[e.block_index].totalEngagementPct += e.event_data.engagement_pct;
        }
      }
    }
  });

  // Calculate averages
  blockStats.forEach(b => {
    b.avgEngageTimeSec = b.engageCount > 0
      ? Math.round(b.totalEngageTime / b.engageCount / 1000)
      : 0;
    b.avgExpectedTimeSec = b.engageCount > 0
      ? Math.round(b.totalExpectedTime / b.engageCount)
      : 0;
    b.avgEngagementPct = b.engageCount > 0
      ? Math.round(b.totalEngagementPct / b.engageCount)
      : 0;
  });

  return {
    data: {
      story,
      uniqueVisitors: sessions.size,
      pageViews: pageViews.length,
      avgScrollDepth: scrollDepths.length > 0
        ? Math.round(scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length)
        : 0,
      blockStats,
      recentEvents: events.slice(0, 50)
    },
    error: null
  };
}
