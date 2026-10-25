import { useState } from 'react';

export default function ImageGenerator({
  imageUploadRef,
  generatedImageResultRef,
  imageLoading,
  imageProgress,
  generatedImage,
  selectedImage,
  setSelectedImage,
  selectedImageName,
  setSelectedImageName,
  imagePrompt,
  setImagePrompt,
  generateImage,
  setNotice,
}) {
  const [imageStyle, setImageStyle] = useState('Anime');
  const [imageRatio, setImageRatio] = useState('Portrait 9:16');
  const [showPrompt, setShowPrompt] = useState(false);

  const buildPrompt = () => {
    const base = imagePrompt.trim();
    if (!base) return '';
    return `${base}\nVisual style: ${imageStyle}. Preferred aspect ratio: ${imageRatio}.`;
  };

  return (
<section className="image-generator">
    <h2>🖼️ Image Generation</h2>
    <p>आप कैसी तस्वीर बनाना चाहते हैं?</p>
    <input
      ref={imageUploadRef}
      type="file"
      accept="image/png,image/jpeg,image/webp"
      hidden
      onChange={e => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
          setNotice('फोटो 5 MB से छोटी चुनें।');
          e.target.value = '';
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          setSelectedImage(String(reader.result || ''));
          setShowPrompt(false);
          setSelectedImageName(file.name);
          setNotice('');
        };
        reader.onerror = () => setNotice('फोटो पढ़ी नहीं जा सकी। दूसरी फोटो चुनें।');
        reader.readAsDataURL(file);
      }}
    />
    
    {selectedImage && <div className="image-selected-preview" style={{margin:'12px 0',textAlign:'center'}}>
      <img src={selectedImage} alt="अपलोड की गई फोटो" style={{maxWidth:'100%',maxHeight:220,borderRadius:14}} />
      <p>{selectedImageName}</p>
      <button type="button" onClick={() => {
        setSelectedImage('');
        setSelectedImageName('');
        if (imageUploadRef.current) imageUploadRef.current.value='';
      }}>फोटो हटाएँ</button>
    </div>}
    {selectedImage && !showPrompt && (
      <button
        type="button"
        className="next-image-step"
        onClick={() => setShowPrompt(true)}
      >
        Next →
      </button>
    )}
    {(!selectedImage || showPrompt) && (
    <textarea
      value={imagePrompt}
      onChange={e => setImagePrompt(e.target.value)}
      placeholder="Ask Lumina AI — अपना prompt लिखें..."
      maxLength={1800}
      rows={3}
      aria-label="तस्वीर का विवरण"
    />
    )}

    <label style={{display:'block',marginTop:12,fontWeight:600}}>
      🎨 तस्वीर की स्टाइल
      <select
        value={imageStyle}
        onChange={e => setImageStyle(e.target.value)}
        style={{display:'block',width:'100%',marginTop:6,padding:12,borderRadius:10}}
      >
        <option>Anime</option>
        <option>Photorealistic</option>
        <option>Watercolor</option>
        <option>Digital art</option>
        <option>3D render</option>
        <option>Pixel art</option>
      </select>
    </label>

    <label style={{display:'block',marginTop:12,fontWeight:600}}>
      📐 तस्वीर का आकार
      <select
        value={imageRatio}
        onChange={e => setImageRatio(e.target.value)}
        style={{display:'block',width:'100%',marginTop:6,padding:12,borderRadius:10}}
      >
        <option>Portrait 9:16</option>
        <option>Square 1:1</option>
        <option>Landscape 16:9</option>
        <option>Portrait 3:4</option>
      </select>
    </label>
    <p style={{fontSize:12,opacity:.75}}>
      चुना गया आकार AI के लिए निर्देश है; वास्तविक आकार सर्वर पर निर्भर करेगा।
    </p>

    <button
      type="button"
      className="image-generate-button"
      onClick={() => generateImage(buildPrompt())}
      disabled={imageLoading || !imagePrompt.trim()}
    >
      {imageLoading ? 'तस्वीर बन रही है…' : (selectedImage ? '✨ मेरी फोटो AI से एडिट करें' : '🎨 नई तस्वीर बनाएँ')}
    </button>
    {imageLoading && (
          <div className="image-generation-progress" style={{margin:'20px 0',padding:18,borderRadius:18,background:'rgba(130,100,255,0.10)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <strong>✨ Sketching it out…</strong><strong>{imageProgress}%</strong>
            </div>
            <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={imageProgress}
              style={{height:10,marginTop:14,borderRadius:99,background:'rgba(140,140,160,.25)',overflow:'hidden'}}>
              <div style={{width:imageProgress+'%',height:'100%',borderRadius:99,background:'linear-gradient(90deg,#8b5cf6,#38bdf8)',transition:'width .5s ease'}} />
            </div>
            <p>आपकी तस्वीर तैयार हो रही है। कृपया प्रतीक्षा करें…</p>
          </div>
        )}
    {generatedImage && (
      <div className="generated-image-result" ref={generatedImageResultRef} style={{scrollMarginTop: 20}}>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:12}}>
          <button type="button" onClick={async () => {
            try {
              if (navigator.share) {
                const r = await fetch(generatedImage);
                const blob = await r.blob();
                const file = new File([blob], 'lumina-ai-image.png', {type: blob.type || 'image/png'});
                if (!navigator.canShare || navigator.canShare({files:[file]})) {
                  await navigator.share({files:[file], title:'Lumina AI Image'});
                } else {
                  await navigator.share({title:'Lumina AI Image', url:generatedImage});
                }
              } else {
                await navigator.clipboard.writeText(generatedImage);
                setNotice('तस्वीर का लिंक कॉपी हो गया।');
              }
            } catch (e) {
              if (e.name !== 'AbortError') setNotice('Share नहीं हो पाया। Save बटन इस्तेमाल करें।');
            }
          }}>📤 Share</button>
          <button type="button" onClick={async () => {
            try {
              const r = await fetch(generatedImage);
              const blob = await r.blob();
              if (navigator.clipboard && window.ClipboardItem && navigator.clipboard.write) {
                await navigator.clipboard.write([new ClipboardItem({[blob.type || 'image/png']:blob})]);
                setNotice('तस्वीर कॉपी हो गई।');
              } else {
                await navigator.clipboard.writeText(generatedImage);
                setNotice('तस्वीर का लिंक कॉपी हो गया।');
              }
            } catch (e) {
              try {
                await navigator.clipboard.writeText(generatedImage);
                setNotice('तस्वीर का लिंक कॉपी हो गया।');
              } catch {
                setNotice('Copy नहीं हो पाया। Save बटन इस्तेमाल करें।');
              }
            }
          }}>📋 Copy</button>
          <a href={generatedImage} download="lumina-ai-image.png"
             onClick={async e => {
               if (generatedImage.startsWith('data:')) return;
               e.preventDefault();
               try {
                 const r = await fetch(generatedImage);
                 if (!r.ok) throw new Error('Download failed');
                 const blob = await r.blob();
                 const url = URL.createObjectURL(blob);
                 const a = document.createElement('a');
                 a.href = url;
                 a.download = 'lumina-ai-image.png';
                 document.body.appendChild(a);
                 a.click();
                 a.remove();
                 setTimeout(() => URL.revokeObjectURL(url), 1500);
               } catch {
                 window.open(generatedImage, '_blank', 'noopener');
                 setNotice('तस्वीर नए टैब में खुली है। वहाँ से डाउनलोड करें।');
               }
             }}
             style={{display:'inline-flex',alignItems:'center',padding:'8px 12px',borderRadius:10,textDecoration:'none'}}>
             ⬇️ Save / Download
          </a>
        </div>
        <img src={generatedImage} alt={imagePrompt || 'AI द्वारा बनाई गई तस्वीर'}
             style={{display:'block',maxWidth:'100%',height:'auto'}} />
      </div>
    )}
  </section>
  );
}

