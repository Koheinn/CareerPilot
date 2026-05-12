import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, FileText, Loader2, Target } from "lucide-react";

export default function JobMatcher() {
  const [resumeContent, setResumeContent] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{matchPercentage: number, feedback: string} | null>(null);

  const analyzeMatch = async () => {
    if (!resumeContent.trim() || !jobDescription.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/resume/match", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ resumeContent, jobDescription }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        alert(data.error || "Match analysis failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">ATS Job Matcher</h1>
          <p className="text-slate-400">See exactly how well your resume aligns with a specific job description.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
          >
            <div className="mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <label className="text-sm font-medium text-slate-300">Your Resume</label>
            </div>
            <textarea
              value={resumeContent}
              onChange={(e) => setResumeContent(e.target.value)}
              placeholder="Paste your plain-text resume here..."
              className="w-full h-64 bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none font-mono"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
          >
            <div className="mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-cyan-400" />
              <label className="text-sm font-medium text-slate-300">Job Description</label>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full h-64 bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none font-mono"
            />
          </motion.div>
        </div>

        <div className="mt-8 flex justify-center">
            <button
              onClick={analyzeMatch}
              disabled={loading || !resumeContent.trim() || !jobDescription.trim()}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-[0_0_20px_-5px_rgba(34,211,238,0.4)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Analyzing Match...
                </>
              ) : (
                <>
                  <Target className="w-5 h-5" /> Calculate Job Fit
                </>
              )}
            </button>
        </div>

        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            className="mt-12 border border-cyan-500/30 rounded-2xl overflow-hidden bg-white/[0.02]"
          >
            <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-32 h-32 shrink-0 radial-progress flex items-center justify-center rounded-full border-[8px] border-indigo-500/20">
                  <div className="absolute inset-0 rounded-full border-[8px] border-cyan-400 border-l-transparent border-b-transparent transform rotate-45"></div>
                  <div className="text-center">
                      <span className="text-4xl font-black text-white block leading-none">{result.matchPercentage}%</span>
                      <span className="text-xs text-gray-400">Match</span>
                  </div>
               </div>
               <div>
                   <h3 className="text-2xl font-bold text-white mb-2">Analysis Complete</h3>
                   <div className="prose prose-invert prose-p:text-slate-300 prose-p:leading-relaxed max-w-none">
                       {result.feedback}
                   </div>
               </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
