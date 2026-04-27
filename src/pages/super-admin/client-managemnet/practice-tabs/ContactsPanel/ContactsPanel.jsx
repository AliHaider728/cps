import { Edit2, Mail, Phone, Plus, Trash2, Users } from "lucide-react";

export const CONTACT_TYPE_STYLE = {
  decision_maker: "bg-red-50 text-red-700 border-red-200",
  finance: "bg-green-50 text-green-700 border-green-200",
  gp_lead: "bg-purple-50 text-purple-700 border-purple-200",
  practice_manager: "bg-blue-50 text-blue-700 border-blue-200",
  general: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function ContactsPanel({
  practice,
  onAddContact,
  onEditContact,
  onDeleteContact,
  onMassEmail,
  Btn,
}) {
  const contacts = practice.contacts || [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          {contacts.length} Contact{contacts.length !== 1 ? "s" : ""}
        </p>
        <div className="flex gap-2">
          <Btn variant="outline" size="sm" onClick={onMassEmail}>
            <Mail size={13} /> Mass Email
          </Btn>
          <Btn size="sm" onClick={onAddContact}>
            <Plus size={13} /> Add Contact
          </Btn>
        </div>
      </div>
      {contacts.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-14 flex flex-col items-center text-slate-400 gap-3">
          <Users size={32} className="opacity-40" />
          <p className="font-semibold">No contacts yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {contacts.map((c, idx) => (
            <div
              key={c._id || c.id || `${c.email || c.name || "contact"}-${idx}`}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 group hover:border-blue-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-slate-800 truncate">
                    {c.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{c.role}</p>
                </div>
                {c.type && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border capitalize shrink-0 ${CONTACT_TYPE_STYLE[c.type] || CONTACT_TYPE_STYLE.general}`}
                  >
                    {c.type.replace("_", " ")}
                  </span>
                )}
              </div>
              <div className="space-y-1.5 mb-3">
                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 truncate"
                  >
                    <Mail size={12} className="shrink-0" />
                    {c.email}
                  </a>
                )}
                {c.phone && (
                  <p className="flex items-center gap-2 text-sm text-slate-500">
                    <Phone size={12} className="shrink-0" />
                    {c.phone}
                  </p>
                )}
              </div>
              <div className="flex items-center pt-2.5 border-t border-slate-100">
                {c.isDecisionMaker && (
                  <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-md border border-red-200 mr-2">
                    Decision Maker
                  </span>
                )}
                <div className="ml-auto flex gap-1">
                  <button
                    onClick={() => onEditContact(c)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50"
                  >
                    <Edit2 size={11} /> Edit
                  </button>
                  <button
                    onClick={() => onDeleteContact(c._id || c.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={11} /> Del
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
