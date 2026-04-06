import { useState, useEffect } from "react";
import { UserPlus, Pencil, Trash2, X, Check, Loader2, ShieldCheck, Search, KeyRound } from "lucide-react";
import { getAllUsers, createUser, updateUser, deleteUser } from "../../api/ClientApi.js";

const ROLES = [
  { value: "super_admin", label: "Super Admin",       color: "bg-red-100 text-red-700"    },
  { value: "director",    label: "Director",           color: "bg-purple-100 text-purple-700" },
  { value: "ops_manager", label: "Operations Manager", color: "bg-orange-100 text-orange-700" },
  { value: "finance",     label: "Finance",            color: "bg-yellow-100 text-yellow-700" },
  { value: "training",    label: "Training & Dev",     color: "bg-green-100 text-green-700"  },
  { value: "workforce",   label: "Workforce / VA",     color: "bg-cyan-100 text-cyan-700"    },
  { value: "clinician",   label: "Clinician",          color: "bg-slate-100 text-slate-700"  },
];
const roleMeta = Object.fromEntries(ROLES.map(r => [r.value, r]));
const EMPTY = { name: "", email: "", password: "", role: "clinician", isActive: true };

export default function ManageUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [editId,  setEditId]  = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data.users);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setError(""); setModal("add"); };
  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: "", role: u.role, isActive: u.isActive });
    setEditId(u._id); setError(""); setModal("edit");
  };
  const close = () => { setModal(null); setError(""); };

  const save = async () => {
    if (!form.name || !form.email || (!editId && !form.password) || !form.role) {
      setError("All fields required"); return;
    }
    setSaving(true); setError("");
    try {
      const payload = { ...form };
      if (editId && !payload.password) delete payload.password;
      if (editId) await updateUser(editId, payload);
      else        await createUser(payload);
      await fetchUsers();
      close();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      await deleteUser(id);
      await fetchUsers();
    } catch {}
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.includes(search.toLowerCase())
  );

  return (
    <div className="max-w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={20} className="text-blue-600" />
            <h1 className="text-xl font-bold text-slate-800">Manage Users</h1>
          </div>
          <p className="text-sm text-slate-500">Add, edit or remove system users and assign roles</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white
            px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm w-fit">
          <UserPlus size={16} /> Add New User
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl
        px-3 py-2.5 mb-6 shadow-sm w-full max-w-sm">
        <Search size={15} className="text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or role…"
          className="text-sm text-slate-700 placeholder-slate-400 outline-none w-full bg-transparent"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Name","Email","Role","Status","Created","Actions"].map(h => (
                    <th key={h}
                      className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                      No users found
                    </td>
                  </tr>
                ) : filtered.map((u, i) => {
                  const meta = roleMeta[u.role];
                  return (
                    <tr key={u._id}
                      className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors
                        ${i === filtered.length - 1 ? "border-0" : ""}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
                            flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{u.name}</p>
                            {u.mustChangePassword && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold
                                text-amber-600 bg-amber-50 border border-amber-200
                                px-1.5 py-0.5 rounded-full mt-0.5">
                                <KeyRound size={10} /> Password not set
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 text-sm">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                          ${meta?.color || "bg-slate-100 text-slate-600"}`}>
                          {meta?.label || u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`flex items-center gap-1.5 w-fit text-xs font-bold
                          px-2.5 py-1 rounded-full
                          ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full
                            ${u.isActive ? "bg-green-500" : "bg-red-500"}`} />
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEdit(u)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400
                              hover:text-blue-600 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => del(u._id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400
                              hover:text-red-600 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">
                {modal === "add" ? "Add New User" : "Edit User"}
              </h2>
              <button onClick={close}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <X size={18} />
              </button>
            </div>

            {modal === "add" && (
              <div className="mb-4 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-xl
                text-xs text-blue-700 font-medium flex items-start gap-2">
                <KeyRound size={13} className="shrink-0 mt-0.5" />
                User will receive login credentials by email and will be asked to set a new password on first login.
              </div>
            )}

            {error && (
              <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl
                text-sm text-red-700 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {[
                { label: "Full Name",                                          name: "name",     type: "text",     ph: "e.g. Stacey Middlemass"            },
                { label: "Email Address",                                      name: "email",    type: "email",    ph: "user@coreprescribing.co.uk"        },
                { label: modal === "add" ? "Password" : "New Password (leave blank to keep)", name: "password", type: "password", ph: "Min 6 characters" },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={form[f.name]}
                    onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                    placeholder={f.ph}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm
                      text-slate-800 bg-slate-50 placeholder-slate-400
                      focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm
                    text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-500
                    focus:bg-white transition-all">
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              {modal === "edit" && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Account Active
                  </label>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={close}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl
                  text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={save} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600
                  hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2.5
                  rounded-xl text-sm font-bold transition-colors">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                {saving ? "Saving…" : modal === "add" ? "Create User" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}