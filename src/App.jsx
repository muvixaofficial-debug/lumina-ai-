import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './App.css';

const tools = [
  { id:'new', title:'New Chat', desc:'नई बातचीत', icon:'edit' },
  { id:'history', title:'Chat History', desc:'पुरानी बातचीत', icon:'history' },
  { id:'library', title:'Image Library', desc:'बनाई गई तस्वीरें', icon:'images' },
  { id:'image', title:'Image Generation', desc:'नई तस्वीर बनाएँ', icon:'image' },
  { id:'coding', title:'Coding', desc:'कोड लिखें और ठीक करें', icon:'code' },
  { id:'camera', title:'Camera', desc:'कैमरे से तस्वीर लें', icon:'camera' },
  { id:'files', title:'Photos & Files', desc:'फोटो और फाइल जोड़ें', icon:'paperclip' },
  { id:'study', title:'Study AI', desc:'सभी विषयों में पढ़ाई', icon:'study' },
];

function Icon({ name, size = 22, className = '' }) {
  const common = {
    width:size, height:size, viewBox:'0 0 24 24',
    fill:'none', stroke:'currentColor', strokeWidth:1.7,
    strokeLinecap:'round', strokeLinejoin:'round',
    className, 'aria-hidden':true
  };
  const paths = {
    menu:<><path d="M4 7h16M4 12h16M4 17h16"/></>,
    edit:<><path d="M12 20H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5"/><path d="m14 18 6.5-6.5a1.8 1.8 0 0 0-2.5-2.5L11.5 15.5 11 19z"/></>,
    history:<><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></>,
    images:<><rect x="3" y="4" width="15" height="15" rx="2"/><path d="m3 15 5-5 4 4 2-2 4 4"/><path d="M8 4v-1h12a2 2 0 0 1 2 2v12h-3"/><circle cx="13" cy="8" r="1"/></>,
    image:<><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></>,

    code:<><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/></>,
    camera:<><path d="M4 7h4l2-3h4l2 3h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="4"/></>,
    paperclip:<><path d="m8 12.5 6.7-6.7a3.2 3.2 0 0 1 4.5 4.5l-8.8 8.8a5 5 0 0 1-7.1-7.1l8.5-8.5"/><path d="m8 12.5 6.2-6.2"/></>,
    study:<><path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c4 3 8 3 12 0v-5M22 9v7"/></>,
    mic:<><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/></>,
    plus:<path d="M12 5v14M5 12h14"/>,
    close:<path d="m18 6-12 12M6 6l12 12"/>,
    send:<path d="M12 19V5m-7 7 7-7 7 7"/>,
    chevron:<path d="m9 18 6-6-6-6"/>,
    spark:<><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2z"/><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2z"/></>,
  };
  return <svg {...common}>{paths[name] || paths.spark}</svg>;
}

function Waveform() {
  return <span className="waveform" aria-hidden="true">
    {[9,16,23,14,20,10,17].map((h,i)=><i key={i} style={{height:h}} />)}
  </span>;
}

