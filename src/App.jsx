import { useState, useRef, useEffect } from 'react';
import { lazy, Suspense } from 'react';
const MarkdownMessage = lazy(() => import('./components/MarkdownMessage.jsx'));
import './App.css';
import VoiceCloudOverlay from './components/VoiceCloudOverlay.jsx';
import ImageGenerator from './components/ImageGenerator.jsx';

import Settings from './components/Settings.jsx';
import ProfileSettings from './components/ProfileSettings';
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
  // Restore the saved Voice AI cloud color on app startup only.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('lumina-settings') || '{}');
      const allowed = ['#3984ff', '#ed62b5', '#ff922e', '#27b56b'];
      const chosen = allowed.includes(saved.accent) ? saved.accent : '#3984ff';
      document.documentElement.style.setProperty('--lumina-voice-color', chosen);
    } catch {
      document.documentElement.style.setProperty('--lumina-voice-color', '#3984ff');
    }
  }, []);

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


  if (activeMode === 'profile') {
    return <ProfileSettings onBack={() => setActiveMode('chat')} onOpenSettings={() => setActiveMode('settings')} />;
  }

  return () => clearTimeout(timer);
  }, [generatedImage, imageLoading]);

  const [activeMode,setActiveMode] = useState('chat');
  const [messages,setMessages] = useState([]);
  const [isLoading,setIsLoading] = useState(false);
  const [menu,setMenu] = useState(false);
  const [plus,setPlus] = useState(false);
  const [notice,setNotice] = useState('');
  const [listening,setListening] = useState(false);
  const [voiceMode,setVoiceMode] = useState(false);
  const [cloudCompact,setCloudCompact] = useState(false);
  const [cloudBoost,setCloudBoost] = useState(false);
  const cloudTouchY = useRef(0);
  const voiceRecRef = useRef(null);
  const voiceModeRef = useRef(false);
  const voiceRetryRef = useRef(0);
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

  async function sendMessage(textOverride) {
    const text = (typeof textOverride === 'string' ? textOverride : message).trim();
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
          body: JSON.stringify({message:text, history:previousHistory, mode:activeMode}),
          signal: AbortSignal.timeout(90000)
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
      if (voiceModeRef.current) {
const answerText = String(data.answer ?? '').trim()
        .replace(/```[\s\S]*?```/g, m => m.replace(/```[^\n]*\n?/g, '').replace(/```/g, ''))
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^\s{0,3}#{1,6}\s*/gm, '')
        .replace(/^\s*>\s?/gm, '')
        .replace(/^\s*[-+*]\s+/gm, '')
        .replace(/^\s*\d+[.)]\s+/gm, '')
        .replace(/(\*\*|__|~~|`|\*|_)/g, '')
        .replace(/[?#|<>]/g, '')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{2,}/g, '. ')
        .replace(/\s+([,.;:!।])/g, '$1')
        .trim();
      let browserVoiceStarted = false;
      const ttsController = new AbortController();

      const speakWithBrowser = () => {
        if (!voiceModeRef.current || browserVoiceStarted) return;
        browserVoiceStarted = true;
        ttsController.abort();

        const utterance = new SpeechSynthesisUtterance(answerText);
        utterance.lang = "hi-IN";
        utterance.onend = () => {
          if (voiceModeRef.current) setTimeout(() => startVoiceListening(), 350);
        };
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      };

      const ttsTimer = setTimeout(speakWithBrowser, 2500);

      fetch("https://muvixa-lumina-backend-8417.onrender.com/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: answerText }),
        signal: ttsController.signal
      })
        .then(async response => {
          if (!response.ok) throw new Error("TTS unavailable");
          return response.blob();
        })
        .then(blob => {
          clearTimeout(ttsTimer);
          if (!voiceModeRef.current || browserVoiceStarted) return;

          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);

          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            if (voiceModeRef.current) setTimeout(() => startVoiceListening(), 350);
          };

          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            speakWithBrowser();
          };

          audio.play().catch(() => {
            URL.revokeObjectURL(audioUrl);
            speakWithBrowser();
          });
        })
        .catch(() => {
          clearTimeout(ttsTimer);
          speakWithBrowser();
        });
    }
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


  async function generateImage(promptOverride) {
    const prompt = String(promptOverride ?? imagePrompt).trim();
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
          body: JSON.stringify({ prompt, image: selectedImage || undefined }),
          signal: AbortSignal.timeout(120000)
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
        image:'नीचे तस्वीर का वर्णन लिखें और भेजें।',
        library:'Image Library चुना गया है; लाइब्रेरी सेव करने की सुविधा अभी तैयार नहीं है।'
      };
      setNotice(notices[tool.id] || '');
      return;
    }
    setNotice(tool.title + ' सुविधा अभी जोड़ी जा रही है।');
  }

  function startVoiceListening() {
  if (!voiceModeRef.current || isLoading) return;

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    setNotice('इस ब्राउज़र में Voice AI उपलब्ध नहीं है। Chrome इस्तेमाल करें।');
    voiceModeRef.current = false;
    setVoiceMode(false);
    return;
  }

  try {
    const rec = new SR();
    voiceRecRef.current = rec;
    rec.lang = 'hi-IN';
    rec.continuous = false;
    rec.interimResults = false;
    let sent = false;

    const removeRepeatedPhrases = input => {
      let words = String(input || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);

      for (let pass = 0; pass < 12; pass++) {
        let changed = false;
        for (let size = Math.min(8, Math.floor(words.length / 2)); size >= 1; size--) {
          for (let j = 0; j + size * 2 <= words.length; j++) {
            const first = words.slice(j, j + size).join(' ').toLocaleLowerCase('hi-IN');
            const second = words.slice(j + size, j + size * 2).join(' ').toLocaleLowerCase('hi-IN');
            if (first === second) {
              words.splice(j + size, size);
              changed = true;
              break;
            }
          }
          if (changed) break;
        }
        if (!changed) break;
      }
      return words.join(' ').trim();
    };

    rec.onstart = () => setListening(true);

    rec.onresult = event => {
      if (sent || !voiceModeRef.current) return;

      let transcript = '';
      for (let i = event.results.length - 1; i >= 0; i--) {
        const result = event.results[i];
        if (result.isFinal && result[0]?.transcript?.trim()) {
          transcript = result[0].transcript.trim();
          break;
        }
      }

      const spoken = removeRepeatedPhrases(transcript);
      if (spoken.length < 2) return;

      sent = true;
      voiceRetryRef.current = 0;
      setNotice('आपने कहा: ' + spoken);
      setListening(false);
      try { rec.stop(); } catch {}
      sendMessage(spoken);
    };

    rec.onerror = event => {
      setListening(false);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setNotice('माइक में समस्या हुई। Voice बटन दबाकर दोबारा बोलें।');
      }
    };

    rec.onend = () => {
      setListening(false);
      if (!sent && voiceModeRef.current) {
        if (voiceRetryRef.current < 2) {
          voiceRetryRef.current += 1;
          setTimeout(() => {
            if (voiceModeRef.current && !isLoading) startVoiceListening();
          }, 700);
        } else {
          voiceRetryRef.current = 0;
          setNotice('आवाज़ नहीं मिली। Voice बटन दबाकर दोबारा बोलें।');
        }
      }
    };

    rec.start();
  } catch {
    setListening(false);
    setNotice('माइक शुरू नहीं हुआ। दोबारा Voice बटन दबाएँ।');
  }
}

  function voiceInput() {
    if (voiceModeRef.current) {
      voiceModeRef.current = false;
      setVoiceMode(false);
      setListening(false);
      voiceRecRef.current?.stop();
      window.speechSynthesis?.cancel();
      setNotice('Voice बातचीत बंद हो गई।');
      return;
    }
    voiceModeRef.current = true;
    setVoiceMode(true);
    setNotice('Lumina सुन रहा है। बोलना शुरू करें। बंद करने के लिए Voice बटन दबाएँ।');
    startVoiceListening();
  }

  function openHistory(item) {
    setMessages(item.messages);
    setNotice('');
    setMenu(false);
  }

  return <div className="app-shell">
    {voiceMode && (
      <VoiceCloudOverlay
        cloudCompact={cloudCompact}
        cloudBoost={cloudBoost}
        setCloudCompact={setCloudCompact}
        setCloudBoost={setCloudBoost}
        cloudTouchY={cloudTouchY}
        voiceInput={voiceInput}
        Icon={Icon}
      />
    )}
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
      <button onClick={()=>{setProfileOpen(false);setActiveMode('profile');setNotice('');}}>Profile & Settings <Icon name="chevron" size={17}/></button>
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
        {messages.map(m=><div className={`message-row ${m.role === 'assistant' ? 'assistant-row' : 'user-row'}`} key={m.id}><div className={m.role === 'assistant' ? 'assistant-bubble' : 'user-bubble'}>{m.role === 'assistant' ? <Suspense fallback={<span className="markdown-loading">उत्तर लोड हो रहा है…</span>}><MarkdownMessage>{m.text}</MarkdownMessage></Suspense> : m.text}</div></div>)}
        {isLoading&&<div className="message-row assistant-row"><div className="assistant-bubble typing-indicator">Lumina AI सोच रहा है…</div></div>}
        <div ref={endRef}/>
      </section>}
      {notice&&<div className="notice-inline"><span>{notice}</span><button aria-label="संदेश बंद करें" onClick={()=>setNotice('')}><Icon name="close" size={16}/></button></div>}
    </main>

    {activeMode === 'settings' && <Settings />}
        {activeMode === 'profile' && <ProfileSettings onBack={() => setActiveMode('chat')} onOpenSettings={() => setActiveMode('settings')} />}
    {activeMode === 'image' && (
      <ImageGenerator
        imageUploadRef={imageUploadRef}
        generatedImageResultRef={generatedImageResultRef}
        imageLoading={imageLoading}
        imageProgress={imageProgress}
        generatedImage={generatedImage}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        selectedImageName={selectedImageName}
        setSelectedImageName={setSelectedImageName}
        imagePrompt={imagePrompt}
        setImagePrompt={setImagePrompt}
        generateImage={generateImage}
        setNotice={setNotice}
      />
    )}

<footer className="composer-wrap">
      {plus&&<><button className="dismiss-layer" aria-label="मेनू बंद करें" onClick={()=>setPlus(false)}/><div className="tools-menu">
        {tools.map(tool=><button className="tool-item" key={tool.id} onClick={()=>chooseTool(tool)}>
          <span className="tool-icon"><Icon name={tool.icon} size={21}/></span>
          <span className="tool-copy"><b>{tool.title}</b><small>{tool.desc}</small></span>
        </button>)}
      </div></>}
      <div className="composer">
        {activeMode !== 'chat' && activeMode !== 'image' && (() => {
          const selectedTool = tools.find(tool => tool.id === activeMode);
          return selectedTool ? <div className="mode-chip" title={selectedTool.title}>
            <span className="mode-chip-icon"><Icon name={selectedTool.icon} size={18}/></span>
            <span className="mode-chip-label">{selectedTool.title === 'Study AI' ? 'Study Mode' : selectedTool.title === 'Coding' ? 'Coding Mode' : selectedTool.title}</span>
            <button className="mode-chip-remove" aria-label="चुना हुआ मोड हटाएँ" onClick={() => { setActiveMode('chat'); setNotice(''); }}><Icon name="close" size={16}/></button>
          </div> : null;
        })()}
        <button className="plus-btn" aria-label="टूल जोड़ें" onClick={()=>setPlus(!plus)}><Icon name={plus?'close':'plus'} size={24}/></button>
        {activeMode === 'image' && selectedImage && <div className="composer-image-preview"><img src={selectedImage} alt="चुनी हुई फोटो"/><button type="button" aria-label="फोटो हटाएँ" onClick={()=>{setSelectedImage('');setSelectedImageName('');if(imageUploadRef.current)imageUploadRef.current.value='';}}>×</button></div>}
        <textarea key={activeMode} rows="1" value={activeMode === 'image' ? imagePrompt : message} placeholder={activeMode === 'image' ? 'तस्वीर का वर्णन करें' : 'Message Lumina AI'} aria-label="अपना संदेश लिखें" onChange={e=>{const el=e.currentTarget;const value=el.value;activeMode === 'image' ? setImagePrompt(value) : setMessage(value);el.style.height='auto';el.style.height=Math.min(el.scrollHeight,220)+'px';}} onInput={e=>{const el=e.currentTarget;el.style.height='auto';el.style.height=Math.min(el.scrollHeight,220)+'px';}} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();activeMode==='image'?generateImage():sendMessage();}}}/>
        <button className={'mic-btn '+((listening||voiceMode)?'listening':'')} aria-label={voiceMode?'Voice बंद करें':'Voice चालू करें'} onClick={voiceInput}><Icon name="mic" size={21}/></button>
        {(activeMode==='image'?imagePrompt.trim():message.trim()) && <button className="send-btn" aria-label="भेजें" disabled={isLoading||imageLoading} onClick={()=>activeMode==='image'?generateImage():sendMessage()}><Icon name="send" size={22}/></button>}
      </div>
      <p className="disclaimer">Lumina AI गलतियाँ कर सकता है। ज़रूरी जानकारी जाँच लें।</p>
      <input ref={fileRef} type="file" accept="image/*,application/pdf,.txt,.doc,.docx" hidden onChange={e=>{
      const file=e.target.files?.[0];
      if(!file){e.target.value='';return;}
      if(file.type.startsWith('image/')){
        if(file.size>5*1024*1024){
          setNotice('फोटो 5 MB से छोटी चुनें।');
          e.target.value='';
          return;
        }
        const reader=new FileReader();
        reader.onload=()=>{
          const result=String(reader.result||'');
          if(!result.startsWith('data:image/')){
            setNotice('फोटो पढ़ी नहीं जा सकी। दूसरी फोटो चुनें।');
            return;
          }
          setSelectedImage(result);
          setSelectedImageName(file.name);
          setActiveMode('image');
          setNotice('फोटो तैयार है। अब विवरण लिखकर AI से एडिट कराएँ।');
        };
        reader.onerror=()=>setNotice('फोटो पढ़ी नहीं जा सकी। दूसरी फोटो चुनें।');
        reader.readAsDataURL(file);
      }else{
        setNotice('फ़ाइल चुनी गई: '+file.name+'। अभी फोटो एडिटिंग उपलब्ध है; इस फ़ाइल का टेक्स्ट पढ़ना अभी समर्थित नहीं है।');
      }
      e.target.value='';
    }}/>
    </footer>
  </div>;
}
