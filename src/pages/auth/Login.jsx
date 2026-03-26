import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import ForceChangePassword from "./ForceChangePassword.jsx";

const Login = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const [formData,      setFormData]      = useState({ email: "", password: "", rememberMe: false });
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [showPassword,  setShowPassword]  = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [countdown,     setCountdown]     = useState(0);

  // ── Force change password state ───────────────────────────────
  const [showForceChange, setShowForceChange] = useState(false);
  const [tempToken,       setTempToken]       = useState("");
  const [pendingRedirect, setPendingRedirect] = useState("");

  const timerRef = useRef(null);

  useEffect(() => {
    if (isRateLimited && countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(timerRef.current);
            setIsRateLimited(false);
            setError("");
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRateLimited, countdown]);

  const fmtCountdown = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (error && !isRateLimited) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRateLimited) return;
    setLoading(true);
    setError("");
    try {
      const result = await login(formData.email, formData.password);
      // login() se { redirectTo, mustChangePassword, token } milega
      if (result.mustChangePassword) {
        setTempToken(result.token);
        setPendingRedirect(result.redirectTo);
        setShowForceChange(true);
      } else {
        navigate(result.redirectTo);
      }
    } catch (err) {
      const status  = err.response?.status;
      const message = err.response?.data?.message || err.message || "Invalid email or password";
      if (status === 429) {
        setIsRateLimited(true);
        setCountdown(15 * 60);
        setError(message);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');
        .fn { font-family: 'Nunito', sans-serif; }
        .fp { font-family: 'Playfair Display', serif; }
        .blob { animation: float 8s ease-in-out infinite; }
        .blob-1 { animation-delay: 0s; } .blob-2 { animation-delay: -3s; } .blob-3 { animation-delay: -5s; }
        @keyframes float { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-28px) scale(1.05);} }
        .grid-overlay { background-image:linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px); background-size:48px 48px; }
        .shiny::after { content:""; position:absolute; top:0; left:-150%; width:150%; height:100%; background:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.75) 50%,rgba(255,255,255,0) 100%); animation:shine 3.5s linear infinite; }
        .shiny { position:relative; display:inline-block; overflow:hidden; }
        @keyframes shine { 0%{left:-150%;} 100%{left:150%;} }
        .ndot { animation:pdot 2s ease-in-out infinite; }
        @keyframes pdot { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.5;transform:scale(0.8);} }
        .spinner { width:18px;height:18px;border:2.5px solid rgba(255,255,255,0.35);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg);} }
        .btn-shine::after { content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.12) 0%,transparent 100%); }
        .ci:focus { border-color:#2563eb!important;box-shadow:0 0 0 3px rgba(37,99,235,0.1)!important;background:#fff!important;outline:none!important; }
        .ci:disabled { opacity:0.5; cursor:not-allowed; }
        .shake { animation:shake 0.4s ease-in-out; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        .countdown-ring { animation: ring-pulse 1s ease-in-out infinite; }
        @keyframes ring-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.3);} 50%{box-shadow:0 0 0 8px rgba(239,68,68,0);} }
      `}</style>

      {/* ── Force Change Password Modal ── */}
      {showForceChange && (
        <ForceChangePassword
          token={tempToken}
          onDone={() => {
            setShowForceChange(false);
            navigate(pendingRedirect);
          }}
        />
      )}

      <div className="fn min-h-screen flex bg-gray-50 overflow-hidden">

        {/* LEFT PANEL */}
        <div
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-end p-12"
          style={{
            backgroundImage: "url('https://i.pinimg.com/1200x/64/1c/ac/641cac9f98694e52723708948353b2f9.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 z-10" style={{ background: "linear-gradient(155deg,rgba(37,99,235,0.8) 0%,rgba(29,78,216,0.8) 40%,rgba(59,130,246,0.8) 70%,rgba(30,64,175,0.8) 100%)" }} />
          <div className="blob blob-1 absolute z-20 rounded-full opacity-15" style={{ width: 380, height: 380, background: "#bfdbfe", top: -80, right: -60, filter: "blur(60px)" }} />
          <div className="blob blob-2 absolute z-20 rounded-full opacity-15" style={{ width: 260, height: 260, background: "#93c5fd", bottom: 80, left: -40, filter: "blur(60px)" }} />
          <div className="blob blob-3 absolute z-20 rounded-full opacity-15" style={{ width: 200, height: 200, background: "#dbeafe", top: "40%", left: "30%", filter: "blur(60px)" }} />
          <div className="grid-overlay absolute inset-0 z-20" />
          <div className="relative z-30">
            <div className="flex items-center gap-3 mb-32">
              <img src="https://coreprescribingsolutions.co.uk/wp-content/themes/core-prescribing/images/core-prescribing-logo.png" alt="CPS" className="h-28 w-auto object-contain" />
            </div>
            <h1 className="fp text-4xl font-bold text-white leading-tight mb-5 tracking-tight" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
              Delivering <em className="italic text-blue-200">clinical excellence</em> across primary care.
            </h1>
            <p className="text-white text-base leading-relaxed mb-12 max-w-sm" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
              The CPS Intranet gives your team secure, centralised access to rota management, staff records, compliance tools, and PCN performance dashboards.
            </p>
            <div className="flex gap-3">
              {[
                { number: "25+",  label: "Years combined NHS experience" },
                { number: "PCNs", label: "Nationwide network supported" },
                { number: "100%", label: "Managed pharmacist model" },
              ].map((s, i) => (
                <div key={i} className="flex-1 rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" }}>
                  <div className="fp text-3xl font-bold text-blue-200 leading-none mb-1" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>{s.number}</div>
                  <div className="text-white text-xs leading-snug font-medium tracking-wide" style={{ opacity: 0.85, textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col justify-center items-center px-5 sm:px-8 md:px-12 py-8 bg-white relative overflow-y-auto">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 70% 10%,rgba(37,99,235,0.04) 0%,transparent 60%)" }} />
          <div className="w-full max-w-md relative z-10">

            <div className="flex items-center justify-center mb-8 lg:hidden">
              <img src="https://coreprescribingsolutions.co.uk/wp-content/themes/core-prescribing/images/core-prescribing-logo.png" alt="CPS" className="h-14 w-auto object-contain" />
            </div>

            <div className="mb-8">
              <div className="w-12 h-1 rounded mb-3" style={{ background: "linear-gradient(90deg,#2563eb,#bfdbfe)" }} />
              <h2 className="fp text-3xl sm:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Welcome back</h2>
              <p className="text-slate-500 text-sm sm:text-base">Sign in to your CPS Intranet account</p>
            </div>

            {error && (
              <div className={`mb-5 px-4 py-3 rounded-xl border shake ${isRateLimited ? "bg-orange-50 border-orange-200" : "bg-red-50 border-red-200"} flex items-start gap-3`}>
                {isRateLimited ? (
                  <svg className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${isRateLimited ? "text-orange-700" : "text-red-700"}`}>{error}</p>
                  {isRateLimited && countdown > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500 countdown-ring" />
                      <p className="text-xs text-orange-600 font-mono font-bold">Try again in {fmtCountdown(countdown)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <input name="email" type="email" required value={formData.email} onChange={handleChange} disabled={isRateLimited}
                    placeholder="you@coreprescribing.co.uk"
                    className="ci w-full pl-4 pr-11 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 placeholder-slate-400 transition-all duration-200" />
                  <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <input name="password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={handleChange} disabled={isRateLimited}
                    placeholder="Enter your password"
                    className="ci w-full pl-4 pr-11 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 placeholder-slate-400 transition-all duration-200" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isRateLimited}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer flex items-center disabled:cursor-not-allowed">
                    {showPassword
                      ? <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                      : <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-7">
                <div className="flex items-center gap-2">
                  <input name="rememberMe" type="checkbox" checked={formData.rememberMe} onChange={handleChange} className="w-4 h-4 cursor-pointer accent-blue-600" />
                  <label className="text-sm text-slate-500 cursor-pointer font-medium">Remember me</label>
                </div>
                <a href="/forgot-password" className="text-sm text-blue-600 font-semibold hover:text-blue-800 hover:underline transition-colors">Forgot password?</a>
              </div>

              <button type="submit" disabled={loading || isRateLimited}
                className="btn-shine w-full py-3.5 text-white rounded-xl font-bold text-base tracking-wide relative overflow-hidden transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed hover:enabled:-translate-y-px"
                style={{
                  background: isRateLimited ? "linear-gradient(135deg,#9ca3af 0%,#6b7280 100%)" : "linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)",
                  boxShadow: (loading || isRateLimited) ? "none" : "0 4px 14px rgba(37,99,235,0.3)",
                }}>
                <div className="flex items-center justify-center gap-2 relative z-10">
                  {loading ? (
                    <><div className="spinner" /><span>Signing in…</span></>
                  ) : isRateLimited ? (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg><span>Locked — {fmtCountdown(countdown)}</span></>
                  ) : (
                    <><span>Sign In</span><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>
                  )}
                </div>
              </button>

              <div className="flex items-center gap-3 my-7 text-slate-400 text-xs font-semibold tracking-widest">
                <div className="flex-1 h-px bg-slate-200" />OR<div className="flex-1 h-px bg-slate-200" />
              </div>

              <div className="text-center px-4 py-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-slate-500">
                Don't have access?{" "}
                <a href="mailto:admin@coreprescribingsolutions.co.uk" className="text-blue-600 font-bold hover:underline">Contact your administrator</a>
              </div>
            </form>

            <div className="mt-10 text-center">
              <span className="shiny text-xs font-semibold text-slate-400 uppercase tracking-widest">Powered by TecnoSphere</span>
              <div className="flex justify-center mt-4">
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5">
                  <div className="ndot w-2 h-2 rounded-full bg-blue-600" />
                  <span className="text-xs text-emerald-800 font-bold tracking-wide">NHS Primary Care Partner</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;