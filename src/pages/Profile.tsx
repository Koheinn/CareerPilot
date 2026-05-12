import { useState } from "react";
import { UserCircle, KeyRound, CheckCircle, AlertCircle } from "lucide-react";

export default function Profile({ user }: { user: any }) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters long.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to change password");

            setSuccess("Password updated successfully.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Profile Settings</h1>
                <p className="text-gray-400">Manage your account and preferences.</p>
            </div>

            <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center border border-white/10">
                        <UserCircle className="w-8 h-8 text-white/50" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white">{user.name}</h2>
                        <p className="text-gray-400">{user.email}</p>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 mt-8">
                    <div className="flex items-center gap-3 mb-6">
                        <KeyRound className="text-primary-500 w-5 h-5" />
                        <h3 className="text-lg font-semibold text-white">Change Password</h3>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
                        {error && (
                            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-xl text-sm border border-red-400/20">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center gap-2 text-primary-400 bg-primary-400/10 p-3 rounded-xl text-sm border border-primary-400/20">
                                <CheckCircle className="w-4 h-4" /> {success}
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Current Password</label>
                            <input 
                                type="password" 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
                            <input 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                required
                                minLength={8}
                            />
                        </div>
                        <div className="pb-2">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Confirm New Password</label>
                            <input 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                required
                                minLength={8}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-white text-black px-6 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
