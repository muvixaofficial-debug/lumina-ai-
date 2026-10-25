import { useEffect, useState } from 'react';

const COLORS = [
  { name: 'Blue', value: '#3984ff' },
  { name: 'Pink', value: '#ed62b5' },
  { name: 'Orange', value: '#ff922e' },
  { name: 'Green', value: '#29b875' },
];

const defaults = {
  appearance: 'dark',
  accent: '#3984ff',
  language: 'English',
  fontSize: 'medium',
  animations: true,
  enterToSend: true,
  voiceReplies: false,
  notifications: true,
};

function loadSettings() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem('lumina-settings') || '{}') };
  } catch {
    return defaults;
  }
}

export default function Settings() {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem('lumina-settings', JSON.stringify(settings));
    } catch {}
    const root = document.documentElement;
    root.style.setProperty('--lumina-accent', settings.accent);
    root.style.setProperty('--lumina-voice-color', settings.accent);
    root.dataset.luminaAppearance = settings.appearance;
    root.dataset.luminaAnimations = settings.animations ? 'on' : 'off';
    root.dataset.luminaFontSize = settings.fontSize;
    if (settings.appearance === 'dark' || settings.appearance === 'light') {
      root.dataset.theme = settings.appearance;
    } else {
      root.dataset.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
  }, [settings]);

  const update = (key, value) => setSettings(old => ({ ...old, [key]: value }));

  const panel = {
    border: '1px solid var(--viz-border, rgba(140,140,160,.25))',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    background: 'var(--viz-card, rgba(120,120,150,.06))',
  };
  const label = { display: 'block', fontWeight: 650, marginBottom: 10 };
  const select = {
    width: '100%', padding: '12px 10px', borderRadius: 10,
    border: '1px solid var(--viz-border, #8886)', background: 'var(--viz-panel, transparent)',
    color: 'inherit', fontSize: 16,
  };

  return (
    <section className="lumina-settings" style={{ width: '100%', maxWidth: 760, margin: '0 auto', padding: '12px 4px 28px', color: 'inherit' }}>
      <h2 style={{ fontSize: 26, margin: '8px 0 4px' }}>⚙️ Settings</h2>
      <p style={{ opacity: .72, marginTop: 0 }}>अपनी Lumina AI सेटिंग्स बदलें। बदलाव अपने-आप सेव होंगे।</p>

      <section style={panel}>
        <h3 style={{ marginTop: 0 }}>General</h3>
        <label style={label} htmlFor="lumina-appearance">Appearance</label>
        <select id="lumina-appearance" style={select} value={settings.appearance} onChange={e => update('appearance', e.target.value)}>
          <option value="system">System default</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>

        <label style={{ ...label, marginTop: 18 }}>Accent Color</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {COLORS.map(color => (
            <button key={color.value} type="button" onClick={() => update('accent', color.value)}
              aria-pressed={settings.accent === color.value} title={color.name}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 24,
                border: settings.accent === color.value ? '2px solid currentColor' : '1px solid var(--viz-border, #8886)',
                background: 'transparent', color: 'inherit', cursor: 'pointer', minHeight: 44 }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: color.value, display: 'inline-block' }} />
              {color.name}{settings.accent === color.value ? ' ✓' : ''}
            </button>
          ))}
        </div>

        <label style={{ ...label, marginTop: 18 }} htmlFor="lumina-language">Language</label>
        <select id="lumina-language" style={select} value={settings.language} onChange={e => update('language', e.target.value)}>
          <option>English</option><option>हिन्दी</option>
        </select>

        <label style={{ ...label, marginTop: 18 }} htmlFor="lumina-font-size">Font Size</label>
        <select id="lumina-font-size" style={select} value={settings.fontSize} onChange={e => update('fontSize', e.target.value)}>
          <option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option>
        </select>
      </section>

      <section style={panel}>
        <h3 style={{ marginTop: 0 }}>Chat & AI</h3>
        {[
          ['enterToSend', 'Enter से मैसेज भेजें'],
          ['voiceReplies', 'AI जवाब आवाज़ में सुनें'],
          ['animations', 'Animations चालू रखें'],
        ].map(([key, title]) => (
          <label key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 0' }}>
            <span>{title}</span>
            <input type="checkbox" checked={settings[key]} onChange={e => update(key, e.target.checked)} />
          </label>
        ))}
        <p style={{ fontSize: 13, opacity: .7 }}>ये प्राथमिकताएँ सेव होती हैं; संबंधित सुविधा ऐप में लागू होने पर ही उसका व्यवहार बदलेगा।</p>
      </section>

      <section style={panel}>
        <h3 style={{ marginTop: 0 }}>Notifications</h3>
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <span>Notifications चालू रखें</span>
          <input type="checkbox" checked={settings.notifications} onChange={e => update('notifications', e.target.checked)} />
        </label>
      </section>

      <section style={panel}>
        <h3 style={{ marginTop: 0 }}>Privacy & Account</h3>
        <p style={{ marginBottom: 6 }}>Profile, password और account deletion के लिए सुरक्षित account setup आवश्यक है।</p>
        <p style={{ fontSize: 13, opacity: .7, marginBottom: 0 }}>Firebase Authentication अभी अलग से configure करना होगा। यह स्क्रीन अपने-आप वास्तविक login या logout नहीं बनाती।</p>
      </section>

      <button type="button" onClick={() => setSettings(defaults)}
        style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid var(--viz-border, #8886)', background: 'transparent', color: 'inherit', minHeight: 44 }}>
        Reset settings
      </button>
      <p role="status" style={{ fontSize: 13, opacity: .7 }}>✓ आपकी प्राथमिकताएँ इस डिवाइस पर सेव होती हैं।</p>
    </section>
  );
}
