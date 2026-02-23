import { signIn, signUp, signOut, getUser, onAuthStateChange, resetPassword, updatePassword } from './auth.js';
import { isSupabaseConfigured } from './supabase.js';

// DEV MODE: Set to true to bypass authentication for local testing
const DEV_BYPASS_AUTH = false;

/**
 * Auth UI State Manager
 * Handles rendering auth forms and managing user state
 */
export class AuthUI {
  constructor(containerEl, onAuthChange) {
    this.container = containerEl;
    this.onAuthChange = onAuthChange;
    this.user = null;
    this.mode = 'signin'; // 'signin', 'signup', 'reset', 'update-password'
    this.loading = false;
    this.error = null;
    this.isRecoveryMode = false;

    // DEV MODE: Bypass auth for local testing
    if (DEV_BYPASS_AUTH) {
      this.user = { id: 'dev-user', email: 'dev@localhost' };
      this.renderDevMode();
      if (this.onAuthChange) {
        this.onAuthChange(this.user);
      }
      return;
    }

    // Check URL hash for recovery token BEFORE auth state changes
    this.checkForRecoveryToken();

    // Subscribe to auth changes
    this.subscription = onAuthStateChange((event, session) => {
      // Handle password recovery flow
      if (event === 'PASSWORD_RECOVERY' || this.isRecoveryMode) {
        this.mode = 'update-password';
        this.isRecoveryMode = true;
        this.render();
        // Don't call onAuthChange - user needs to set password first
        return;
      }

      this.user = session?.user || null;
      this.render();
      if (this.onAuthChange) {
        this.onAuthChange(this.user);
      }
    });

    // Initial check (skip if in recovery mode)
    if (!this.isRecoveryMode) {
      this.checkUser();
    } else {
      // Render immediately to show password update form
      this.render();
    }
  }

