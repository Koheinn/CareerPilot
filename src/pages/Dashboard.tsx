import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard({ user }: { user: any }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ resumes: [], interviews: [] });
  const [loading, setLoading] = useState(true);
  const [deleteData, setDeleteData] = useState<{ type: string, id: string } | null>(null);

  const fetchStats = () => {
    fetch("/api/dashboard/stats", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.resumes && data.interviews) {
          setStats(data);
        } else {
          setStats({ resumes: [], interviews: [] });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const confirmDeleteHistory = async () => {
      if (!deleteData) return;
      try {
          const res = await fetch(`/api/history/${deleteData.type}/${deleteData.id}`, {
              method: 'DELETE',
              headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
          });
          if (res.ok) {
              fetchStats();
          }
      } catch (err) {
          console.error("Failed to delete", err);
      } finally {
          setDeleteData(null);
      }
  };

  const handleDeleteHistory = (type: string, id: string) => {
      setDeleteData({ type, id });
  };

  // Compute trend data based on user's actual resumes
  const trendData = stats.resumes?.length > 0 ? stats.resumes.map((r: any, i: number) => ({
      name: `Report ${stats.resumes.length - i}`,
      score: r.score || 0
  })).reverse() : [
      { name: 'N/A', score: 0 }
  ];

  const latestScore = stats.resumes?.length > 0 ? (stats.resumes[0] as any).score : 0;
  const mockInterviewsCount = stats.interviews?.length || 0;
  const resumesCount = stats.resumes?.length || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-12 gap-4 md:gap-6">
      {/* Stat Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="col-span-1 md:col-span-3 p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between h-36 md:h-40"
      >
        <div className="flex justify-between items-start">
          <span className="text-sm text-gray-400">Latest Report Score</span>
          <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">Live</span>
        </div>
        <div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">{latestScore}</span>
            <span className="text-lg text-gray-500">/ 100</span>
          </div>
          <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: `${latestScore}%` }}></div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="col-span-1 md:col-span-3 p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between h-36 md:h-40"
      >
        <div className="flex justify-between items-start">
          <span className="text-sm text-gray-400">Resumes Analyzed</span>
        </div>
        <div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">{resumesCount}</span>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="col-span-1 md:col-span-3 p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between h-36 md:h-40"
      >
        <div className="flex justify-between items-start">
          <span className="text-sm text-gray-400">Mock Interviews</span>
        </div>
        <div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">{mockInterviewsCount}</span>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        onClick={() => navigate('/analyzer')}
        className="col-span-2 md:col-span-3 p-5 rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex flex-col items-center justify-center text-center cursor-pointer hover:opacity-90 transition-colors h-36 md:h-40 group relative overflow-hidden"
      >
        {/* Abstract Background for Card */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{
            backgroundImage: `url('https://cdn.pixabay.com/photo/2016/11/19/14/00/code-1839406_1280.jpg')`,
            backgroundSize: 'cover', backgroundPosition: 'center'
        }} />
        <div className="relative z-10 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
          <Plus className="text-white w-6 h-6" />
        </div>
        <span className="relative z-10 text-sm font-bold text-white tracking-wide">NEW ANALYSIS</span>
      </motion.div>

      {/* Analytics Visualization */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="col-span-2 md:col-span-8 p-5 md:p-6 rounded-2xl bg-[#121212] border border-white/10 relative overflow-hidden h-[260px] md:h-[340px] flex flex-col"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Score Trends</h3>
        <div className="flex-1 w-full" style={{ width: '100%', height: 300, minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScoreCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#475569" tick={{fill: '#94a3b8', fontSize: 12}} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" tick={{fill: '#94a3b8', fontSize: 12}} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#c7d2fe' }}
              />
              <Area type="monotone" dataKey="score" stroke="#22d3ee" fillOpacity={1} fill="url(#colorScoreCyan)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Image Banner */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        className="col-span-2 md:col-span-4 rounded-2xl border border-white/10 relative overflow-hidden h-[200px] md:h-[340px] flex flex-col justify-end"
      >
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('https://cdn.pixabay.com/photo/2017/07/31/11/21/people-2557396_1280.jpg')" }}></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
        <div className="relative z-20">
             <h3 className="text-xl font-bold text-white mb-2">Build Your Career</h3>
             <p className="text-gray-300 text-sm">Prepare to land your dream job with AI-powered resume feedback and live mock interviews.</p>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        className="col-span-2 md:col-span-12 p-5 md:p-6 rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Activities</h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
             <div className="animate-pulse flex flex-col space-y-4">
                 <div className="h-4 bg-white/10 rounded w-full"></div>
                 <div className="h-4 bg-white/10 rounded w-3/4"></div>
             </div>
          ) : (
          <>
            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {stats.resumes?.map((r: any, idx: number) => (
                <div key={`resume-m-${r.id || idx}`} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div>
                    <p className="text-white text-sm font-medium">Resume Analyzed</p>
                    <p className="text-gray-400 text-xs mt-0.5">Score: {r.score} · {new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => handleDeleteHistory("resume", r.id)} className="text-gray-500 hover:text-red-400 transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {stats.interviews?.map((i: any, idx: number) => (
                <div key={`interview-m-${i.id || idx}`} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div>
                    <p className="text-white text-sm font-medium">Mock Interview</p>
                    <p className="text-gray-400 text-xs mt-0.5">Role: {i.title} · {new Date(i.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => handleDeleteHistory("interview", i.id)} className="text-gray-500 hover:text-red-400 transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!stats.resumes?.length && !stats.interviews?.length) && (
                <p className="py-8 text-center text-gray-500 text-sm">No activity yet. Let's get started!</p>
              )}
            </div>
            {/* Desktop table */}
            <table className="hidden md:table w-full text-left border-collapse">
              <thead className="text-xs text-gray-500 uppercase border-b border-white/5">
                <tr>
                  <th className="py-3 px-4 font-medium">Action</th>
                  <th className="py-3 px-4 font-medium">Detail</th>
                  <th className="py-3 px-4 font-medium">Time</th>
                  <th className="py-3 px-4 font-medium text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-white/5">
                {stats.resumes?.map((r: any, idx: number) => (
                <tr key={`resume-${r.id || idx}`} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 px-4 text-white font-medium">Resume Analyzed</td>
                  <td className="py-4 px-4 text-gray-400 italic">Score: {r.score}</td>
                  <td className="py-4 px-4 text-gray-500">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="py-4 px-4 text-right">
                    <button onClick={() => handleDeleteHistory("resume", r.id)} className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4 ml-auto" />
                    </button>
                  </td>
                </tr>
                ))}
                {stats.interviews?.map((i: any, idx: number) => (
                <tr key={`interview-${i.id || idx}`} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 px-4 text-white font-medium">Mock Interview</td>
                  <td className="py-4 px-4 text-gray-400 italic">Role: {i.title}</td>
                  <td className="py-4 px-4 text-gray-500">{new Date(i.createdAt).toLocaleString()}</td>
                  <td className="py-4 px-4 text-right">
                    <button onClick={() => handleDeleteHistory("interview", i.id)} className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4 ml-auto" />
                    </button>
                  </td>
                </tr>
                ))}
                {(!stats.resumes?.length && !stats.interviews?.length) && (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-500">No activity yet. Let's get started!</td></tr>
                )}
              </tbody>
            </table>
          </>
          )}
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121212] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full relative flex flex-col"
            >
              <h3 className="text-xl font-bold text-white mb-2">Delete Activity</h3>
              <p className="text-slate-400 mb-6">Are you sure you want to delete this activity? This cannot be undone.</p>
              <div className="flex gap-3 justify-end mt-auto">
                <button 
                  onClick={() => setDeleteData(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteHistory}
                  className="px-4 py-2 bg-red-500/80 hover:bg-red-500 rounded-xl text-white font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
