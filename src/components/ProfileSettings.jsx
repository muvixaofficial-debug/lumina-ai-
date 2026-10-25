import { useEffect, useState } from 'react';
import './ProfileSettings.css';

const PROFILE_KEY = 'lumina-profile';
const SETTINGS_KEY = 'lumina-settings';

const COLORS = [
  { name: 'Blue', value: '#3984ff' },
  { name: 'Pink', value: '#ed62b5' },
  { name: 'Orange', value: '#ff922e' },
  { name: 'Green', value: '#29b875' },
];

const DEFAULT_SETTINGS = {
  appearance: 'system',
  accent: '#3984ff',
  language: 'English',
  fontSize: 'medium',
  animations: true,
  enterToSend: true,
  voiceReplies: false,
  notifications: true,
};

function readStored(key, fallback) {
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(key) || '{}') };
  } catch {
    return { ...fallback };
  }
}

function readProfile() {
  return readStored('lumina-profile', {
    name: 'Suraj',
    email: '',
    photo: '',
  });
}

function applySettings(settings) {
  const root = document.documentElement;
  const accent = COLORS.some(c => c.value === settings.accent)
    ? settings.accent
    : DEFAULT_SETTINGS.accent;

  root.style.setProperty('--lumina-accent', accent);
  root.style.setProperty('--lumina-voice-color', accent);
  root.dataset.luminaAppearance = settings.appearance;
  root.dataset.theme = settings.appearance === 'system'
    ? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : settings.appearance;
  root.dataset.luminaAnimations = settings.animations === false ? 'off' : 'on';
  root.dataset.luminaFontSize = settings.fontSize || 'medium';
}

