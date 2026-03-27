// ── clientUtils.jsx (NOT .js — contains JSX) 

export const TYPE_COLORS = {
  email:         "bg-blue-100 text-blue-700",
  call:          "bg-green-100 text-green-700",
  meeting:       "bg-purple-100 text-purple-700",
  contract:      "bg-orange-100 text-orange-700",
  complaint:     "bg-red-100 text-red-700",
  system_access: "bg-cyan-100 text-cyan-700",
  note:          "bg-slate-100 text-slate-600",
};

export const CONTACT_TYPES = [
  "email","call","meeting","contract","complaint","system_access","note"
];

export const fmt = (d) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  });

export const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
      {label}
    </label>
    {children}
  </div>
);

export const Input = (props) => (
  <input
    {...props}
    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm
      bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
  />
);

export const Textarea = (props) => (
  <textarea
    {...props}
    rows={3}
    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm
      bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white
      transition-all resize-none"
  />
);

export const Btn = ({ onClick, variant = "primary", disabled, children, size = "md" }) => {
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2.5 text-sm" };
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    outline: "border border-slate-200 hover:bg-slate-50 text-slate-600",
    danger:  "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 rounded-xl font-bold transition-colors
        disabled:opacity-50 ${sizes[size]} ${variants[variant]}`}
    >
      {children}
    </button>
  );
};

export const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
        >
          ✕
        </button>
      </div>
      {children}
    </div>
  </div>
);