  renderDevMode() {
    this.container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: #fef3c7; border-radius: 6px;">
        <span style="font-size: 12px; color: #92400e;">DEV MODE</span>
      </div>
    `;
  }

  checkForRecoveryToken() {
    // Supabase includes type=recovery in the URL hash
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      this.isRecoveryMode = true;
      this.mode = 'update-password';
    }
  }

  async checkUser() {
    const { user } = await getUser();
    this.user = user;
    this.render();
    if (this.onAuthChange) {
      this.onAuthChange(this.user);
    }
  }

  setMode(mode) {
    this.mode = mode;
    this.error = null;
    this.render();
  }

  async handleSignIn(email, password) {
    this.loading = true;
    this.error = null;
    this.render();

    const { error } = await signIn(email, password);

    this.loading = false;
    if (error) {
      this.error = error.message;
    }
    this.render();
  }

  async handleSignUp(email, password) {
    this.loading = true;
    this.error = null;
    this.render();

    const { error } = await signUp(email, password);

    this.loading = false;
    if (error) {
      this.error = error.message;
    } else {
      this.error = null;
      this.mode = 'confirm';
    }
    this.render();
  }

  async handleResetPassword(email) {
    this.loading = true;
    this.error = null;
    this.render();

    const { error } = await resetPassword(email);

    this.loading = false;
    if (error) {
      this.error = error.message;
    } else {
      this.mode = 'reset-sent';
    }
    this.render();
  }

  async handleUpdatePassword(newPassword) {
    this.loading = true;
    this.error = null;
    this.render();

    const { error } = await updatePassword(newPassword);

    this.loading = false;
    if (error) {
      this.error = error.message;
    } else {
      this.mode = 'password-updated';
      this.isRecoveryMode = false;
      // Clear URL hash
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
    this.render();
  }

  async handleSignOut() {
    await signOut();
    this.user = null;
    this.mode = 'signin';
    this.render();
  }

  render() {
    if (!isSupabaseConfigured()) {
      this.container.innerHTML = `
        <div class="auth-warning" style="padding: 1rem; background: #fef3c7; border-radius: 8px; margin-bottom: 1rem;">
          <strong>Supabase not configured</strong><br>
          <small>Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local</small>
        </div>
      `;
      return;
    }

    if (this.user) {
      this.renderLoggedIn();
    } else {
      this.renderAuthForm();
    }
  }

  renderLoggedIn() {
    this.container.innerHTML = `
      <div class="auth-user" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0;">
        <div class="auth-avatar" style="width: 32px; height: 32px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px;">
          ${this.user.email.charAt(0).toUpperCase()}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 13px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${this.user.email}
          </div>
        </div>
        <button id="auth-signout-btn" style="padding: 0.375rem 0.75rem; font-size: 12px; border: 1px solid #e5e7eb; background: white; border-radius: 6px; cursor: pointer;">
          Sign out
        </button>
      </div>
    `;

    this.container.querySelector('#auth-signout-btn').addEventListener('click', () => this.handleSignOut());
  }

  renderAuthForm() {
    if (this.mode === 'confirm') {
      this.container.innerHTML = `
        <div class="auth-form" style="padding: 1.5rem; background: #f0fdf4; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; margin-bottom: 0.5rem;">✓</div>
          <strong>Check your email</strong><br>
          <small>Click the confirmation link to activate your account.</small>
          <button id="auth-back-btn" style="margin-top: 1rem; padding: 0.5rem 1rem; border: none; background: #3b82f6; color: white; border-radius: 6px; cursor: pointer;">
            Back to Sign In
          </button>
        </div>
      `;
      this.container.querySelector('#auth-back-btn').addEventListener('click', () => this.setMode('signin'));
      return;
    }

    if (this.mode === 'update-password') {
      this.container.innerHTML = `
        <div class="auth-form" style="padding: 1rem;">
          <h3 style="margin: 0 0 1rem 0; font-size: 16px; font-weight: 600;">Set New Password</h3>
          ${this.error ? `<div style="padding: 0.5rem; background: #fef2f2; color: #dc2626; border-radius: 6px; margin-bottom: 1rem; font-size: 13px;">${this.error}</div>` : ''}
          <form id="auth-form">
            <div style="margin-bottom: 0.75rem;">
              <input type="password" id="auth-password" placeholder="New password" required minlength="6"
                style="width: 100%; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 0.75rem;">
              <input type="password" id="auth-password-confirm" placeholder="Confirm password" required minlength="6"
                style="width: 100%; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
            </div>
            <button type="submit" ${this.loading ? 'disabled' : ''}
              style="width: 100%; padding: 0.625rem; border: none; background: ${this.loading ? '#9ca3af' : '#3b82f6'}; color: white; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: ${this.loading ? 'wait' : 'pointer'};">
              ${this.loading ? 'Please wait...' : 'Update Password'}
            </button>
          </form>
        </div>
      `;

      this.container.querySelector('#auth-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = this.container.querySelector('#auth-password').value;
        const confirmPassword = this.container.querySelector('#auth-password-confirm').value;

        if (password !== confirmPassword) {
          this.error = 'Passwords do not match';
          this.render();
          return;
        }

        await this.handleUpdatePassword(password);
      });
      return;
    }

    if (this.mode === 'password-updated') {
      this.container.innerHTML = `
        <div class="auth-form" style="padding: 1.5rem; background: #f0fdf4; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; margin-bottom: 0.5rem;">✓</div>
          <strong>Password Updated</strong><br>
          <small>Your password has been successfully changed.</small>
          <button id="auth-back-btn" style="margin-top: 1rem; padding: 0.5rem 1rem; border: none; background: #3b82f6; color: white; border-radius: 6px; cursor: pointer;">
            Sign In
          </button>
        </div>
      `;
      this.container.querySelector('#auth-back-btn').addEventListener('click', async () => {
        this.isRecoveryMode = false;
        // Re-check user - they should now be logged in with new password
        await this.checkUser();
      });
      return;
    }

    if (this.mode === 'reset-sent') {
      this.container.innerHTML = `
        <div class="auth-form" style="padding: 1.5rem; background: #f0fdf4; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; margin-bottom: 0.5rem;">✉️</div>
          <strong>Reset link sent</strong><br>
          <small>Check your email for a password reset link.</small>
          <button id="auth-back-btn" style="margin-top: 1rem; padding: 0.5rem 1rem; border: none; background: #3b82f6; color: white; border-radius: 6px; cursor: pointer;">
            Back to Sign In
          </button>
        </div>
      `;
      this.container.querySelector('#auth-back-btn').addEventListener('click', () => this.setMode('signin'));
      return;
    }

    const isSignUp = this.mode === 'signup';
    const isReset = this.mode === 'reset';

    let title = 'Sign In';
    let buttonText = 'Sign In';
    if (isSignUp) {
      title = 'Create Account';
      buttonText = 'Sign Up';
    } else if (isReset) {
      title = 'Reset Password';
      buttonText = 'Send Reset Link';
    }

    this.container.innerHTML = `
      <div class="auth-form" style="padding: 1rem;">
        <h3 style="margin: 0 0 1rem 0; font-size: 16px; font-weight: 600;">${title}</h3>
        ${this.error ? `<div style="padding: 0.5rem; background: #fef2f2; color: #dc2626; border-radius: 6px; margin-bottom: 1rem; font-size: 13px;">${this.error}</div>` : ''}
        <form id="auth-form">
          <div style="margin-bottom: 0.75rem;">
            <input type="email" id="auth-email" placeholder="Email" required
              style="width: 100%; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
          </div>
          ${!isReset ? `
          <div style="margin-bottom: 0.75rem;">
            <input type="password" id="auth-password" placeholder="Password" required minlength="6"
              style="width: 100%; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
          </div>
          ` : ''}
          <button type="submit" ${this.loading ? 'disabled' : ''}
            style="width: 100%; padding: 0.625rem; border: none; background: ${this.loading ? '#9ca3af' : '#3b82f6'}; color: white; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: ${this.loading ? 'wait' : 'pointer'};">
            ${this.loading ? 'Please wait...' : buttonText}
          </button>
        </form>
        <div style="margin-top: 1rem; font-size: 13px; text-align: center; color: #6b7280;">
          ${isSignUp ? `
            Already have an account? <a href="#" id="auth-toggle" style="color: #3b82f6;">Sign in</a>
          ` : isReset ? `
            <a href="#" id="auth-toggle" style="color: #3b82f6;">Back to sign in</a>
          ` : `
            <a href="#" id="auth-reset" style="color: #6b7280;">Forgot password?</a>
            <br><br>
            Don't have an account? <a href="#" id="auth-toggle" style="color: #3b82f6;">Sign up</a>
          `}
        </div>
      </div>
    `;

    // Form submission
    this.container.querySelector('#auth-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = this.container.querySelector('#auth-email').value;
      const password = this.container.querySelector('#auth-password')?.value;

      if (isReset) {
        await this.handleResetPassword(email);
      } else if (isSignUp) {
        await this.handleSignUp(email, password);
      } else {
        await this.handleSignIn(email, password);
      }
    });

    // Toggle links
    const toggleLink = this.container.querySelector('#auth-toggle');
    if (toggleLink) {
      toggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.setMode(isSignUp || isReset ? 'signin' : 'signup');
      });
    }

    const resetLink = this.container.querySelector('#auth-reset');
    if (resetLink) {
      resetLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.setMode('reset');
      });
    }
  }

  destroy() {
    if (this.subscription?.data?.subscription) {
      this.subscription.data.subscription.unsubscribe();
    }
  }
}
