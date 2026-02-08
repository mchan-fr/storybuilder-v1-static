import { supabase, isSupabaseConfigured } from './supabase.js';

/**
 * Save a story (create or update)
 */
export async function saveStory({ id, title, project, blocks, userId }) {
  if (!isSupabaseConfigured()) {
    return { error: { message: 'Supabase not configured' } };
  }

  const storyData = {
    title: title || 'Untitled Story',
    project: project || '',
    blocks: blocks || [],
    user_id: userId,
    updated_at: new Date().toISOString()
  };

  if (id) {
    // Update existing story
    const { data, error } = await supabase
      .from('stories')
      .update(storyData)
      .eq('id', id)
      .eq('user_id', userId) // Ensure user owns this story
      .select()
      .single();

    return { data, error };
  } else {
    // Create new story
    storyData.created_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('stories')
      .insert(storyData)
      .select()
      .single();

    return { data, error };
  }
}

/**
 * Load all stories for a user
 */
export async function loadStories(userId) {
  if (!isSupabaseConfigured()) {
    return { data: [], error: { message: 'Supabase not configured' } };
  }

  const { data, error } = await supabase
    .from('stories')
    .select('id, title, project, updated_at, created_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  return { data: data || [], error };
}

/**
 * Load a single story by ID
 */
export async function loadStory(id, userId) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  return { data, error };
}

/**
 * Delete a story
 */
export async function deleteStory(id, userId) {
  if (!isSupabaseConfigured()) {
    return { error: { message: 'Supabase not configured' } };
  }

  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  return { error };
}

/**
 * Duplicate a story
 */
export async function duplicateStory(id, userId) {
  if (!isSupabaseConfigured()) {
    return { error: { message: 'Supabase not configured' } };
  }

  // First, load the original story
  const { data: original, error: loadError } = await loadStory(id, userId);
  if (loadError) return { error: loadError };

  // Create a copy with new title
  const { data, error } = await saveStory({
    title: `${original.title} (copy)`,
    project: original.project,
    blocks: original.blocks,
    userId
  });

  return { data, error };
}