export default function ProfileSettings({ onBack, onOpenSettings, onLogout }) {
  const [profile, setProfile] = useState(readProfile);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState(() => readStored(SETTINGS_KEY, DEFAULT_SETTINGS));

  useEffect(() => {
    applySettings(settings);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      setMessage('सेटिंग सेव नहीं हो पाई।');
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      setMessage('फोटो सेव नहीं हो पाई। छोटी फोटो चुनकर फिर कोशिश करें।');
    }
  }, [profile]);

  useEffect(() => {
    if (settings.appearance !== 'system') return;
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return;
    const updateSystemTheme = () => applySettings(settings);
    media.addEventListener?.('change', updateSystemTheme);
    return () => media.removeEventListener?.('change', updateSystemTheme);
  }, [settings]);

  function updateProfile(field, value) {
    setProfile(current => ({ ...current, [field]: value }));
    setMessage('');
  }

  function choosePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('कृपया सही इमेज फ़ाइल चुनें।');
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setMessage('1.5 MB से छोटी फोटो चुनें।');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') updateProfile('photo', reader.result);
    };
    reader.onerror = () => setMessage('फोटो पढ़ी नहीं जा सकी। दोबारा कोशिश करें।');
    reader.readAsDataURL(file);
  }

  function saveProfile(event) {
    event.preventDefault();
    const name = profile.name.trim();

    if (!name) {
      setMessage('अपना नाम लिखें।');
      return;
    }

    const next = { ...profile, name };
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      setProfile(next);
      setEditing(false);
      setMessage('प्रोफाइल इस डिवाइस पर सेव हो गई।');
    } catch {
      setMessage('सेव नहीं हुआ। छोटी फोटो चुनकर फिर कोशिश करें।');
    }
  }

  function changeSetting(key, value) {
    setSettings(current => ({ ...current, [key]: value }));
    setMessage('आपकी सेटिंग सेव हो गई।');
  }

  function signOut() {
    if (!window.confirm('क्या आप इस डिवाइस से साइन आउट करना चाहते हैं?')) return;
    if (typeof onLogout === 'function') onLogout();
    else setMessage('साइन आउट के लिए सुरक्षित लॉगिन सेवा जोड़ना बाकी है।');
  }

  return (
    <main className="lumina-profile-page">
      <header className="lumina-profile-header">
        <button
          type="button"
          className="lumina-profile-back"
          onClick={onBack}
          aria-label="Back"
        >
          <span aria-hidden="true">←</span> Back
        </button>
        <div className="lumina-profile-heading">
          <p className="lumina-profile-eyebrow">LUMINA AI</p>
          <h1>Profile &amp; Settings</h1>
        </div>
      </header>

      <section className="lumina-profile-card">
        <div className="lumina-profile-avatar">
          {profile.photo
            ? <img src={profile.photo} alt="Profile" />
            : <span>{(profile.name || 'S').trim().charAt(0).toUpperCase()}</span>}
        </div>
        <h2>{profile.name || 'Your name'}</h2>
        <p>{profile.email || 'Email not added'}</p>
        <button
          type="button"
          className="lumina-profile-primary"
          onClick={() => { setEditing(value => !value); setMessage(''); }}
        >
          {editing ? 'Close Edit Profile' : 'Edit Profile'}
        </button>
      </section>

      {editing && (
        <form className="lumina-profile-section" onSubmit={saveProfile}>
          <h2>Edit Profile</h2>
          <label>
            Name
            <input
              value={profile.name}
              maxLength={60}
              onChange={event => updateProfile('name', event.target.value)}
              placeholder="Enter your name"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={profile.email}
              maxLength={150}
              onChange={event => updateProfile('email', event.target.value)}
              placeholder="Enter your email"
            />
          </label>
          <label>
            Profile photo
            <input type="file" accept="image/*" onChange={choosePhoto} />
          </label>
          <div className="lumina-profile-actions">
            <button type="submit" className="lumina-profile-primary">Save Profile</button>
            <button
              type="button"
              className="lumina-profile-secondary"
              onClick={() => {
                setProfile(readProfile());
                setEditing(false);
                setMessage('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <section className="lumina-profile-section">
        <h2>Appearance</h2>
        <p className="lumina-profile-description">Choose how Lumina AI looks. Changes are saved on this device.</p>

        <label htmlFor="lumina-profile-theme">Theme</label>
        <select
          id="lumina-profile-theme"
          className="lumina-profile-select"
          value={settings.appearance}
          onChange={event => changeSetting('appearance', event.target.value)}
        >
          <option value="system">System Default</option>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>

        <h3 className="lumina-profile-subtitle">Accent Color</h3>
        <div className="lumina-profile-colors" aria-label="Accent color choices">
          {COLORS.map(color => (
            <button
              key={color.value}
              type="button"
              className={`lumina-profile-color ${settings.accent === color.value ? 'is-selected' : ''}`}
              onClick={() => changeSetting('accent', color.value)}
              aria-pressed={settings.accent === color.value}
              title={color.name}
            >
              <span className="lumina-profile-swatch" style={{ background: color.value }} />
              <span>{color.name}</span>
              {settings.accent === color.value && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      </section>

      <section className="lumina-profile-section">
        <h2>Account Settings</h2>
        <button
          type="button"
          className="lumina-profile-row"
          onClick={typeof onOpenSettings === 'function' ? onOpenSettings : undefined}
        >
          <span>
            <strong>More app settings</strong>
            <small>Language, text size and preferences</small>
          </span>
          <span aria-hidden="true">›</span>
        </button>
        <div className="lumina-profile-row lumina-profile-static">
          <span>
            <strong>Password &amp; Security</strong>
            <small>A secure account service still needs to be connected.</small>
          </span>
        </div>
        <button type="button" className="lumina-profile-row lumina-profile-logout" onClick={signOut}>
          <span>
            <strong>Sign Out</strong>
            <small>Requires the app login system to be connected.</small>
          </span>
          <span aria-hidden="true">↗</span>
        </button>
      </section>

      {message && <p className="lumina-profile-message" role="status">{message}</p>}
      <p className="lumina-profile-note">
        Profile and appearance preferences are stored on this device. Account syncing and secure sign-in still require a backend service.
      </p>
    </main>
  );
}
