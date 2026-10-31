import { AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// In the Android app the page origin is https://localhost, so email links must point to the hosted web app.
const redirectBase = () => (import.meta.env.VITE_APP_URL as string | undefined) || window.location.origin;

const WEAK_PASSWORD_MESSAGE =
  'This password is too common or has appeared in a public data breach. Please choose a longer, more unique password, for example a few random words with numbers.';

function friendly(error: unknown): Error {
  if (error instanceof AuthError) {
    switch (error.code) {
      case 'weak_password':
        return new Error(WEAK_PASSWORD_MESSAGE);
      case 'invalid_credentials':
        return new Error('Incorrect email or password. Please try again.');
      case 'email_not_confirmed':
        return new Error('Please confirm your email first. Check your inbox for the confirmation link.');
      case 'user_already_exists':
        return new Error('An account with this email already exists. Please sign in instead.');
      case 'over_request_rate_limit':
      case 'over_email_send_rate_limit':
        return new Error('Too many attempts. Please wait a minute and try again.');
    }
  }
  if (error instanceof TypeError && /fetch|network/i.test(error.message)) {
    return new Error('Could not reach the server. Check your internet connection and try again.');
  }
  return error instanceof Error ? error : new Error('Something went wrong. Please try again.');
}

export async function signIn(email: string, password: string) {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  } catch (error) {
    throw friendly(error);
  }
}

/** Returns true when the user is signed in immediately, false when email confirmation is required. */
export async function signUp(name: string, email: string, password: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name }, emailRedirectTo: redirectBase() },
    });
    if (error) throw error;
    // With email confirmation on, Supabase returns a fake user (no identities) for an address that already exists.
    if (data.user && data.user.identities?.length === 0) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }
    return data.session !== null;
  } catch (error) {
    throw friendly(error);
  }
}

export async function sendPasswordReset(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectBase() });
    if (error) throw error;
  } catch (error) {
    throw friendly(error);
  }
}

export async function updatePassword(password: string) {
  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  } catch (error) {
    throw friendly(error);
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
