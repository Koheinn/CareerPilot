import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BrainCircuit, LineChart, FileText, ChevronRight, CheckCircle2 } from "lucide-react";

export default function Landing() {
  return (
    <div className="relative overflow-hidden pt-10 min-h-[calc(100vh-5rem)] flex items-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#050505]/50 via-[#050505]/80 to-[#050505]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-8"
        >
          <BrainCircuit className="w-4 h-4" />
          <span>Powered by Groq & LLaMA 3</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
        >
          The unfair advantage for <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            your next career move
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-4 max-w-2xl mx-auto text-xl text-slate-300 mb-10 text-shadow-sm"
        >
          An elite AI resume analyzer and interview coach. Land 5x more interviews with data-driven ATS optimization and real-time behavioral coaching.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/auth"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-all shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] hover:shadow-[0_0_60px_-15px_rgba(99,102,241,0.7)]"
          >
            Get Started Free <ChevronRight className="w-5 h-5" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-[#E0E0E0] bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all backdrop-blur-md"
          >
            View Demo
          </a>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-32 grid md:grid-cols-3 gap-8 text-left"
          id="features"
        >
          {[
            {
              title: "ATS Resume Scoring",
              description: "Instantly see how your resume performs against top applicant tracking systems with deep AI keyword analysis.",
              icon: FileText,
              color: "text-blue-400",
              bg: "bg-blue-500/10"
            },
            {
              title: "AI Interview Coach",
              description: "Practice with custom behavioral & technical questions tailored to your target role using real-time feedback.",
              icon: BrainCircuit,
              color: "text-purple-400",
              bg: "bg-purple-500/10"
            },
            {
              title: "Job Fit Analytics",
              description: "Track your progress. See your estimated chance of landing the interview through our proprietary matching model.",
              icon: LineChart,
              color: "text-indigo-400",
              bg: "bg-indigo-500/10"
            }
          ].map((feature, i) => (
            <div key={i} className="relative group p-6 rounded-2xl bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-slate-900 border border-white/10`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
