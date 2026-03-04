import { SearchX } from "lucide-react";
import { useNavigate } from "react-router-dom";
const NotFound = () => {
  const nav = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <SearchX size={28} className="text-slate-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">404 — Not Found</h1>
        <p className="text-slate-500 text-sm mb-6">The page you're looking for doesn't exist.</p>
        <button onClick={() => nav("/login")} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors">Back to Login</button>
      </div>
    </div>
  );
};
export default NotFound;
