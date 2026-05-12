import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, ChevronRight, Target } from "lucide-react";

export default function ResumeAnalyzer() {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{score: number, feedback: string} | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setFile(e.target.files[0]);
          setContent(""); // Clear text if file is uploaded
      }
  };

  const analyzeResume = async () => {
    if (!content.trim() && !file) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    if (file) {
        formData.append("resume", file);
    } else {
        formData.append("content", content);
    }

    try {
      const res = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: formData, // No Content-Type header so browser sets multipart/form-data with boundary
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
          alert(data.error || "Analysis failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">AI Resume Analyzer</h1>
          <p className="text-slate-400">Upload your PDF or paste text to get a comprehensive ATS review.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative"
        >
          <div className="mb-4 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">Resume Content</label>
            <div className="relative">
                <input 
                    type="file" 
                    accept="application/pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                />
                <button className="text-xs text-cyan-400 flex items-center gap-1 hover:text-cyan-300 transition-colors pointer-events-none">
                  <Upload className="w-3 h-3" /> {file ? file.name : "Upload PDF instead"}
                </button>
            </div>
          </div>
          
          <textarea
            value={content}
            onChange={(e) => {
                setContent(e.target.value);
                setFile(null); // Clear file if text is edited
            }}
            disabled={!!file}
            placeholder={file ? "PDF selected. Clear file to paste text." : "Paste your plain-text resume here..."}
            className="w-full h-64 bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none font-mono disabled:opacity-50"
          />

          <div className="mt-6 flex justify-end">
            <button
              onClick={analyzeResume}
              disabled={loading || (!content.trim() && !file)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-[0_0_20px_-5px_rgba(34,211,238,0.4)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Analyze Resume <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>

        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            className="mt-8 border border-cyan-500/30 rounded-2xl overflow-hidden bg-white/[0.02] shadow-[0_0_40px_-15px_rgba(34,211,238,0.2)]"
          >
            <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-white/[0.04] transition-colors">
               <div>
                 <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <Target className="w-5 h-5 text-cyan-400" />
                   ATS Readiness Score
                 </h3>
                 <p className="text-sm text-slate-400 mt-1">Based on keyword matching and format structure</p>
               </div>
               <div className="relative w-24 h-24 shrink-0 radial-progress flex items-center justify-center rounded-full border-[6px] border-indigo-500/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.2)]">
                  <div className="absolute inset-0 rounded-full border-[6px] border-cyan-400 border-l-transparent border-b-transparent transform rotate-45"></div>
                  <span className="text-3xl font-black text-white relative z-10">{result.score}</span>
               </div>
            </div>
            
            <div className="p-6 space-y-4">
              <h4 className="font-semibold text-slate-200">AI Feedback</h4>
              <div className="prose prose-invert prose-indigo max-w-none text-slate-300">
                {result.feedback.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 leading-relaxed">{line}</p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
