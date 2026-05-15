import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BrainCircuit, LineChart, FileText, ChevronRight, Video, Sparkles, LayoutDashboard } from "lucide-react";

const FEATURES = [
  {
    title: "ATS Resume Scoring",
    description: "Instantly see how your resume performs against top applicant tracking systems with deep AI keyword analysis.",
    icon: FileText,
    color: "text-blue-400",
    image: "https://cdn.pixabay.com/photo/2018/03/10/12/00/paper-3213924_1280.jpg",
  },
  {
    title: "AI Chat Interview",
    description: "Practice behavioral & technical questions tailored to your target role with real-time AI feedback in a text-based interview.",
    icon: BrainCircuit,
    color: "text-purple-400",
    image: "https://cdn.pixabay.com/photo/2018/09/27/09/22/artificial-intelligence-3706562_1280.jpg",
  },
  {
    title: "Video Mock Interview",
    description: "Experience a real interview with your webcam and microphone. The AI asks questions aloud and listens to your spoken answers.",
    icon: Video,
    color: "text-cyan-400",
    image: "https://cdn.pixabay.com/photo/2017/08/10/08/47/laptop-2620118_1280.jpg",
  },
  {
    title: "Job Fit Analytics",
    description: "See exactly how well your resume matches a job description with our ATS scoring engine and get actionable improvement tips.",
    icon: LineChart,
    color: "text-indigo-400",
    image: "https://cdn.pixabay.com/photo/2016/11/27/21/42/stock-1863880_1280.jpg",
  },
  {
    title: "AI Career Consultant",
    description: "Chat with your personal AI career advisor — get expert guidance on salary negotiation, career transitions, skill gaps, and more.",
    icon: Sparkles,
    color: "text-amber-400",
    image: "https://cdn.pixabay.com/photo/2019/04/29/07/04/team-4165306_1280.jpg",
  },
  {
    title: "Progress Dashboard",
    description: "Track all your resume scores, mock interview results, and activity history in one unified dashboard with visual score trends.",
    icon: LayoutDashboard,
    color: "text-green-400",
    image: "https://cdn.pixabay.com/photo/2016/11/19/14/00/code-1839406_1280.jpg",
  },
];

export default function Landing() {
  return (
    <div className="relative overflow-hidden pt-10 min-h-[calc(100vh-5rem)] flex items-center">
      {/* Hero Background */}
      <div
        className="absolute inset-0 z-0 opacity-25"
        style={{
          backgroundImage: "url('https://cdn.pixabay.com/photo/2016/11/19/14/00/code-1839406_1280.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/80 to-[#050505]" />

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
          className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-slate-300 mb-10"
        >
          AI resume analysis, ATS matching, chat & video mock interviews, and a personal career advisor — all in one platform.
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
            View Features
          </a>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-24 md:mt-32 text-left"
          id="features"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Everything you need to land the job</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Six powerful AI tools working together to accelerate your career.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div key={i} className="relative group rounded-2xl bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all overflow-hidden shadow-2xl">
                <div className="h-36 w-full overflow-hidden relative">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0A0A]" />
                </div>
                <div className="p-5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-slate-900 border border-white/10">
                    <feature.icon className={`w-4 h-4 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-bold mb-1.5">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
