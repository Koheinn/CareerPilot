import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, FileText, UserCircle, LogOut, Bell, Settings } from "lucide-react";

export default function Layout({ user, setUser }: { user: any, setUser: any }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const fetchNotifs = () => {
      if (user) {
          fetch("/api/notifications", {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          })
          .then(res => res.json())
          .then(data => {
              if (data.notifications) setNotifications(data.notifications);
          })
          .catch(console.error);
      }
    };
    fetchNotifs();
    const intervalId = setInterval(fetchNotifs, 5000);
    return () => clearInterval(intervalId);
  }, [location.pathname, user]);

  const handleReadNotifications = async () => {
      setShowNotifications(!showNotifications);
      if (!showNotifications) {
          try {
              await fetch("/api/notifications/read", {
                  method: "POST",
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
              });
              setNotifications(notifications.map(n => ({...n, isRead: true})));
          } catch(err) {
              console.error(err);
          }
      }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = async () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    localStorage.removeItem("token");
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    navigate("/");
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Resume Analyzer", path: "/analyzer", icon: FileText },
    { name: "ATS Job Matcher", path: "/matcher", icon: FileText },
    { name: "Mock Interview", path: "/interview", icon: UserCircle },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#E0E0E0] font-sans selection:bg-cyan-500/30">
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-900/20 blur-[120px]" />
        </div>
        <main className="relative z-10 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    );
  }

  // Authenticated Layout matching the Sophisticated Dark theme
  return (
    <div className="flex h-screen w-full bg-[#050505] text-[#E0E0E0] font-sans overflow-hidden selection:bg-cyan-500/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#0A0A0A] flex flex-col z-20 hidden md:flex shrink-0">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-full"></div>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">CareerPilot AI</h1>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-r-lg transition-colors cursor-pointer ${
                  isActive 
                    ? "bg-white/5 border-l-4 border-cyan-400" 
                    : "hover:bg-white/5 opacity-60 hover:opacity-100 border-l-4 border-transparent"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-[#E0E0E0]'}`} />
                <span className={isActive ? "text-white font-medium" : ""}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full mt-4 flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors opacity-60 hover:opacity-100 cursor-pointer rounded-lg text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-0">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[10%] w-[30%] h-[30%] rounded-full bg-indigo-900/10 blur-[120px]" />
        </div>

        {/* Top Header */}
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between shrink-0 relative z-[100] bg-[#050505]/80 backdrop-blur-md">
          <div className="flex items-center md:hidden">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rounded-full"></div>
              </div>
            </Link>
          </div>
          <div className="hidden md:block">
            <h2 className="text-2xl font-semibold text-white tracking-tight">
                {location.pathname === "/dashboard" ? "Overview Dashboard" : "CareerPilot"}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div onClick={handleReadNotifications} className="cursor-pointer">
                  {unreadCount > 0 && (
                      <div className="w-4 h-4 bg-indigo-500 rounded-full absolute -top-1 -right-1 border-2 border-[#050505] flex items-center justify-center text-[10px] font-bold text-white">
                          {unreadCount}
                      </div>
                  )}
                  <Bell className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </div>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                  {showNotifications && (
                      <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-4 w-80 bg-[#121212] border border-white/10 rounded-2xl shadow-xl overflow-hidden z-[200] p-2"
                      >
                          <h3 className="px-4 py-2 text-sm font-semibold text-white border-b border-white/10">Recent Activity</h3>
                          <div className="max-h-64 overflow-y-auto mt-2 space-y-1 p-2">
                              {notifications.length === 0 ? (
                                  <p className="text-xs text-gray-500 text-center py-4">No recent activity.</p>
                              ) : notifications.map(notif => (
                                  <div key={notif.id} className="text-sm px-3 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                      <p className="text-white text-xs">{notif.message}</p>
                                      <span className="text-[10px] text-gray-500 mt-1 block">
                                          {new Date(notif.createdAt).toLocaleDateString()}
                                      </span>
                                  </div>
                              ))}
                          </div>
                      </motion.div>
                  )}
              </AnimatePresence>
            </div>
            
            <Link to="/profile" className="flex items-center gap-3 bg-white/5 py-2 px-4 rounded-full border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white text-xs">
                {user?.name?.substring(0, 2).toUpperCase() || 'CP'}
              </div>
              <span className="text-sm font-medium hidden md:block">{user?.name}</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto w-full relative z-0 px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
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
              <h3 className="text-xl font-bold text-white mb-2">Sign out</h3>
              <p className="text-slate-400 mb-6">Are you sure you want to sign out of your account?</p>
              <div className="flex gap-3 justify-end mt-auto">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmLogout}
                  className="px-4 py-2 bg-red-500/80 hover:bg-red-500 rounded-xl text-white font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
