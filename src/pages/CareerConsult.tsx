import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, UserCircle, Loader2, Sparkles, Trash2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How do I negotiate a higher salary?",
  "What skills should I learn for a career in AI?",
  "How do I switch careers from finance to tech?",
  "How can I improve my LinkedIn profile?",
  "What should I include in a cover letter?",
  "How do I prepare for a system design interview?",
];

export default function CareerConsult() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/career/consult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message: text, history: messages }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100dvh-64px-32px)] md:h-[calc(100dvh-80px-64px)]">
      {/* Header */}
      <div className="shrink-0 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white">Career AI Consultant</h1>
            <p className="text-xs text-slate-400">Powered by LLaMA 3 · Ask anything about your career</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 rounded-lg transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-6 px-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Your AI Career Advisor</h2>
              <p className="text-slate-400 text-sm max-w-sm">Ask me anything about career growth, job searching, interviews, salary negotiation, or skill development.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)}
                  className="text-left px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/5 text-slate-300 text-sm transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-2">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white/10 mt-1">
                    {msg.role === "user"
                      ? <UserCircle className="w-5 h-5 text-cyan-400" />
                      : <Bot className="w-5 h-5 text-indigo-400" />}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-cyan-500/20 border border-cyan-500/30 text-white rounded-tr-none"
                      : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-none"
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white/10 mt-1">
                    <Bot className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 rounded-tl-none flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    <span className="text-sm text-slate-400">Thinking...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 mt-4 bg-white/5 border border-white/10 rounded-2xl p-2 flex items-end gap-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="Ask about career advice, interview tips, salary negotiation..."
          rows={1}
          className="flex-1 bg-transparent border-none focus:outline-none text-white px-3 text-sm resize-none max-h-32 scrollbar-thin"
          style={{ minHeight: "2.5rem" }}
        />
        <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
          className="p-2.5 bg-cyan-500 rounded-xl hover:bg-cyan-400 transition-colors disabled:opacity-50 shrink-0">
          <Send className="w-4 h-4 text-black" />
        </button>
      </div>
    </div>
  );
}
