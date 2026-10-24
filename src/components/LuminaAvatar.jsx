import React, { useState } from 'react';
import './LuminaAvatar.css';

export default function LuminaAvatar() {
  const [gender, setGender] = useState('girl');
  const [outfit, setOutfit] = useState(0);
  const [expression, setExpression] = useState(0);
  const [color, setColor] = useState('#8b5cf6');
  const [speaking, setSpeaking] = useState(false);

  const outfits = ['Default', 'Casual', 'Royal'];
  const faces = ['😊', '😎', '😉'];

  return (
    <section className="lumina-avatar" style={{ '--avatar-color': color }}>
      <div className="lumina-avatar-controls">
        <button onClick={() => setGender('girl')} aria-pressed={gender === 'girl'}>👧 Girl</button>
        <button onClick={() => setGender('boy')} aria-pressed={gender === 'boy'}>👦 Boy</button>
        <label>
          Color
          <input aria-label="Avatar color" type="color" value={color}
            onChange={e => setColor(e.target.value)} />
        </label>
      </div>

      <div className={`lumina-avatar-stage ${speaking ? 'is-speaking' : ''}`}>
        <div className="lumina-avatar-glow" />
        <div className={`lumina-anime ${gender} outfit-${outfit}`}>
          <div className="anime-hair">
            <span className="hair-fringe" />
          </div>
          <div className="anime-face">
            <div className="anime-eyes">
              <span>{expression === 2 ? '⌒' : '●'}</span>
              <span>{expression === 2 ? '⌒' : '●'}</span>
            </div>
            <div className="anime-blush"><i /><i /></div>
            <div className="anime-mouth">{speaking ? '◡' : '﹀'}</div>
          </div>
          <div className="anime-neck" />
          <div className="anime-clothes">
            <span className="clothes-detail" />
          </div>
        </div>
        <div className="lumina-avatar-name">Lumina AI</div>
        <div className="lumina-avatar-status">
          {speaking ? 'Speaking…' : 'Ready to help'}
        </div>
      </div>

      <div className="lumina-avatar-controls">
        <label>
          Outfit
          <select value={outfit} onChange={e => setOutfit(Number(e.target.value))}>
            {outfits.map((name, i) => <option key={name} value={i}>{name}</option>)}
          </select>
        </label>
        <label>
          Expression
          <select value={expression} onChange={e => setExpression(Number(e.target.value))}>
            <option value={0}>Happy</option>
            <option value={1}>Cool</option>
            <option value={2}>Wink</option>
          </select>
        </label>
        <button onClick={() => setSpeaking(v => !v)}>
          {speaking ? 'Stop animation' : 'Preview speaking'}
        </button>
      </div>
      <p className="lumina-avatar-note">
        Avatar preview · Voice synchronization will be connected next.
      </p>
    </section>
  );
}
