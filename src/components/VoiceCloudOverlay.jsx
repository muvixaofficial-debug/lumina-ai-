import React from 'react';

export default function VoiceCloudOverlay({
  cloudCompact,
  cloudBoost,
  setCloudCompact,
  setCloudBoost,
  cloudTouchY,
  voiceInput,
  Icon,
}) {
  return (
    <div
      className={'lumina-cloud-overlay ' + (cloudCompact ? 'compact' : '')}
      aria-live="polite"
    >
      <div
        className="lumina-cloud-stage"
        onTouchStart={e => {
          cloudTouchY.current = e.touches[0].clientY;
        }}
        onTouchEnd={e => {
          const dy = e.changedTouches[0].clientY - cloudTouchY.current;
          if (dy > 55) setCloudCompact(true);
          else if (dy < -55) setCloudCompact(false);
        }}
      >
        <div
          className={'lumina-cloud-orb ' + (cloudBoost ? 'boost' : '')}
          role="button"
          tabIndex="0"
          aria-label="Lumina cloud; touch to animate"
          onClick={() => {
            setCloudBoost(true);
            setTimeout(() => setCloudBoost(false), 1100);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setCloudBoost(true);
              setTimeout(() => setCloudBoost(false), 1100);
            }
          }}
        >
          <span></span><i></i><b></b><em></em><strong></strong>
        </div>
        <div className="lumina-cloud-ring ring-one"></div>
        <div className="lumina-cloud-ring ring-two"></div>
      </div>
      <p>Lumina सुन रहा है…</p>
      <button
        type="button"
        className="lumina-cloud-mic-stop"
        aria-label="आवाज़ बंद करें"
        onClick={voiceInput}
      >
        <Icon name="mic" size={25} />
      </button>
    </div>
  );
}

