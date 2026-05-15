import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, UserCircle, Bot, Loader2, MessageSquare, Video, Mic, MicOff, VideoOff, PhoneOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Message {
  role: "user" | "interviewer";
  content: string;
}

type Mode = "chat" | "video";
type Language = "english" | "burmese";

export default function MockInterview({ user }: { user: any }) {
  const navigate = useNavigate();
  const [role, setRole] = useState("Software Engineer");
  const [mode, setMode] = useState<Mode>("chat");
  const [language, setLanguage] = useState<Language>("english");
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Video mode state
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (started) document.body.classList.add("interview-active");
    return () => {
      document.body.classList.remove("interview-active");
      stopVideoStream();
    };
  }, [started]);

  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  // ── Video helpers ──────────────────────────────────────────────
  const stopVideoStream = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    recognitionRef.current?.stop();
    synthRef.current?.cancel();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      alert("Camera/microphone access denied. Please allow permissions and try again.");
    }
  };

  const speakText = (text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) return;
    synthRef.current = window.speechSynthesis;
    synthRef.current.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1;
    utt.pitch = 1.2;
    const voices = synthRef.current.getVoices();
    
    let langCode = language === "english" ? "en-US" : "my-MM";
    let preferred: SpeechSynthesisVoice | undefined;
    
    if (language === "english") {
      preferred = voices.find(v => v.lang.startsWith("en") && v.name.includes("Female")) ||
                 voices.find(v => v.lang.startsWith("en") && !v.name.includes("Male")) ||
                 voices.find(v => v.lang.startsWith("en"));
    } else {
      preferred = voices.find(v => v.lang.startsWith("my") && v.name.includes("Female")) ||
                 voices.find(v => v.lang.startsWith("my") && !v.name.includes("Male")) ||
                 voices.find(v => v.lang.startsWith("my"));
    }
    
    if (preferred) utt.voice = preferred;
    utt.lang = langCode;
    utt.onstart = () => setAiSpeaking(true);
    utt.onend = () => { setAiSpeaking(false); onEnd?.(); };
    synthRef.current.speak(utt);
  };

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = language === "english" ? "en-US" : "my-MM";
    rec.maxAlternatives = 5;
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: any) => {
      let bestTranscript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (transcript) bestTranscript += transcript + " ";
      }
      setTranscript(prev => prev + bestTranscript);
    };
    rec.onend = () => {
      setIsListening(false);
    };
    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
  }, [messages, role, language]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const submitSpeechAnswer = useCallback(() => {
    if (transcript.trim()) {
      stopListening();
      const answer = transcript.trim();
      setTranscript("");
      handleVideoSend(answer);
    }
  }, [transcript]);

  const toggleMic = () => {
    streamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMicOn(p => !p);
  };

  const toggleCam = () => {
    streamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setCamOn(p => !p);
  };

  // ── API calls ──────────────────────────────────────────────────
  const fetchReply = async (userMessage: string, history: Message[]): Promise<string> => {
    const res = await fetch("/api/interview/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ message: userMessage, history, role, language }),
    });
    const data = await res.json();
    return res.ok ? data.reply : (language === "english" ? "Could you elaborate on that?" : "ကျေးဇူးပြု၍ ပိုသိလျှင်ပြောပြပါ။");
  };

  // ── Chat mode ──────────────────────────────────────────────────
  const startInterview = async () => {
    const greeting = language === "english" 
      ? `Hello ${user.name}, I will be interviewing you today for the ${role} position. Let's start — please introduce yourself.`
      : `မင်္ဂလာပါ ${user.name}။ ကျွန်ုပ်သည် ယနေ့ ${role} position အတွက် သင့်အား အင်တာဗျူးပြုလုပ်ပေးပါမည်။ စတင်ရန် - ကျေးဇူးပြု၍ ကိုယ့်ကိုယ်ကိုယ် ရှင်းလင်းစွာ မိတ်ဆက်ပြောကြားပါ။`;
    setStarted(true);
    setMessages([{ role: "interviewer", content: greeting }]);
    if (mode === "video") {
      await startCamera();
      setCurrentQuestion(greeting);
      setTimeout(() => speakText(greeting, () => startListening()), 500);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const reply = await fetchReply(input, messages);
      setMessages([...newMessages, { role: "interviewer", content: reply }]);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const handleVideoSend = async (text: string) => {
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);
    setCurrentQuestion("Thinking...");
    try {
      const reply = await fetchReply(text, messages);
      setMessages([...newMessages, { role: "interviewer", content: reply }]);
      setCurrentQuestion(reply);
      speakText(reply, () => startListening());
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const finishInterview = async () => {
    setLoading(true);
    stopVideoStream();
    try {
      const gradeRes = await fetch("/api/interview/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ history: messages, role, language }),
      });
      const gradeData = gradeRes.ok ? await gradeRes.json() : { score: 0, feedback: language === "english" ? "Interview completed." : "အင်တာဗျူးပြီးဆုံးပါပြီ။" };
      await fetch("/api/interview/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ title: role, score: gradeData.score, feedback: gradeData.feedback, language }),
      });
      navigate("/dashboard");
    } catch { /* silent */ } finally { setLoading(false); }
  };

  // ── Setup screen ───────────────────────────────────────────────
  if (!started) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 md:py-20">
        <div className="relative rounded-2xl overflow-hidden mb-8 h-48 bg-slate-900">
          <img src="https://cdn.pixabay.com/photo/2018/09/27/09/22/artificial-intelligence-3706562_1280.jpg" alt="" className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-6">
            <h1 className="text-3xl md:text-4xl font-bold">Mock AI Interview</h1>
          </div>
        </div>
        <p className="text-slate-400 mb-8 text-center">Practice behavioral and technical questions with our real-time AI interviewer.</p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm space-y-6">
          {/* Mode selector */}
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-3">Interview Mode</label>
            <div className="grid grid-cols-2 gap-3">
              {([["chat", MessageSquare, "Chat Interview", "Text-based Q&A"], ["video", Video, "Video Interview", "Webcam + voice"]] as const).map(([m, Icon, label, sub]) => (
                <button key={m} onClick={() => setMode(m)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${mode === m ? "border-cyan-500 bg-cyan-500/10 text-white" : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"}`}>
                  <Icon className={`w-6 h-6 ${mode === m ? "text-cyan-400" : ""}`} />
                  <span className="font-semibold text-sm">{label}</span>
                  <span className="text-xs opacity-60">{sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language selector for video mode */}
          {mode === "video" && (
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-3">Interview Language</label>
              <div className="grid grid-cols-2 gap-3">
                {([["english", "🇺🇸 English", "Native English interview"], ["burmese", "🇲🇲 Burmese", "Native Burmese interview"]] as const).map(([lang, label, sub]) => (
                  <button key={lang} onClick={() => setLanguage(lang)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${language === lang ? "border-purple-500 bg-purple-500/10 text-white" : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"}`}>
                    <span className="font-semibold text-sm">{label}</span>
                    <span className="text-xs opacity-60">{sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Role input */}
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-2">Target Role</label>
            <input type="text" value={role} onChange={e => setRole(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500"
              placeholder="e.g. Senior Frontend Developer" />
          </div>

          <button onClick={startInterview}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl font-bold text-white hover:opacity-90 transition-opacity">
            Start {mode === "video" ? "Video" : "Chat"} Interview
          </button>
        </div>
      </div>
    );
  }

  // ── Video mode ─────────────────────────────────────────────────
  if (mode === "video") {
    return (
      <div className="max-w-4xl mx-auto px-0 md:px-4 flex flex-col h-[calc(100dvh-64px-32px)] md:h-[calc(100dvh-80px-64px)]">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">{role} — Video Interview</h2>
            <p className="text-slate-400 text-xs md:text-sm">Speak your answers aloud</p>
          </div>
          <button onClick={finishInterview} disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-sm text-red-400 transition-colors disabled:opacity-50">
            <PhoneOff className="w-4 h-4" /> {loading ? "Saving..." : "End"}
          </button>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Webcam */}
          <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10">
            <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${!camOn ? "opacity-0" : ""}`} />
            {!camOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                <VideoOff className="w-12 h-12 text-slate-600" />
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/60 rounded-lg px-2 py-1 text-xs text-white">{user.name}</div>
          </div>

          {/* AI panel */}
          <div className="relative rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/10 flex flex-col items-center justify-center p-6 gap-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all ${aiSpeaking ? "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] scale-110" : "border-indigo-500/40"} bg-indigo-500/10`}>
              <Bot className={`w-10 h-10 ${aiSpeaking ? "text-cyan-400" : "text-indigo-400"}`} />
            </div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">AI Interviewer</p>
            <div className="w-full bg-white/5 rounded-xl p-4 text-sm text-slate-300 text-center min-h-[80px] flex items-center justify-center">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : currentQuestion}
            </div>
            {isListening && (
              <div className="flex items-center gap-2 text-cyan-400 text-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Listening...
              </div>
            )}
            {transcript && <p className="text-xs text-slate-500 italic">"{transcript}"</p>}
          </div>
        </div>

        {/* Controls */}
        <div className="shrink-0 flex items-center justify-center gap-4 py-2">
          <button onClick={toggleMic}
            className={`p-3 rounded-full border transition-colors ${micOn ? "bg-white/10 border-white/20 text-white" : "bg-red-500/20 border-red-500/30 text-red-400"}`}>
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <button onClick={toggleCam}
            className={`p-3 rounded-full border transition-colors ${camOn ? "bg-white/10 border-white/20 text-white" : "bg-red-500/20 border-red-500/30 text-red-400"}`}>
            {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          {!isListening ? (
            <button onClick={() => { if (!aiSpeaking && !loading) startListening(); }}
              disabled={aiSpeaking || loading}
              className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 rounded-full text-black font-semibold text-sm transition-colors flex items-center gap-2">
              <Mic className="w-4 h-4" /> Start Speaking
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={submitSpeechAnswer}
                disabled={!transcript.trim() || loading}
                className="px-5 py-3 bg-green-500 hover:bg-green-400 disabled:opacity-50 rounded-full text-black font-semibold text-sm transition-colors flex items-center gap-2">
                <Mic className="w-4 h-4" /> Submit
              </button>
              <button onClick={stopListening}
                className="px-5 py-3 bg-red-500 hover:bg-red-400 rounded-full text-white font-semibold text-sm transition-colors flex items-center gap-2">
                Stop Speaking
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Chat mode ──────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-0 md:px-4 flex flex-col h-[calc(100dvh-64px-32px)] md:h-[calc(100dvh-80px-64px)]">
      <div className="flex justify-between items-center mb-4 md:mb-6 shrink-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">{role} Interview</h2>
          <p className="text-slate-400 text-xs md:text-sm">Chat mode — type your answers</p>
        </div>
        <button onClick={finishInterview} disabled={loading}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors disabled:opacity-50">
          {loading ? "Saving..." : "End & Report"}
        </button>
      </div>

      <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto bg-black/40 border border-white/10 rounded-2xl p-4 md:p-6 mb-4 space-y-4 md:space-y-6 scrollbar-thin">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={`${i}-${msg.role}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className="shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-white/10">
                {msg.role === "user" ? <UserCircle className="text-cyan-400 w-5 h-5" /> : <Bot className="text-indigo-400 w-5 h-5" />}
              </div>
              <div className={`p-3 md:p-4 rounded-2xl max-w-[85%] text-sm md:text-base ${msg.role === "user" ? "bg-cyan-500/20 border border-cyan-500/30 text-white rounded-tr-none" : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-none"}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-white/10">
                <Bot className="text-indigo-400 w-5 h-5" />
              </div>
              <div className="p-3 md:p-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-none flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                <span className="text-sm text-slate-400">Typing...</span>
              </div>
            </motion.div>
          )}
          <div />
        </AnimatePresence>
      </div>

      <div className="shrink-0 bg-white/5 border border-white/10 rounded-2xl p-2 flex items-center gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Type your answer here..."
          className="flex-1 bg-transparent border-none focus:outline-none text-white px-3 md:px-4 text-sm md:text-base" />
        <button onClick={handleSend} disabled={!input.trim() || loading}
          className="p-2.5 md:p-3 bg-cyan-500 rounded-xl hover:bg-cyan-400 transition-colors disabled:opacity-50">
          <Send className="w-4 h-4 md:w-5 md:h-5 text-black" />
        </button>
      </div>
    </div>
  );
}
