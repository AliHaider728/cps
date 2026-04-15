import { useMemo, useState, useRef } from "react";
import { AlertCircle, Edit2, Eye, FileText, Filter, Loader2, Search, Upload } from "lucide-react";
import {
  useAddEntityDocumentUploads,
  useDeleteEntityDocumentUpload,
  useEntityDocuments,
  useUpdateEntityDocumentUpload,
} from "../../../hooks/useCompliance";
import DataTable from "../../../components/ui/DataTable";


/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */
const STATUS_STYLE = {
  pending:  "border-amber-200 bg-amber-50 text-amber-700",
  uploaded: "border-green-200 bg-green-50 text-green-700",
  expired:  "border-red-200 bg-red-50 text-red-700",
};

const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-GB") : "—";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

/* ══════════════════════════════════════════════════════════
   FILTER CHIP
══════════════════════════════════════════════════════════ */
const FilterChip = ({ label, children }) => (
  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
    <Filter size={13} className="shrink-0 text-slate-400" />
    <span className="text-xs font-semibold text-slate-500">{label}</span>
    {children}
  </div>
);

/* ══════════════════════════════════════════════════════════
   UPLOAD MODAL — naya file upload karne ke liye
══════════════════════════════════════════════════════════ */
function UploadModal({ row, accent = "blue", onClose, onSave, saving }) {
  const [files, setFiles]           = useState([]);
  const [expiryDate, setExpiryDate] = useState("");
  const [reference, setReference]   = useState("");
  const [notes, setNotes]           = useState("");
  const [error, setError]           = useState("");
  const btnCls = accent === "teal" ? "bg-teal-600 hover:bg-teal-700" : "bg-blue-600 hover:bg-blue-700";

  const handleSubmit = async () => {
    if (files.length === 0) { setError("Please choose at least one file"); return; }
    setError("");
    const uploads = await Promise.all(
      files.map(async (file) => ({
        fileName:   file.name,
        fileUrl:    await readFileAsDataUrl(file),
        mimeType:   file.type || "application/octet-stream",
        fileSize:   file.size,
        expiryDate: expiryDate || null,
        notes,
        reference,
      }))
    );
    await onSave({ groupId: row.groupId, documentId: row.documentId, data: { uploads } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Upload Document</h3>
            <p className="mt-1 text-sm text-slate-500">{row.groupName} / {row.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-semibold">Close</button>
        </div>

        <div className="space-y-4 overflow-y-auto p-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Files */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Files *
            </label>
            <input
              type="file" multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
            />
            {files.length > 0 && (
              <p className="mt-2 text-xs text-slate-400">{files.length} file(s) selected</p>
            )}
          </div>

          {/* Expiry Date */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Expiry Date
            </label>
            <input
              type="date" value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>

          {/* Reference */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Reference / Metadata
            </label>
            <input
              value={reference} onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. DBS renewal batch / certificate ref"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Notes
            </label>
            <textarea
              value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all ${btnCls} disabled:opacity-50`}>
            {saving ? "Uploading..." : "Upload Files"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   BULK UPLOAD MODAL — ek group ke saare documents ek saath
══════════════════════════════════════════════════════════ */
function BulkUploadModal({ group, documents, accent = "blue", onClose, onSave, saving }) {
  // Per-document state: { [documentId]: { files, expiryDate, reference, notes } }
  const [docStates, setDocStates] = useState(() =>
    Object.fromEntries(
      documents.map((doc) => [doc.documentId, { files: [], expiryDate: "", reference: "", notes: "" }])
    )
  );
  const [error, setError]     = useState("");
  const [progress, setProgress] = useState(""); // feedback during upload

  const btnCls = accent === "teal" ? "bg-teal-600 hover:bg-teal-700" : "bg-blue-600 hover:bg-blue-700";

  const updateDoc = (documentId, field, value) =>
    setDocStates((c) => ({ ...c, [documentId]: { ...c[documentId], [field]: value } }));

  const anyFileSelected = Object.values(docStates).some((s) => s.files.length > 0);

  const handleSubmit = async () => {
    if (!anyFileSelected) { setError("Please select at least one file for any document"); return; }
    setError("");

    const docsWithFiles = documents.filter((doc) => docStates[doc.documentId].files.length > 0);

    for (let i = 0; i < docsWithFiles.length; i++) {
      const doc   = docsWithFiles[i];
      const state = docStates[doc.documentId];
      setProgress(`Uploading ${i + 1} / ${docsWithFiles.length}: ${doc.name}…`);

      const uploads = await Promise.all(
        state.files.map(async (file) => ({
          fileName:   file.name,
          fileUrl:    await readFileAsDataUrl(file),
          mimeType:   file.type || "application/octet-stream",
          fileSize:   file.size,
          expiryDate: state.expiryDate || null,
          notes:      state.notes,
          reference:  state.reference,
        }))
      );

      await onSave({ groupId: doc.groupId, documentId: doc.documentId, data: { uploads } });
    }

    setProgress("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Bulk Upload — {group.groupName}</h3>
            <p className="mt-1 text-sm text-slate-500">
              Upload files for all {documents.length} document(s) in this group at once.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-semibold">
            Close
          </button>
        </div>

        {/* Per-document rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {error && (
            <div className="mx-5 mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {documents.map((doc) => {
            const state = docStates[doc.documentId];
            return (
              <div key={doc.documentId} className="p-5 space-y-3">
                {/* Doc name + mandatory badge */}
                <div className="flex items-center gap-2">
                  <FileText size={14} className="shrink-0 text-slate-400" />
                  <span className="text-sm font-bold text-slate-800">{doc.name}</span>
                  {doc.mandatory && (
                    <span className="rounded-lg border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700">
                      Mandatory
                    </span>
                  )}
                  <span className={`ml-auto rounded-lg border px-2 py-0.5 text-xs font-bold capitalize ${STATUS_STYLE[doc.status] || STATUS_STYLE.pending}`}>
                    {doc.status}
                  </span>
                </div>

                {/* File picker */}
                <div>
                  <input
                    type="file" multiple
                    onChange={(e) => updateDoc(doc.documentId, "files", Array.from(e.target.files || []))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  />
                  {state.files.length > 0 && (
                    <p className="mt-1.5 text-xs text-slate-400">{state.files.length} file(s) selected</p>
                  )}
                </div>

                {/* Optional metadata — only show when files selected */}
                {state.files.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Expiry Date
                      </label>
                      <input type="date"
                        value={state.expiryDate}
                        onChange={(e) => updateDoc(doc.documentId, "expiryDate", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Reference
                      </label>
                      <input
                        value={state.reference}
                        placeholder="Cert ref / batch no."
                        onChange={(e) => updateDoc(doc.documentId, "reference", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Notes
                      </label>
                      <input
                        value={state.notes}
                        placeholder="Additional notes…"
                        onChange={(e) => updateDoc(doc.documentId, "notes", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-slate-100 px-6 py-4">
          {progress && (
            <p className="flex-1 text-xs text-slate-500 font-medium">{progress}</p>
          )}
          <div className="ml-auto flex gap-3">
            <button onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={saving || !anyFileSelected}
              className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all ${btnCls} disabled:opacity-50`}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {saving ? "Uploading…" : "Upload All"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   UPLOADS EDIT MODAL
    FIXED: Replace File option added
   — Edit button yahi kholega
   — uploaded files ki full details + replace karne ka option
══════════════════════════════════════════════════════════ */
function UploadsModal({ row, accent = "blue", onClose, onSave, onDelete, onAdd, saving }) {
  const [drafts, setDrafts] = useState(() =>
    Object.fromEntries(
      (row.uploads || []).map((u) => [u.uploadId, {
        expiryDate: u.expiryDate ? new Date(u.expiryDate).toISOString().split("T")[0] : "",
        reference:  u.reference || "",
        notes:      u.notes     || "",
      }])
    )
  );
  const [replacingId, setReplacingId] = useState(null);
  const fileInputRef = useRef(null);

  const btnCls   = accent === "teal" ? "bg-teal-600 hover:bg-teal-700" : "bg-blue-600 hover:bg-blue-700";
  const btnSmCls = accent === "teal"
    ? "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
    : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100";

  const saveUpload   = (uploadId) =>
    onSave({ groupId: row.groupId, documentId: row.documentId, uploadId, data: drafts[uploadId] });

  const deleteUpload = (uploadId) =>
    onDelete({ groupId: row.groupId, documentId: row.documentId, uploadId });

  const handleReplaceClick = (uploadId) => {
    setReplacingId(uploadId);
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !replacingId) return;

    const fileUrl = await readFileAsDataUrl(file);

    await onAdd({
      groupId:    row.groupId,
      documentId: row.documentId,
      data: {
        uploads: [{
          fileName:   file.name,
          fileUrl,
          mimeType:   file.type || "application/octet-stream",
          fileSize:   file.size,
          expiryDate: drafts[replacingId]?.expiryDate || null,
          notes:      drafts[replacingId]?.notes      || "",
          reference:  drafts[replacingId]?.reference  || "",
        }],
      },
    });

    await onDelete({ groupId: row.groupId, documentId: row.documentId, uploadId: replacingId });

    setReplacingId(null);
    e.target.value = "";
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelected}
      />

      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Edit Uploaded Files</h3>
            <p className="mt-1 text-sm text-slate-500">{row.groupName} / {row.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-semibold">
            Close
          </button>
        </div>

        {/* Files list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {(row.uploads || []).length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-slate-400">
              <FileText size={28} className="opacity-40" />
              <p className="text-sm font-semibold">No files uploaded yet</p>
            </div>
          ) : (
            (row.uploads || []).map((u) => (
              <div key={u.uploadId} className="p-5 space-y-4">

                {/* File info header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <FileText size={15} className="text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {u.fileName || "Unnamed file"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Uploaded: {formatDate(u.uploadedAt)}
                        {u.fileSize && ` · ${(u.fileSize / 1024).toFixed(1)} KB`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold capitalize ${STATUS_STYLE[u.status] || STATUS_STYLE.pending}`}>
                      {u.status}
                    </span>
                    {u.fileUrl && (
                      <a href={u.fileUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-all">
                        <Eye size={12} /> Preview
                      </a>
                    )}
                  </div>
                </div>

                {/* Editable fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Expiry Date
                    </label>
                    <input type="date"
                      value={drafts[u.uploadId]?.expiryDate || ""}
                      onChange={(e) => setDrafts((c) => ({ ...c, [u.uploadId]: { ...c[u.uploadId], expiryDate: e.target.value } }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-400 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Reference
                    </label>
                    <input
                      value={drafts[u.uploadId]?.reference || ""}
                      placeholder="Certificate ref / batch no."
                      onChange={(e) => setDrafts((c) => ({ ...c, [u.uploadId]: { ...c[u.uploadId], reference: e.target.value } }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-400 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Notes
                    </label>
                    <input
                      value={drafts[u.uploadId]?.notes || ""}
                      placeholder="Additional notes..."
                      onChange={(e) => setDrafts((c) => ({ ...c, [u.uploadId]: { ...c[u.uploadId], notes: e.target.value } }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-400 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => saveUpload(u.uploadId)}
                    disabled={saving}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all ${btnCls} disabled:opacity-50`}>
                    Save Changes
                  </button>

                  <button
                    onClick={() => handleReplaceClick(u.uploadId)}
                    disabled={saving}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${btnSmCls} disabled:opacity-50`}>
                    <Upload size={12} />
                    {replacingId === u.uploadId ? "Replacing..." : "Replace File"}
                  </button>

                  <button
                    onClick={() => deleteUpload(u.uploadId)}
                    disabled={saving}
                    className="rounded-xl border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition-all hover:bg-red-50 disabled:opacity-50">
                    Delete File
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4">
          <button onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function EntityDocumentsTab({ entityType, entityId, accent = "blue" }) {
  const [filters,     setFilters]     = useState({ search: "", group: "", status: "" });
  const [uploadRow,   setUploadRow]   = useState(null);
  const [manageRow,   setManageRow]   = useState(null);
  const [bulkGroup,   setBulkGroup]   = useState(null); // { groupId, groupName }

  const { data: apiData, isLoading, error } = useEntityDocuments(entityType, entityId);
  const addUploads   = useAddEntityDocumentUploads(entityType, entityId);
  const updateUpload = useUpdateEntityDocumentUpload(entityType, entityId);
  const deleteUpload = useDeleteEntityDocumentUpload(entityType, entityId);

  const data    = apiData || { groups: [], documents: [], summary: { total: 0, uploaded: 0, pending: 0, expired: 0 } };
  const groups  = data?.groups  || [];
  const summary = data?.summary || { total: 0, uploaded: 0, pending: 0, expired: 0 };

  const rows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return (data?.documents || []).filter((row) => {
      const matchesSearch = !query ||
        [row.groupName, row.name, row.latestUpload?.fileName, row.latestUpload?.reference]
          .filter(Boolean).join(" ").toLowerCase().includes(query);
      const matchesGroup  = !filters.group  || row.groupId === filters.group;
      const matchesStatus = !filters.status || row.status  === filters.status;
      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [data?.documents, filters]);

  // Bulk upload ke liye: selected group ke documents
  const bulkDocuments = useMemo(() => {
    if (!bulkGroup) return [];
    return (data?.documents || []).filter((doc) => doc.groupId === bulkGroup.groupId);
  }, [data?.documents, bulkGroup]);

  const accentButton   = accent === "teal" ? "bg-teal-600 hover:bg-teal-700" : "bg-blue-600 hover:bg-blue-700";
  const accentButtonSm = accent === "teal"
    ? "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
    : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100";

  const columns = [
    {
      header: "Group", id: "group",
      render: (row) => <span className="font-semibold text-slate-700">{row.groupName}</span>,
      cellClassName: "px-4 py-3 whitespace-nowrap text-slate-700 align-top",
    },
    {
      header: "Document", id: "document",
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800">{row.name}</div>
          <div className="mt-1 text-xs text-slate-400">
            {row.expirable ? "Expiry tracked" : "No expiry tracking"}
          </div>
        </div>
      ),
    },
    {
      header: "Mandatory", id: "mandatory",
      render: (row) => (
        <span className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${row.mandatory ? "border-purple-200 bg-purple-50 text-purple-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
          {row.mandatory ? "Mandatory" : "Optional"}
        </span>
      ),
      cellClassName: "px-4 py-3 whitespace-nowrap align-top",
    },
    {
      header: "Latest File", id: "latestFile",
      render: (row) => row.latestUpload ? (
        <div>
          <div className="font-medium text-slate-700 truncate max-w-[180px]">{row.latestUpload.fileName}</div>
          <div className="text-xs text-slate-400 mt-0.5">{formatDate(row.latestUpload.uploadedAt)}</div>
        </div>
      ) : <span className="text-slate-400 text-sm">No files yet</span>,
    },
    {
      header: "Expiry", id: "expiry",
      render: (row) => {
        if (!row.latestUpload?.expiryDate) return <span className="text-slate-400">—</span>;
        const isExpired = new Date(row.latestUpload.expiryDate) < new Date();
        return (
          <span className={isExpired ? "font-semibold text-red-600" : "text-slate-600"}>
            {formatDate(row.latestUpload.expiryDate)}
          </span>
        );
      },
      cellClassName: "px-4 py-3 whitespace-nowrap align-top",
    },
    {
      header: "Status", id: "status",
      render: (row) => (
        <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold capitalize ${STATUS_STYLE[row.status] || STATUS_STYLE.pending}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions", id: "actions",
      mobileLabel: "Actions", mobileCellClassName: "pt-1",
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">

          {/* Upload — jab bhi pending ya expired ho */}
          {row.status !== "uploaded" && (
            <button onClick={() => setUploadRow(row)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white transition-all ${accentButton}`}>
              <Upload size={13} /> Upload
            </button>
          )}

          {/* Edit — sirf jab koi file exist karti ho */}
          {row.uploadCount > 0 && (
            <button onClick={() => setManageRow(row)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${accentButtonSm}`}>
              <Edit2 size={13} /> Edit
            </button>
          )}

        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-700">Unable to load documents</p>
            <p className="mt-0.5 text-xs text-red-600">
              {error?.response?.data?.message || error.message || "Documents API request failed."}
            </p>
          </div>
        </div>
      )}

      {groups.length === 0 && !error ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-slate-400">
          <AlertCircle size={32} className="opacity-40" />
          <p className="font-semibold">No compliance groups are assigned yet</p>
          <p className="text-sm">Assign document groups from the Overview tab first.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Assigned Document Groups</h3>
              <p className="mt-1 text-sm text-slate-400">Only groups assigned in Overview are shown here.</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ["Uploaded", summary.uploaded, "text-green-600"],
                ["Pending",  summary.pending,  "text-amber-600"],
                ["Expired",  summary.expired,  "text-red-600"],
              ].map(([label, value, color]) => (
                <div key={label} className="min-w-[84px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                  <p className="text-[11px] font-semibold text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Group chips — Bulk Upload button har group ke saath */}
          <div className="mt-4 flex flex-wrap gap-2">
            {groups.map((group) => (
              <div key={group.groupId}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <FileText size={14} className="text-slate-400 shrink-0" />
                <span className="text-sm font-semibold text-slate-700">{group.groupName}</span>
                <button
                  onClick={() => setBulkGroup(group)}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-semibold transition-all ${accentButtonSm}`}>
                  <Upload size={11} />
                  Bulk Upload
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.search}
            onChange={(e) => setFilters((c) => ({ ...c, search: e.target.value }))}
            placeholder="Search by group, document, file, or reference..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm transition-all focus:border-blue-400 focus:bg-white focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip label="Group">
            <select value={filters.group} onChange={(e) => setFilters((c) => ({ ...c, group: e.target.value }))}
              className="cursor-pointer bg-transparent text-sm outline-none">
              <option value="">All</option>
              {groups.map((g) => <option key={g.groupId} value={g.groupId}>{g.groupName}</option>)}
            </select>
          </FilterChip>
          <FilterChip label="Status">
            <select value={filters.status} onChange={(e) => setFilters((c) => ({ ...c, status: e.target.value }))}
              className="cursor-pointer bg-transparent text-sm outline-none">
              <option value="">All</option>
              <option value="uploaded">Uploaded</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>
          </FilterChip>
          {(filters.search || filters.group || filters.status) && (
            <button onClick={() => setFilters({ search: "", group: "", status: "" })}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={rows}
        rowKey={(row) => `${row.groupId}:${row.documentId}`}
        loading={false}
        emptyTitle="No documents match the current filters"
        initialPageSize={10}
        pageSizeOptions={[10, 20, 50]}
      />

      {/* Upload Modal */}
      {uploadRow && (
        <UploadModal
          row={uploadRow} accent={accent}
          onClose={() => setUploadRow(null)}
          onSave={({ groupId, documentId, data }) => addUploads.mutateAsync({ groupId, documentId, data })}
          saving={addUploads.isPending}
        />
      )}

      {/* Edit Uploads Modal */}
      {manageRow && (
        <UploadsModal
          row={manageRow} accent={accent}
          onClose={() => setManageRow(null)}
          onSave={({ groupId, documentId, uploadId, data }) =>
            updateUpload.mutateAsync({ groupId, documentId, uploadId, data })}
          onDelete={({ groupId, documentId, uploadId }) =>
            deleteUpload.mutateAsync({ groupId, documentId, uploadId })}
          onAdd={({ groupId, documentId, data }) =>
            addUploads.mutateAsync({ groupId, documentId, data })}
          saving={updateUpload.isPending || deleteUpload.isPending || addUploads.isPending}
        />
      )}

      {/* Bulk Upload Modal */}
      {bulkGroup && (
        <BulkUploadModal
          group={bulkGroup}
          documents={bulkDocuments}
          accent={accent}
          onClose={() => setBulkGroup(null)}
          onSave={({ groupId, documentId, data }) => addUploads.mutateAsync({ groupId, documentId, data })}
          saving={addUploads.isPending}
        />
      )}
    </div>
  );
}