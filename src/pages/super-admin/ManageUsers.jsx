import { useMemo, useState } from "react";
import { UserPlus, Pencil, Trash2, X, Check, Loader2, ShieldCheck, Search, KeyRound } from "lucide-react";
import {
  useAllUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "../../hooks/useAuth";
import DataTable from "../../components/ui/DataTable";

const ROLES = [
  { value: "super_admin", label: "Super Admin", color: "bg-red-100 text-red-700" },
  { value: "director", label: "Director", color: "bg-purple-100 text-purple-700" },
  { value: "ops_manager", label: "Operations Manager", color: "bg-orange-100 text-orange-700" },
  { value: "finance", label: "Finance", color: "bg-yellow-100 text-yellow-700" },
  { value: "training", label: "Training & Dev", color: "bg-green-100 text-green-700" },
  { value: "workforce", label: "Workforce / VA", color: "bg-cyan-100 text-cyan-700" },
  { value: "clinician", label: "Clinician", color: "bg-slate-100 text-slate-700" },
];

const roleMeta = Object.fromEntries(ROLES.map((role) => [role.value, role]));
const EMPTY = { name: "", email: "", password: "", role: "clinician", isActive: true };

export default function ManageUsers() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);

  const { data, isLoading } = useAllUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const users = data?.users || [];

  const openAdd = () => {
    setForm(EMPTY);
    setEditId(null);
    setError("");
    setModal("add");
  };

  const openEdit = (user) => {
    setForm({ name: user.name, email: user.email, password: "", role: user.role, isActive: user.isActive });
    setEditId(user._id);
    setError("");
    setModal("edit");
  };

  const close = () => {
    setModal(null);
    setError("");
  };

  const save = async () => {
    if (!form.name || !form.email || (!editId && !form.password) || !form.role) {
      setError("All fields required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = { ...form };
      if (editId && !payload.password) delete payload.password;
      if (editId) {
        await updateUserMutation.mutateAsync({ id: editId, data: payload });
      } else {
        await createUserMutation.mutateAsync(payload);
      }
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
      await deleteUserMutation.mutateAsync(id);
    } catch {}
  };

  const filtered = useMemo(() => users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.role.includes(search.toLowerCase())
  ), [search, users]);

  const columns = [
    {
      header: "Name",
      id: "name",
      render: (user) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{user.name}</p>
            {user.mustChangePassword && (
              <span className="mt-0.5 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-600">
                <KeyRound size={10} /> Password not set
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Email",
      id: "email",
      render: (user) => user.email,
      cellClassName: "px-5 py-3.5 text-sm text-slate-600 align-top",
    },
    {
      header: "Role",
      id: "role",
      render: (user) => {
        const meta = roleMeta[user.role];
        return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${meta?.color || "bg-slate-100 text-slate-600"}`}>{meta?.label || user.role}</span>;
      },
    },
    {
      header: "Status",
      id: "status",
      render: (user) => (
        <span className={`flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-500"}`} />
          {user.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Created",
      id: "created",
      render: (user) => new Date(user.createdAt).toLocaleDateString("en-GB"),
      cellClassName: "px-5 py-3.5 whitespace-nowrap text-xs text-slate-500 align-top",
    },
    {
      header: "Actions",
      id: "actions",
      render: (user) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => openEdit(user)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600">
            <Pencil size={14} />
          </button>
          <button onClick={() => del(user._id)} disabled={deleteUserMutation.isPending} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40">
            <Trash2 size={14} />
          </button>
        </div>
      ),
      mobileLabel: "Actions",
      mobileCellClassName: "pt-1",
    },
  ];

  return (
    <div className="mx-auto max-w-full">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <ShieldCheck size={20} className="text-blue-600" />
            <h1 className="text-xl font-bold text-slate-800">Manage Users</h1>
          </div>
          <p className="text-sm text-slate-500">Add, edit or remove system users and assign roles</p>
        </div>
        <button onClick={openAdd} className="flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700">
          <UserPlus size={16} /> Add New User
        </button>
      </div>

      <div className="mb-6 flex w-full max-w-sm items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
        <Search size={15} className="shrink-0 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or role..."
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-blue-600" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          rowKey="_id"
          emptyTitle="No users found"
          initialPageSize={10}
          pageSizeOptions={[10, 20, 50]}
        />
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                {modal === "add" ? "Add New User" : "Edit User"}
              </h2>
              <button onClick={close} className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            {modal === "add" && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs font-medium text-blue-700">
                <KeyRound size={13} className="mt-0.5 shrink-0" />
                User will receive login credentials by email and will be asked to set a new password on first login.
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {[
                { label: "Full Name", name: "name", type: "text", ph: "e.g. Stacey Middlemass" },
                { label: "Email Address", name: "email", type: "email", ph: "user@coreprescribing.co.uk" },
                { label: modal === "add" ? "Password" : "New Password (leave blank to keep)", name: "password", type: "password", ph: "Min 6 characters" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={form[field.name]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                    placeholder={field.ph}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              ))}

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 transition-all focus:border-blue-500 focus:bg-white focus:outline-none"
                >
                  {ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                </select>
              </div>

              {modal === "edit" && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 cursor-pointer accent-blue-600"
                  />
                  <label htmlFor="isActive" className="cursor-pointer text-sm font-medium text-slate-700">
                    Account Active
                  </label>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={close} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={save} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-60">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                {saving ? "Saving..." : modal === "add" ? "Create User" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
