import { useState } from "react";
import { KeyRound, Loader2, Check, Eye, EyeOff } from "lucide-react";
import { useChangePassword } from "../../hooks/useAuth.js";

export default function ForceChangePassword({ token, onDone }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const changePassword = useChangePassword();

  const handleSubmit = async () => {
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    try {
      await changePassword.mutateAsync({
        newPassword,
        config: { headers: { Authorization: `Bearer ${token}` } },
      });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <KeyRound size={22} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Set Your Password</h2>
          <p className="mt-1 text-center text-sm text-slate-500">
            Please set a new password before continuing.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Min 6 characters"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-10 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPwd((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={changePassword.isPending}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          {changePassword.isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Check size={15} />
          )}
          {changePassword.isPending ? "Saving..." : "Set Password & Continue"}
        </button>
      </div>
    </div>
  );
}
