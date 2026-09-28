import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookOpenCheck,
  Brain,
  CalendarDays,
  FileText,
  Flame,
  RefreshCw,
  Upload
} from 'lucide-react';
import { api } from '../api';

function buildActivityWeeks(activity) {
  const counts = new Map(activity.map((item) => [item.activity_date, item.activity_count]));
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - 364 - start.getUTCDay());

  const weeks = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    const week = [];
    for (let day = 0; day < 7; day += 1) {
      const date = cursor.toISOString().slice(0, 10);
      const count = counts.get(date) || 0;
      week.push({ date, count, future: cursor > today });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    weeks.push(week);
  }
  return weeks.slice(-53);
}

function activityLevel(count) {
  if (count >= 7) return 4;
  if (count >= 4) return 3;
  if (count >= 2) return 2;
  if (count >= 1) return 1;
  return 0;
}

function formatFileSize(bytes) {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(`${value.replace(' ', 'T')}Z`));
}

export default function ProfilePage({ sessionUser, playerStats, onNavigateSpace, onProfileLoaded }) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await api.getProfile();
      setProfile(data);
      onProfileLoaded?.(data.progress);
    } catch (error) {
      setErrorMessage(error.message || 'Could not load your profile.');
    } finally {
      setIsLoading(false);
    }
  }, [onProfileLoaded]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const weeks = useMemo(() => buildActivityWeeks(profile?.activity || []), [profile?.activity]);
  const user = profile?.user || sessionUser;
  const displayName = user?.display_name || user?.email?.split('@')[0] || 'Learner';
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const stats = profile?.stats || {
    notes: 0,
    generated: 0,
    quizzes: playerStats.completedQuizzes?.length || 0,
    streak: 0
  };
  const progress = profile?.progress || playerStats;
  const progressPercent = ((progress.xp || 0) % 200) / 2;

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="profile-avatar" aria-hidden="true">{initials || 'S'}</div>
        <div className="profile-identity">
          <p>Your profile</p>
          <h2>{displayName}</h2>
          <span>{user?.email}</span>
        </div>
        <button className="profile-upload-button" onClick={() => onNavigateSpace('upload')}>
          <Upload />
          Upload notes
        </button>
      </header>

      {errorMessage && (
        <div className="profile-error" role="alert">
          <span>{errorMessage}</span>
          <button onClick={loadProfile}><RefreshCw /> Try again</button>
        </div>
      )}

      <section className="profile-stat-grid" aria-label="Learning overview">
        <article>
          <FileText />
          <div><strong>{stats.notes}</strong><span>Notes uploaded</span></div>
        </article>
        <article>
          <Brain />
          <div><strong>{stats.generated}</strong><span>Learning spaces</span></div>
        </article>
        <article>
          <BookOpenCheck />
          <div><strong>{stats.quizzes}</strong><span>Quizzes completed</span></div>
        </article>
        <article>
          <Flame />
          <div><strong>{stats.streak}</strong><span>Day streak</span></div>
        </article>
      </section>

      <div className="profile-main-grid">
        <section className="profile-card profile-activity-card">
          <div className="profile-card-heading">
            <div>
              <p>Study activity</p>
              <h3>Your last year</h3>
            </div>
            <div className="profile-streak"><Flame /> {stats.streak} day streak</div>
          </div>

          <div className="profile-heatmap-scroll">
            <div className="profile-heatmap" aria-label="Study activity over the last year">
              {weeks.map((week, weekIndex) => (
                <div className="profile-heatmap-week" key={weekIndex}>
                  {week.map((day) => (
                    <span
                      key={day.date}
                      className={`profile-heatmap-day level-${activityLevel(day.count)} ${day.future ? 'future' : ''}`}
                      title={`${day.date}: ${day.count} learning ${day.count === 1 ? 'action' : 'actions'}`}
                      aria-label={`${day.date}: ${day.count} learning actions`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="profile-heatmap-footer">
            <span><CalendarDays /> Uploads, generations, and quizzes count as activity.</span>
            <div className="profile-legend">
              Less
              {[0, 1, 2, 3, 4].map((level) => <i key={level} className={`level-${level}`} />)}
              More
            </div>
          </div>
        </section>

        <aside className="profile-card profile-level-card">
          <p>Current level</p>
          <div className="profile-level-number">{progress.level || 1}</div>
          <strong>{progress.xp || 0} XP</strong>
          <div className="profile-progress-track">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <small>{200 - ((progress.xp || 0) % 200)} XP to the next level</small>
        </aside>
      </div>

      <section className="profile-card profile-notes-card">
        <div className="profile-card-heading">
          <div>
            <p>Library</p>
            <h3>Your notes</h3>
          </div>
          <span>{profile?.notes?.length || 0} saved</span>
        </div>

        {isLoading ? (
          <div className="profile-empty">Loading your learning history…</div>
        ) : profile?.notes?.length ? (
          <div className="profile-notes-list">
            {profile.notes.map((note) => (
              <article key={note.id}>
                <div className="profile-note-icon"><FileText /></div>
                <div className="profile-note-copy">
                  <strong>{note.filename}</strong>
                  <span>{formatDate(note.created_at)} · {formatFileSize(note.file_size)}</span>
                </div>
                <div className="profile-note-status">
                  {note.last_mode && <span>{note.last_mode === 'world' ? '2D world' : note.last_mode}</span>}
                  <small>{note.generation_status || note.status}</small>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="profile-empty">
            <FileText />
            <strong>No notes yet</strong>
            <span>Upload your first page to start building your learning history.</span>
            <button onClick={() => onNavigateSpace('upload')}>Upload notes</button>
          </div>
        )}
      </section>
    </div>
  );
}
