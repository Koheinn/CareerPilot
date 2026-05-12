import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, UserCircle, Bot, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Message {
    role: "user" | "interviewer";
    content: string;
}

export default function MockInterview({ user }: { user: any }) {
  const navigate = useNavigate();
  const [role, setRole] = useState("Software Engineer");
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const startInterview = async () => {
      setStarted(true);
      setMessages([
          { role: "interviewer", content: `Hello ${user.name}, I will be interviewing you today for the ${role} position. Let's start by having you introduce yourself.` }
      ]);
  };

  const handleSend = async () => {
      if (!input.trim()) return;
      const newMessages: Message[] = [...messages, { role: "user", content: input }];
      setMessages(newMessages);
      setInput("");
      setLoading(true);

      try {
          const res = await fetch("/api/interview/chat", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
              },
              body: JSON.stringify({ message: input, history: messages, role })
          });
          const data = await res.json();
          if (res.ok) {
              setMessages([...newMessages, { role: "interviewer", content: data.reply }]);
          }
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  const finishInterview = async () => {
      setLoading(true);
      try {
          await fetch("/api/interview/save", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
              },
              body: JSON.stringify({ 
                  title: role,
                  score: 80, // In a real app, send the conversation to HF to grade it.
                  feedback: "Good interview practice completed." 
              })
          });
          navigate("/dashboard");
      } catch (err) {
          console.error(err);
          setLoading(false);
      }
  };

  if (!started) {
      return (
          <div className="max-w-2xl mx-auto px-4 py-20 text-center">
              <h1 className="text-4xl font-bold mb-6">Mock AI Interview</h1>
              <p className="text-slate-400 mb-8">Practice behavioral and technical questions with our real-time AI interviewer.</p>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                  <div className="mb-6 text-left">
                      <label className="text-sm font-medium text-slate-300 block mb-2">Target Role</label>
                      <input 
                          type="text" 
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500"
                          placeholder="e.g. Senior Frontend Developer"
                      />
                  </div>
                  <button 
                      onClick={startInterview}
                      className="w-full py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
                  >
                      Start Interview
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col">
       <div className="flex justify-between items-center mb-6">
           <div>
               <h2 className="text-2xl font-bold">{role} Interview</h2>
               <p className="text-slate-400 text-sm">Session recording is disabled</p>
           </div>
           <button 
                onClick={finishInterview}
                disabled={loading}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors disabled:opacity-50"
           >
               {loading ? "Saving..." : "End & Report"}
           </button>
       </div>

       <div className="flex-1 overflow-y-auto bg-black/40 border border-white/10 rounded-2xl p-6 mb-6 space-y-6 scrollbar-thin">
           <AnimatePresence>
              {messages.map((msg, i) => (
                  <motion.div 
                      key={`${i}-${msg.role}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                      <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white/10">
                          {msg.role === 'user' ? <UserCircle className="text-cyan-400" /> : <Bot className="text-indigo-400" />}
                      </div>
                      <div className={`p-4 rounded-2xl max-w-[80%] ${
                          msg.role === 'user' 
                            ? 'bg-cyan-500/20 border border-cyan-500/30 text-white rounded-tr-none' 
                            : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                      }`}>
                          {msg.content}
                      </div>
                  </motion.div>
              ))}
              {loading && (
                   <motion.div 
                      key="loading-indicator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-4"
                  >
                      <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white/10">
                          <Bot className="text-indigo-400" />
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-none flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                          <span className="text-sm text-slate-400">Typing...</span>
                      </div>
                  </motion.div>
              )}
              <div ref={messagesEndRef} />
           </AnimatePresence>
       </div>

       <div className="shrink-0 bg-white/5 border border-white/10 rounded-2xl p-2 flex items-center gap-2">
           <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your answer here..."
              className="flex-1 bg-transparent border-none focus:outline-none text-white px-4"
           />
           <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-3 bg-cyan-500 rounded-xl hover:bg-cyan-400 transition-colors disabled:opacity-50"
           >
               <Send className="w-5 h-5 text-black" />
           </button>
       </div>
    </div>
  );
}
