import { useState } from "react";
import axios from "axios";
import { KeyRound, Loader2, Check, Eye, EyeOff } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function ForceChangePassword({ token, onDone }) {
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd,         setShowPwd]         = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [error,           setError]           = useState("");

  const handleSubmit = async () => {
    if (newPassword.length < 6)      { setError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }

    setSaving(true); setError("");
    try {
      await axios.put(
        `${API}/auth/change-password`,
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onDone(); // aage redirect karo
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <KeyRound size={22} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Set Your Password</h2>
          <p className="text-sm text-slate-500 text-center mt-1">
            Please set a new password before continuing.
          </p>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm pr-10 bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPwd(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-xl font-bold text-sm transition-colors"
        >
          {saving ? <Loader2 size={15} className="animate-spin"/> : <Check size={15}/>}
          {saving ? "Saving…" : "Set Password & Continue"}
        </button>
      </div>
    </div>
  );
}