import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

const ForgotPassword = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 w-full max-w-sm text-center">
      <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Mail size={22} className="text-blue-600" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Forgot Password?</h2>
      <p className="text-sm text-slate-500 mb-6">Contact your administrator to reset your password.</p>
      <a
        href="mailto:admin@coreprescribingsolutions.co.uk"
        className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-bold transition-colors mb-3"
      >
        Email Administrator
      </a>
      <Link to="/login" className="text-sm text-blue-600 hover:underline font-semibold">
        ← Back to Login
      </Link>
    </div>
  </div>
);

export default ForgotPassword;