import { ShieldOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
const Unauthorized = () => {
  const nav = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <ShieldOff size={28} className="text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
        <p className="text-slate-500 text-sm mb-6">You don't have permission to view this page.</p>
        <button onClick={() => nav(-1)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors">Go Back</button>
      </div>
    </div>
  );
};
export default Unauthorized;
