import React, { useState } from "react";
import { CODING_MODES, buildCodingRequest } from "../lib/codingAssistant";
import "./SpecialCodingAI.css";

export default function SpecialCodingAI({ onSubmit, onBack }) {
  const modes = Object.entries(CODING_MODES);
  const [mode, setMode] = useState(modes[0]?.[0] || "");
  const [request, setRequest] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);

  const selectedMode = CODING_MODES[mode];
  const modeName = (value) => {
    const item = CODING_MODES[value];
    if (typeof item === "string") return item;
    return item?.label || item?.title || item?.name || value.replace(/([A-Z])/g, " $1");
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (!request.trim()) {
      setResult("पहले बताओ कि तुम्हें क्या बनाना या ठीक करना है।");
      return;
    }

    setBusy(true);
    setResult("");

    try {
      const payload = buildCodingRequest({
        mode,
        request: request.trim(),
        code: code.trim(),
        error: error.trim()
      });

      if (typeof onSubmit === "function") {
        await onSubmit(payload);
      } else {
        setResult(
          "तुम्हारा अनुरोध तैयार है। AI से जवाब पाने के लिए इस स्क्रीन को मुख्य ऐप के AI चैट सिस्टम से जोड़ना बाकी है।"
        );
      }
    } catch (e) {
      setResult("अनुरोध तैयार नहीं हो सका। जानकारी जाँचकर दोबारा कोशिश करो।");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="lumina-coding" aria-label="Special Coding AI">
      <header className="lumina-coding-head">
        {onBack && (
          <button className="lc-back" type="button" onClick={onBack}>
            ← वापस
          </button>
        )}
        <div className="lc-eyebrow">LUMINA AI · DEVELOPER TOOLS</div>
        <h2>Special Coding AI</h2>
        <p>कोड समझो, ऐप बनाओ और errors ठीक करने में मदद लो।</p>
      </header>

      <div className="lc-modes">
        {modes.map(([key]) => (
          <button
            key={key}
            type="button"
            className={`lc-mode ${mode === key ? "active" : ""}`}
            onClick={() => {
              setMode(key);
              setResult("");
            }}
            aria-pressed={mode === key}
          >
            <span className="lc-mode-icon">
              {({
                explainCode: "📖",
                buildApp: "📱",
                fixErrors: "🛠️",
                improveCode: "⚡",
                testCode: "🧪",
                stepByStepBuilder: "🧩"
              })[key] || "💻"}
            </span>
            <span>{modeName(key)}</span>
          </button>
        ))}
      </div>

      <form className="lc-form" onSubmit={handleSubmit}>
        <div className="lc-selected">
          <strong>{modeName(mode)}</strong>
          <span>अपना काम नीचे लिखो</span>
        </div>

        <label htmlFor="lc-request">तुम्हें क्या करवाना है?</label>
        <textarea
          id="lc-request"
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          placeholder="जैसे: React में एक login page बनाओ..."
          rows={3}
          required
        />

        <label htmlFor="lc-code">कोड (अगर उपलब्ध है)</label>
        <textarea
          id="lc-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="अपना code यहाँ डालो..."
          rows={5}
          spellCheck={false}
        />

        <label htmlFor="lc-error">Error message (अगर है)</label>
        <textarea
          id="lc-error"
          value={error}
          onChange={(e) => setError(e.target.value)}
          placeholder="Terminal या स्क्रीन पर दिखने वाला error..."
          rows={2}
          spellCheck={false}
        />

        <button className="lc-submit" type="submit" disabled={busy}>
          {busy ? "तैयार हो रहा है..." : "काम शुरू करो →"}
        </button>

        {result && (
          <p className="lc-result" role="status">
            {result}
          </p>
        )}
      </form>

      <p className="lc-note">
        ध्यान दें: AI से वास्तविक जवाब पाने के लिए मुख्य ऐप का AI connection जोड़ना आवश्यक है।
      </p>
    </section>
  );
}
