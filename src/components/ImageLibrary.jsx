import React, { useEffect, useState } from "react";
import {
  getSavedImages,
  deleteSavedImage
} from "../lib/imageLibrary";
import "./ImageLibrary.css";

export default function ImageLibrary({
  onBack,
  onEditImage,
  onUseImage
}) {
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");

  function refresh() {
    try {
      setImages(getSavedImages() || []);
    } catch {
      setImages([]);
      setMessage("Image Library लोड नहीं हो सकी।");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function downloadImage(image) {
    try {
      const response = await fetch(image.imageUrl);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `lumina-image-${image.id || Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      setMessage("इमेज डाउनलोड शुरू हो गया।");
    } catch {
      if (image.imageUrl) {
        window.open(image.imageUrl, "_blank", "noopener,noreferrer");
        setMessage("इमेज नई टैब में खोल दी गई। वहाँ से सेव कर सकते हो।");
      } else {
        setMessage("इस इमेज का डाउनलोड उपलब्ध नहीं है।");
      }
    }
  }

  async function shareImage(image) {
    try {
      if (navigator.share) {
        await navigator.share({
          title: image.title || "Lumina AI Image",
          text: image.prompt || "Lumina AI से बनाई गई इमेज",
          url: image.imageUrl
        });
      } else {
        setMessage("इस फोन पर शेयर विकल्प उपलब्ध नहीं है। इमेज डाउनलोड कर सकते हो।");
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        setMessage("इमेज शेयर नहीं हो सकी।");
      }
    }
  }

  function removeImage(image) {
    if (!window.confirm("क्या इस इमेज को Image Library से हटाना है?")) return;
    try {
      deleteSavedImage(image.id);
      setSelected(null);
      refresh();
      setMessage("इमेज Library से हटा दी गई।");
    } catch {
      setMessage("इमेज हटाई नहीं जा सकी।");
    }
  }

  function useImage(image) {
    if (typeof onUseImage === "function") {
      onUseImage(image);
    } else {
      setMessage("दोबारा इस्तेमाल करने के लिए इसे मुख्य चैट से जोड़ना बाकी है।");
    }
  }

  function editImage(image) {
    if (typeof onEditImage === "function") {
      onEditImage(image);
    } else {
      setMessage("Image Editor को मुख्य ऐप से जोड़ना बाकी है।");
    }
  }

  function formatDate(value) {
    if (!value) return "तारीख उपलब्ध नहीं";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "तारीख उपलब्ध नहीं"
      : date.toLocaleString("hi-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
  }

  return (
    <section className="lumina-library">
      <header className="ll-header">
        {onBack && (
          <button type="button" className="ll-back" onClick={onBack}>
            ← वापस
          </button>
        )}
        <div className="ll-eyebrow">LUMINA AI · YOUR CREATIONS</div>
        <h2>Image Library</h2>
        <p>तुम्हारी सेव की गई इमेज और उनके prompts।</p>
        <div className="ll-count">{images.length} इमेज सेव हैं</div>
      </header>

      {message && (
        <div className="ll-message" role="status">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage("")}>×</button>
        </div>
      )}

      {images.length === 0 ? (
        <div className="ll-empty">
          <div className="ll-empty-icon">▧</div>
          <h3>अभी कोई इमेज नहीं है</h3>
          <p>AI से बनाई गई इमेज सेव होने पर यहाँ दिखाई देंगी।</p>
        </div>
      ) : (
        <div className="ll-grid">
          {images.map((image) => (
            <article className="ll-card" key={image.id}>
              <button
                type="button"
                className="ll-preview"
                onClick={() => setSelected(image)}
                aria-label="इमेज खोलें"
              >
                {image.imageUrl ? (
                  <img src={image.imageUrl} alt={image.title || "Saved AI image"} loading="lazy" />
                ) : (
                  <span>इमेज उपलब्ध नहीं</span>
                )}
              </button>

              <div className="ll-card-info">
                <strong>{image.title || "Lumina AI Image"}</strong>
                <time>{formatDate(image.createdAt)}</time>
                <p>{image.prompt || "इस इमेज का prompt सेव नहीं है।"}</p>
                <div className="ll-actions">
                  <button type="button" onClick={() => downloadImage(image)}>↓ डाउनलोड</button>
                  <button type="button" onClick={() => shareImage(image)}>शेयर</button>
                  <button type="button" onClick={() => useImage(image)}>फिर इस्तेमाल</button>
                  <button type="button" onClick={() => editImage(image)}>एडिट</button>
                  <button type="button" className="ll-delete" onClick={() => removeImage(image)}>हटाएँ</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {selected && (
        <div className="ll-modal" role="dialog" aria-modal="true" aria-label="इमेज प्रीव्यू">
          <div className="ll-modal-content">
            <button
              type="button"
              className="ll-close"
              onClick={() => setSelected(null)}
              aria-label="बंद करें"
            >×</button>
            {selected.imageUrl && (
              <img src={selected.imageUrl} alt={selected.title || "Image preview"} />
            )}
            <h3>{selected.title || "Lumina AI Image"}</h3>
            <p>{selected.prompt || "Prompt उपलब्ध नहीं है।"}</p>
            <time>{formatDate(selected.createdAt)}</time>
            <div className="ll-actions">
              <button type="button" onClick={() => downloadImage(selected)}>डाउनलोड</button>
              <button type="button" onClick={() => shareImage(selected)}>शेयर</button>
              <button type="button" onClick={() => useImage(selected)}>फिर इस्तेमाल</button>
              <button type="button" onClick={() => editImage(selected)}>एडिट</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
