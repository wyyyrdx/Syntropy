import React, { useState } from 'react';
import {
  ArrowRight,
  Atom,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { api } from '../api';
import { retroAudio } from '../audio/retroAudio';

export default function LoginPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegistering = mode === 'register';

  const switchMode = (nextMode) => {
    retroAudio.playBlip?.();
    setMode(nextMode);
    setErrorMessage('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setErrorMessage('Enter your email and password to continue.');
      return;
    }
    if (isRegistering && password.length < 8) {
      setErrorMessage('Your password must contain at least 8 characters.');
      return;
    }
    if (isRegistering && password !== confirmPassword) {
      setErrorMessage('The passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const session = isRegistering
        ? await api.register(normalizedEmail, password)
        : await api.login(normalizedEmail, password);

      if (!session?.token || !session?.user) {
        throw new Error('The server returned an incomplete session.');
      }

      retroAudio.playCorrect?.();
      onAuthenticated(session);
    } catch (error) {
      setErrorMessage(error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-shell">
        <div className="auth-brand-panel">
          <div className="auth-brand-lockup">
            <div className="auth-emblem" aria-hidden="true"><Atom /></div>
            <span>Syntropy</span>
          </div>

          <div className="auth-intro">
            <div className="auth-kicker">Learn from your own material</div>
            <h1 className="auth-title">Turn notes into something you can explore.</h1>
            <p className="auth-lead">
              Upload a page, connect its ideas, and practise them through visual worlds and active recall.
            </p>
          </div>

          <div className="auth-features">
            <div>
              <span>01</span>
              <p><strong>Upload your notes</strong><small>Images, PDFs, and written documents.</small></p>
            </div>
            <div>
              <span>02</span>
              <p><strong>Choose how to learn</strong><small>Diagrams, concept maps, or playable worlds.</small></p>
            </div>
            <div>
              <span>03</span>
              <p><strong>Keep your progress</strong><small>Build a streak and revisit past material.</small></p>
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-heading">
            <div className="auth-step">{isRegistering ? 'Start learning' : 'Continue learning'}</div>
            <h2>{isRegistering ? 'Create your account' : 'Welcome back'}</h2>
            <p>
              {isRegistering
                ? 'Save your notes, activity, and progress in one place.'
                : 'Sign in to return to your notes and learning spaces.'}
            </p>
          </div>

          <div className="auth-mode-switch" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              role="tab"
              aria-selected={!isRegistering}
              className={!isRegistering ? 'active' : ''}
              onClick={() => switchMode('login')}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isRegistering}
              className={isRegistering ? 'active' : ''}
              onClick={() => switchMode('register')}
            >
              Create account
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="auth-email">Email address</label>
            <div className="auth-input-wrap">
              <Mail aria-hidden="true" />
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="player@example.com"
                autoComplete="email"
                spellCheck="false"
                disabled={isSubmitting}
                required
              />
            </div>

            <label htmlFor="auth-password">Password</label>
            <div className="auth-input-wrap">
              <LockKeyhole aria-hidden="true" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={isRegistering ? 'Minimum 8 characters' : 'Enter your password'}
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                disabled={isSubmitting}
                minLength={isRegistering ? 8 : undefined}
                required
              />
              <button
                className="auth-password-toggle"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {isRegistering && (
              <>
                <label htmlFor="auth-confirm-password">Confirm password</label>
                <div className="auth-input-wrap">
                  <ShieldCheck aria-hidden="true" />
                  <input
                    id="auth-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    minLength={8}
                    required
                  />
                </div>
              </>
            )}

            <div className="auth-error" role="alert" aria-live="polite">
              {errorMessage && <span>{errorMessage}</span>}
            </div>

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="auth-spinner" />
                  {isRegistering ? 'Creating account…' : 'Signing in…'}
                </>
              ) : (
                <>
                  {isRegistering ? 'Create account' : 'Sign in'}
                  <ArrowRight />
                </>
              )}
            </button>
          </form>

          <p className="auth-security"><ShieldCheck /> Your learning data stays connected to your account.</p>
        </div>
      </section>
    </main>
  );
}