export default function App() {
  const [message,setMessage] = useState('');
  const [imagePrompt,setImagePrompt] = useState('');
  const [generatedImage,setGeneratedImage] = useState('');
  const [selectedImage,setSelectedImage] = useState('');
  const [selectedImageName,setSelectedImageName] = useState('');
  const imageUploadRef = useRef(null);
  const generatedImageResultRef = useRef(null);
  const [imageLoading,setImageLoading] = useState(false);
  const [imageProgress,setImageProgress] = useState(0);

  useEffect(() => {
    if (!imageLoading) {
      setImageProgress(generatedImage ? 100 : 0);
      return;
    }
    setImageProgress(1);
    const timer = setInterval(() => {
      setImageProgress(p => p >= 95 ? 95 : Math.min(95, p + Math.max(1, Math.ceil((95-p)/12))));
    }, 650);
    return () => clearInterval(timer);
  }, [imageLoading, generatedImage]);
  useEffect(() => {
    if (!generatedImage || imageLoading) return;
    const timer = setTimeout(() => {
      generatedImageResultRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [generatedImage, imageLoading]);

  const [activeMode,setActiveMode] = useState('chat');
  const [messages,setMessages] = useState([]);
  const [isLoading,setIsLoading] = useState(false);
  const [menu,setMenu] = useState(false);
  const [plus,setPlus] = useState(false);
  const [notice,setNotice] = useState('');
  const [listening,setListening] = useState(false);
  const [profileOpen,setProfileOpen] = useState(false);
  const [history,setHistory] = useState([]);
  const fileRef = useRef(null);
  const endRef = useRef(null);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'});},[messages,notice]);

  function newChat() {
    if(messages.length) setHistory(old=>[{id:Date.now(),messages:[...messages]},...old]);
    setMessages([]);
    setIsLoading(false);
    setMessage('');
    setNotice('');
    setMenu(false);
    setPlus(false);
    setProfileOpen(false);
  }

  async function sendMessage() {
    const text = message.trim();
    if (!text || isLoading) return;

    const previousHistory = messages
      .filter(m => (m.role === 'user' || m.role === 'assistant') && m.text)
      .slice(-12)
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        text: m.text
      }));

    setMessages(old => [...old, {role:'user', text, id:Date.now()}]);
    setMessage('');
    setNotice('');
    setPlus(false);
    setIsLoading(true);

    try {
      const response = await fetch(
        'https://muvixa-lumina-backend-8417.onrender.com/api/chat',
        {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({message:text, history:previousHistory, mode:activeMode})
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `सर्वर त्रुटि (${response.status})`);
      }

      if (typeof data.answer !== 'string' || !data.answer.trim()) {
        throw new Error('AI से जवाब नहीं मिला। कृपया दोबारा कोशिश करें।');
      }

      setMessages(old => [
        ...old,
        {role:'assistant', text:data.answer.trim(), id:Date.now()+1}
      ]);
    } catch (error) {
      const errorMessage = error.message || '';
      setNotice(
        error.name === 'TypeError'
          ? 'इंटरनेट या सर्वर से कनेक्शन नहीं हो पाया। थोड़ी देर बाद दोबारा कोशिश करें।'
          : /quota|request limit|RESOURCE_EXHAUSTED|429/i.test(errorMessage)
            ? 'Lumina AI की मुफ्त दैनिक AI सीमा पूरी हो गई है। Google की सीमा रीसेट होने पर दोबारा कोशिश करें।'
            : (errorMessage || 'AI से जवाब लेते समय समस्या हुई।')
      );
    } finally {
      setIsLoading(false);
    }
  }


  async function generateImage() {
    const prompt = imagePrompt.trim();
    if (!prompt || imageLoading) return;

    setImageLoading(true);
    setGeneratedImage('');
    setNotice('');

    try {
      const response = await fetch(
        'https://muvixa-lumina-backend-8417.onrender.com/api/image',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, image: selectedImage || undefined })
        }
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || `सर्वर त्रुटि (${response.status})`);
      }
      if (typeof data.image !== 'string' || !data.image.startsWith('data:image/')) {
        throw new Error('AI से तस्वीर नहीं मिली। कृपया दोबारा कोशिश करें।');
      }

      setGeneratedImage(data.image);
    } catch (error) {
      setNotice(error.name === 'TypeError'
        ? 'इंटरनेट या सर्वर से कनेक्शन नहीं हो पाया।'
        : (error.message || 'तस्वीर बनाते समय समस्या हुई।'));
    } finally {
      setImageLoading(false);
    }
  }

  function chooseTool(tool) {
    setMenu(false);
    setPlus(false);
    setProfileOpen(false);
    if (tool.id === 'new') return newChat();
    if (tool.id === 'history') {
      setNotice(history.length ? 'पुरानी बातचीत साइड मेनू में उपलब्ध है।' : 'अभी कोई पुरानी बातचीत सेव नहीं है।');
      setMenu(true);
      return;
    }
    if (['coding','study','image','library','camera','files'].includes(tool.id)) {
      setActiveMode(tool.id);
      if (tool.id === 'coding' || tool.id === 'study') {
        setNotice('');
        return;
      }
      if (tool.id === 'camera' || tool.id === 'files') {
        if (fileRef.current) {
          fileRef.current.setAttribute('accept','image/*,application/pdf,.txt,.doc,.docx');
          if (tool.id === 'camera') fileRef.current.setAttribute('capture','environment');
          else fileRef.current.removeAttribute('capture');
          fileRef.current.click();
        }
        return;
      }
      const notices = {
        image:'Image Generation चुना गया है, लेकिन तस्वीर बनाने की AI सेवा अभी कनेक्ट नहीं है।',
        library:'Image Library चुना गया है; लाइब्रेरी सेव करने की सुविधा अभी तैयार नहीं है।'
      };
      setNotice(notices[tool.id] || '');
      return;
    }
    setNotice(tool.title + ' सुविधा अभी जोड़ी जा रही है।');
  }

  function voiceInput() {
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR) {
      setNotice('इस Chrome ब्राउज़र में आवाज़ से लिखने की सुविधा उपलब्ध नहीं है। माइक्रोफ़ोन अनुमति जाँचें।');
      return;
    }
    const rec=new SR();
    rec.lang='hi-IN';
    rec.interimResults=false;
    rec.onstart=()=>setListening(true);
    rec.onend=()=>setListening(false);
    rec.onerror=()=>{setListening(false);setNotice('माइक्रोफ़ोन की अनुमति जाँचें।');};
    rec.onresult=e=>setMessage(old=>old+(old?' ':'')+e.results[0][0].transcript);
    rec.start();
  }

  function openHistory(item) {
    setMessages(item.messages);
    setNotice('');
    setMenu(false);
  }

  return <div className="app-shell">
    <header className="topbar">
      <button className="icon-button header-menu" aria-label="मेनू खोलें" onClick={()=>{setMenu(true);setProfileOpen(false);}}>
        <Icon name="menu" size={24}/>
      </button>
      <button className="brand" onClick={newChat}>Lumina <span>AI</span></button>
      <button className="profile-button" aria-label="प्रोफाइल" onClick={()=>{setProfileOpen(!profileOpen);setMenu(false);}}>
        <span>L</span>
      </button>
    </header>

    {profileOpen&&<div className="profile-popover">
      <div className="profile-pop-head"><span className="avatar">L</span><span><b>Lumina User</b><small>Free plan</small></span></div>
      <button onClick={()=>{setProfileOpen(false);setNotice('प्रोफाइल सेटिंग्स अभी जोड़ी जानी बाकी हैं।');}}>Profile & Settings <Icon name="chevron" size={17}/></button>
      <button onClick={()=>{setProfileOpen(false);setNotice('आप अभी Lumina AI के Free plan पर हैं।');}}>My Plan <Icon name="chevron" size={17}/></button>
    </div>}

    {menu&&<div className="overlay" onClick={()=>setMenu(false)}>
      <aside className="sidebar" onClick={e=>e.stopPropagation()}>
        <div className="side-head">
          <button className="brand side-brand" onClick={newChat}>Lumina <span>AI</span></button>
          <button className="icon-button" aria-label="बंद करें" onClick={()=>setMenu(false)}><Icon name="close"/></button>
        </div>
        <button className="new-chat-button" onClick={()=>chooseTool(tools[0])}><Icon name="edit" size={19}/> New Chat <span>＋</span></button>
        <div className="side-label">YOUR TOOLS</div>
        <div className="side-tools">
          {tools.slice(1).map(tool=><button className="side-item" key={tool.id} onClick={()=>chooseTool(tool)}>
            <span className="side-icon"><Icon name={tool.icon} size={20}/></span>
            <span className="side-copy"><b>{tool.title}</b><small>{tool.desc}</small></span>
            <Icon name="chevron" size={16} className="side-chevron"/>
          </button>)}
        </div>
        <div className="side-label history-label">RECENT CHATS</div>
        <div className="history-list">
          {history.length===0?<p className="empty-history">आपकी बातचीत यहाँ दिखाई देगी।</p>:history.map(item=><button className="history-entry" key={item.id} onClick={()=>openHistory(item)}>{item.messages[0]?.text||'New Chat'}</button>)}
        </div>
        <div className="side-bottom">
          <div className="profile"><span className="avatar">L</span><span><b>Lumina User</b><small>Free plan</small></span><span className="plan-tag">FREE</span></div>
        </div>
      </aside>
    </div>}

    <main className="chat-area">
      {messages.length===0?<section className="welcome">
        <div className="welcome-mark"><Icon name="spark" size={30}/></div>
        <h1>What can I help with?</h1>
        <p>मुझसे कुछ भी पूछें।</p>
      </section>:<section className="messages">
        {messages.map(m=><div className={`message-row ${m.role === 'assistant' ? 'assistant-row' : 'user-row'}`} key={m.id}><div className={m.role === 'assistant' ? 'assistant-bubble' : 'user-bubble'}>{m.role === 'assistant' ? <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{m.text}</ReactMarkdown> : m.text}</div></div>)}
        {isLoading&&<div className="message-row assistant-row"><div className="assistant-bubble typing-indicator">Lumina AI सोच रहा है…</div></div>}
        <div ref={endRef}/>
      </section>}
      {notice&&<div className="notice-inline"><span>{notice}</span><button aria-label="संदेश बंद करें" onClick={()=>setNotice('')}><Icon name="close" size={16}/></button></div>}
    </main>

    {activeMode === 'image' && (
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
          setSelectedImageName(file.name);
          setNotice('');
        };
        reader.onerror = () => setNotice('फोटो पढ़ी नहीं जा सकी। दूसरी फोटो चुनें।');
        reader.readAsDataURL(file);
      }}
    />
    <button type="button" onClick={() => imageUploadRef.current?.click()}>
      📷 गैलरी से अपनी फोटो चुनें
    </button>
    {selectedImage && <div style={{margin:'12px 0',textAlign:'center'}}>
      <img src={selectedImage} alt="अपलोड की गई फोटो" style={{maxWidth:'100%',maxHeight:220,borderRadius:14}} />
      <p>{selectedImageName}</p>
      <button type="button" onClick={() => {
        setSelectedImage('');
        setSelectedImageName('');
        if (imageUploadRef.current) imageUploadRef.current.value='';
      }}>फोटो हटाएँ</button>
    </div>}
    <textarea
      value={imagePrompt}
      onChange={e => setImagePrompt(e.target.value)}
      placeholder="जैसे: पहाड़ों के बीच एक सुंदर anime गाँव..."
      maxLength={2000}
      rows={3}
      aria-label="तस्वीर का विवरण"
    />
    <button
      type="button"
      onClick={generateImage}
      disabled={imageLoading || !imagePrompt.trim()}
    >
      {imageLoading ? 'तस्वीर बन रही है…' : (selectedImage ? '✨ मेरी फोटो AI से एडिट करें' : '🎨 नई तस्वीर बनाएँ')}
    </button>
    {imageLoading && (
          <div style={{margin:'20px 0',padding:18,borderRadius:18,background:'rgba(130,100,255,0.10)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <strong>✨ Creating your image</strong><strong>{imageProgress}%</strong>
            </div>
            <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={imageProgress}
              style={{height:10,marginTop:14,borderRadius:99,background:'rgba(140,140,160,.25)',overflow:'hidden'}}>
              <div style={{width:imageProgress+'%',height:'100%',borderRadius:99,background:'linear-gradient(90deg,#8b5cf6,#38bdf8)',transition:'width .5s ease'}} />
            </div>
            <p>तस्वीर बन रही है, कृपया प्रतीक्षा करें…</p>
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
)}

<footer className="composer-wrap">
      {plus&&<><button className="dismiss-layer" aria-label="मेनू बंद करें" onClick={()=>setPlus(false)}/><div className="tools-menu">
        {tools.map(tool=><button className="tool-item" key={tool.id} onClick={()=>chooseTool(tool)}>
          <span className="tool-icon"><Icon name={tool.icon} size={21}/></span>
          <span className="tool-copy"><b>{tool.title}</b><small>{tool.desc}</small></span>
        </button>)}
      </div></>}
      <div className="composer">
        {activeMode !== 'chat' && (() => {
          const selectedTool = tools.find(tool => tool.id === activeMode);
          return selectedTool ? <div className="mode-chip" title={selectedTool.title}>
            <span className="mode-chip-icon"><Icon name={selectedTool.icon} size={18}/></span>
            <span className="mode-chip-label">{selectedTool.title === 'Study AI' ? 'Study Mode' : selectedTool.title === 'Coding' ? 'Coding Mode' : selectedTool.title}</span>
            <button className="mode-chip-remove" aria-label="चुना हुआ मोड हटाएँ" onClick={() => { setActiveMode('chat'); setNotice(''); }}><Icon name="close" size={16}/></button>
          </div> : null;
        })()}
        <button className="plus-btn" aria-label="टूल जोड़ें" onClick={()=>setPlus(!plus)}><Icon name={plus?'close':'plus'} size={24}/></button>
        <textarea rows="1" value={message} placeholder="Message Lumina AI" aria-label="अपना संदेश लिखें" onChange={e=>setMessage(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}}}/>
        <button className={'mic-btn '+(listening?'listening':'')} aria-label="बोलकर लिखें" onClick={voiceInput}><Icon name="mic" size={21}/></button>
        {message.trim()?<button className="send-btn" aria-label="भेजें" disabled={isLoading} onClick={sendMessage}><Icon name="send" size={22}/></button>:<button className="voice-btn" aria-label="Voice mode" onClick={()=>setNotice('Voice बातचीत चालू करने के लिए AI voice सेवा कनेक्ट करनी होगी।')}><Waveform/></button>}
      </div>
      <p className="disclaimer">Lumina AI गलतियाँ कर सकता है। ज़रूरी जानकारी जाँच लें।</p>
      <input ref={fileRef} type="file" accept="image/*,application/pdf,.txt,.doc,.docx" hidden onChange={e=>{const file=e.target.files?.[0];if(file)setNotice('फ़ाइल चुनी गई: '+file.name+'। फ़ाइल पढ़ने की सुविधा जोड़ना बाकी है।');e.target.value='';}}/>
    </footer>
  </div>;
}
