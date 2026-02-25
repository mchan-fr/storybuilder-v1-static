import { supabase, isSupabaseConfigured } from './supabase.js';

/**
 * Sign up with email and password
 */
export async function signUp(email, password) {
  if (!isSupabaseConfigured()) {
    return { error: { message: 'Supabase not configured' } };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  return { data, error };
}

/**
 * Sign in with email and password
 */
export async function signIn(email, password) {
  if (!isSupabaseConfigured()) {
    return { error: { message: 'Supabase not configured' } };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  return { data, error };
}

/**
 * Sign out current user
 */
export async function signOut() {
  if (!isSupabaseConfigured()) {
    return { error: { message: 'Supabase not configured' } };
  }

  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get current user session
 */
export async function getSession() {
  if (!isSupabaseConfigured()) {
    return { data: { session: null } };
  }

  const { data, error } = await supabase.auth.getSession();
  return { data, error };
}

/**
 * Get current user
 */
export async function getUser() {
  if (!isSupabaseConfigured()) {
    return { data: { user: null } };
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured()) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

/**
 * Send password reset email
 */
export async function resetPassword(email) {
  if (!isSupabaseConfigured()) {
    return { error: { message: 'Supabase not configured' } };
  }

  // Use current page URL (without hash) to handle GitHub Pages base path correctly
  const redirectUrl = window.location.origin + window.location.pathname;
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl
  });

  return { data, error };
}

/**
 * Update user password (used after clicking reset link)
 */
export async function updatePassword(newPassword) {
  if (!isSupabaseConfigured()) {
    return { error: { message: 'Supabase not configured' } };
  }

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });

  return { data, error };
}
