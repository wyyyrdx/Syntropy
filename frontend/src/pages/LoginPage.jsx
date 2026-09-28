import React, { useState } from 'react';
import {
  ArrowRight,
  Atom,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles
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
      <div className="auth-grid" aria-hidden="true" />
      <div className="auth-scanline" aria-hidden="true" />

      <section className="auth-shell">
        <div className="auth-brand-panel">
          <div className="auth-status">
            <span className="auth-status-dot" />
            SYSTEM ONLINE
          </div>

          <div className="auth-emblem" aria-hidden="true">
            <Atom />
            <span />
          </div>

          <div>
            <div className="auth-kicker">// COGNITIVE REALM ENGINE</div>
            <h1 className="auth-title">SYNTROPY</h1>
            <p className="auth-lead">
              Turn your notes into explorable worlds, connected concepts, and active-recall missions.
            </p>
          </div>

          <div className="auth-features">
            <div>
              <Sparkles />
              <span>AI NOTE ANALYSIS</span>
            </div>
            <div>
              <ShieldCheck />
              <span>PRIVATE LEARNING SESSION</span>
            </div>
            <div>
              <Atom />
              <span>INTERACTIVE REALMS</span>
            </div>
          </div>

          <div className="auth-build">SYNTROPY.OS // BUILD 1.0</div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-heading">
            <div className="auth-step">{isRegistering ? 'NEW PLAYER REGISTRATION' : 'PLAYER AUTHENTICATION'}</div>
            <h2>{isRegistering ? 'CREATE ACCOUNT' : 'WELCOME BACK'}</h2>
            <p>
              {isRegistering
                ? 'Create your access key and begin exploring.'
                : 'Enter your access credentials to resume your learning world.'}
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
              SIGN IN
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isRegistering}
              className={isRegistering ? 'active' : ''}
              onClick={() => switchMode('register')}
            >
              CREATE ACCOUNT
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="auth-email">EMAIL ADDRESS</label>
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

            <label htmlFor="auth-password">PASSWORD</label>
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
                <label htmlFor="auth-confirm-password">CONFIRM PASSWORD</label>
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
              {errorMessage && <span>[ ACCESS DENIED ] {errorMessage}</span>}
            </div>

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="auth-spinner" />
                  {isRegistering ? 'CREATING ACCOUNT...' : 'AUTHENTICATING...'}
                </>
              ) : (
                <>
                  {isRegistering ? 'CREATE ACCESS KEY' : 'ENTER SYNTROPY'}
                  <ArrowRight />
                </>
              )}
            </button>
          </form>

          <p className="auth-security">
            <LockKeyhole />
            ENCRYPTED SESSION // JWT ACCESS
          </p>
        </div>
      </section>
    </main>
  );
}
