import { useEffect, useState } from 'react';
import './ProfileSettings.css';

const PROFILE_KEY = 'lumina-profile';

function readProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
    return {
      name: typeof saved.name === 'string' ? saved.name : 'Suraj',
      email: typeof saved.email === 'string' ? saved.email : '',
      photo: typeof saved.photo === 'string' ? saved.photo : ''
    };
  } catch {
    return { name: 'Suraj', email: '', photo: '' };
  }
}

export default function ProfileSettings({ onBack, onOpenSettings, onLogout }) {
  const [profile, setProfile] = useState(readProfile);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      setMessage('फोटो सेव नहीं हो पाई। छोटी फोटो चुनकर फिर कोशिश करें।');
    }
  }, [profile]);

  function update(field, value) {
    setProfile(current => ({ ...current, [field]: value }));
    setMessage('');
  }

  function choosePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('कृपया फोटो फ़ाइल चुनें।');
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setMessage('1.5 MB से छोटी फोटो चुनें।');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') update('photo', reader.result);
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
    setProfile(next);
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      setEditing(false);
      setMessage('प्रोफाइल इस डिवाइस पर सेव हो गई।');
    } catch {
      setMessage('सेव नहीं हुआ। छोटी फोटो चुनकर फिर कोशिश करें।');
    }
  }

  function signOut() {
    if (!window.confirm('क्या आप इस डिवाइस से साइन आउट करना चाहते हैं?')) return;
    if (typeof onLogout === 'function') onLogout();
    else setMessage('साइन आउट अभी ऐप के लॉगिन सिस्टम से जुड़ा नहीं है।');
  }

  return (
    <main className="lumina-profile-page">
      <header className="lumina-profile-header">
        <button type="button" className="lumina-profile-back" onClick={onBack}>← वापस</button>
        <div>
          <p className="lumina-profile-eyebrow">LUMINA AI</p>
          <h1>प्रोफाइल सेटिंग्स</h1>
        </div>
      </header>

      <section className="lumina-profile-card">
        <div className="lumina-profile-avatar">
          {profile.photo
            ? <img src={profile.photo} alt="प्रोफाइल फोटो" />
            : <span>{(profile.name || 'S').trim().charAt(0).toUpperCase()}</span>}
        </div>
        <h2>{profile.name || 'अपना नाम लिखें'}</h2>
        <p>{profile.email || 'ईमेल अभी नहीं जोड़ा गया'}</p>
        <button type="button" className="lumina-profile-primary" onClick={() => { setEditing(v => !v); setMessage(''); }}>
          {editing ? 'एडिट बंद करें' : 'प्रोफाइल एडिट करें'}
        </button>
      </section>

      {editing && (
        <form className="lumina-profile-section" onSubmit={saveProfile}>
          <h2>अपनी जानकारी बदलें</h2>
          <label>
            नाम
            <input value={profile.name} maxLength={60} onChange={e => update('name', e.target.value)} placeholder="अपना नाम लिखें" />
          </label>
          <label>
            ईमेल
            <input type="email" value={profile.email} maxLength={150} onChange={e => update('email', e.target.value)} placeholder="आपका ईमेल" />
          </label>
          <label>
            प्रोफाइल फोटो
            <input type="file" accept="image/*" onChange={choosePhoto} />
          </label>
          <div className="lumina-profile-actions">
            <button type="submit" className="lumina-profile-primary">सेव करें</button>
            <button type="button" className="lumina-profile-secondary" onClick={() => { setProfile(readProfile()); setEditing(false); setMessage(''); }}>रद्द करें</button>
          </div>
        </form>
      )}

      <section className="lumina-profile-section">
        <h2>अकाउंट सेटिंग्स</h2>
        <button type="button" className="lumina-profile-row" onClick={onOpenSettings}>
          <span><strong>ऐप सेटिंग्स</strong><small>थीम और ऐप की प्राथमिकताएँ</small></span>
          <span aria-hidden="true">›</span>
        </button>
        <div className="lumina-profile-row lumina-profile-static">
          <span><strong>पासवर्ड और सुरक्षा</strong><small>पासवर्ड बदलने के लिए सुरक्षित लॉगिन सेवा जोड़ना बाकी है।</small></span>
        </div>
        <button type="button" className="lumina-profile-row lumina-profile-logout" onClick={signOut}>
          <span><strong>साइन आउट</strong><small>लॉगिन सिस्टम जुड़ने पर पूरा काम करेगा।</small></span>
          <span aria-hidden="true">↗</span>
        </button>
      </section>

      {message && <p className="lumina-profile-message" role="status">{message}</p>}
      <p className="lumina-profile-note">यह प्रोफाइल जानकारी अभी इसी डिवाइस में सेव होती है। अकाउंट सिंक और पासवर्ड सुरक्षा के लिए बैकएंड जोड़ना बाकी है।</p>
    </main>
  );
}
