-- StoryBuilder Analytics Schema
-- Run this in your Supabase SQL Editor

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'page_view', 'block_view', 'block_engage', 'scroll_depth', 'interaction'
  block_index INTEGER, -- Which block (0-indexed)
  block_type TEXT, -- 'hero', 'gallery', 'text', etc.
  event_data JSONB DEFAULT '{}'::jsonb, -- Additional data (duration_ms, scroll_pct, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Visitor info
  user_agent TEXT,
  viewport_width INTEGER,
  viewport_height INTEGER,
  referrer TEXT
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS analytics_story_id_idx ON analytics_events(story_id);
CREATE INDEX IF NOT EXISTS analytics_event_type_idx ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS analytics_created_at_idx ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_session_idx ON analytics_events(session_id);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can INSERT events (for public stories)
CREATE POLICY "Anyone can insert analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

-- Policy: Story owners can read their analytics
CREATE POLICY "Story owners can read analytics"
  ON analytics_events FOR SELECT
  USING (
    story_id IN (
      SELECT id FROM stories WHERE user_id = auth.uid()
    )
  );

-- Aggregated stats view for faster dashboard queries
CREATE OR REPLACE VIEW analytics_summary AS
SELECT
  story_id,
  COUNT(DISTINCT session_id) as unique_visitors,
  COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views,
  COUNT(*) FILTER (WHERE event_type = 'block_view') as block_impressions,
  AVG((event_data->>'duration_ms')::numeric) FILTER (WHERE event_type = 'block_engage') as avg_block_time_ms,
  MAX((event_data->>'scroll_pct')::numeric) FILTER (WHERE event_type = 'scroll_depth') as max_scroll_depth,
  MIN(created_at) as first_view,
  MAX(created_at) as last_view
FROM analytics_events
GROUP BY story_id;
