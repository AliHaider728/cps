import { useMemo, useState, useRef } from "react";
import {
  AlertCircle, Edit2, Eye, FileText, Filter,
  Loader2, Search, Upload, CheckSquare, Square, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  useAddEntityDocumentUploads,
  useDeleteEntityDocumentUpload,
  useEntityDocuments,
  useUpdateEntityDocumentUpload,
} from "../../../hooks/useCompliance";
import { uploadFilesToSupabase, uploadFileToSupabase } from "../../../lib/supabase.js"; // ✅ NEW
import DataTable from "../../../components/ui/DataTable";

/*  
   CONSTANTS
  */
const STATUS_STYLE = {
  pending:  "border-amber-200 bg-amber-50 text-amber-700",
  uploaded: "border-green-200 bg-green-50 text-green-700",
  expired:  "border-red-200 bg-red-50 text-red-700",
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "—";

// ✅ REMOVED: buildUploadFormData — no longer needed (we send JSON now)

// ✅ NEW: Upload files to Supabase first, then return a plain JSON payload
async function uploadFilesAndBuildPayload({ files, expiryDate, notes, reference, expirable }) {
  const uploaded = await uploadFilesToSupabase(files);
  return {
    uploads: uploaded.map((u) => ({
      fileName: u.fileName,
      fileUrl:  u.publicUrl,
      mimeType: u.mimeType,
      fileSize: u.fileSize,
    })),
    expiryDate: expirable ? (expiryDate || "") : "",
    notes:      notes     || "",
    reference:  reference || "",
  };
}

/*  
   FILTER CHIP
  */
const FilterChip = ({ label, children }) => (
  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
    <Filter size={13} className="shrink-0 text-slate-400" />
    <span className="text-xs font-semibold text-slate-500">{label}</span>
    {children}
  </div>
);

/*  
   EXPIRY FIELD — reusable
   expirable=true  → date picker
   expirable=false → "Non-Expirable" badge, no input
  */
const ExpiryField = ({ expirable, value, onChange, size = "md" }) => {
  const inputCls =
    size === "sm"
      ? "w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs focus:border-blue-400 focus:bg-white focus:outline-none transition-all"
      : "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-400 focus:bg-white focus:outline-none transition-all";

  if (!expirable) {
    return (
      <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-500">
        Non-Expirable
      </span>
    );
  }
  return (
    <input
      type="date"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    />
  );
};

/*  
   SINGLE UPLOAD MODAL
  */
function UploadModal({ row, accent = "blue", onClose, onSave, saving }) {
  const [files, setFiles]           = useState([]);
  const [expiryDate, setExpiryDate] = useState("");
  const [reference, setReference]   = useState("");
  const [notes, setNotes]           = useState("");
  const [error, setError]           = useState("");
  const [uploading, setUploading]   = useState(false); // ✅ NEW: track Supabase upload state

  const btnCls =
    accent === "teal" ? "bg-teal-600 hover:bg-teal-700" : "bg-blue-600 hover:bg-blue-700";

  // ✅ UPDATED: upload to Supabase first, then send JSON payload
  const handleSubmit = async () => {
    if (files.length === 0) { setError("Please choose at least one file"); return; }
    setError("");
    setUploading(true);
    try {
      const payload = await uploadFilesAndBuildPayload({
        files,
        expiryDate,
        notes,
        reference,
        expirable: row.expirable,
      });
      await onSave({ groupId: row.groupId, documentId: row.documentId, data: payload });
      onClose();
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const isBusy = saving || uploading;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Upload Document</h3>
            <p className="mt-1 text-sm text-slate-500">{row.groupName} / {row.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-semibold">
            Close
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

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

          {/* Expiry — always visible */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Expiry Date
            </label>
            <ExpiryField expirable={row.expirable} value={expiryDate} onChange={setExpiryDate} />
          </div>

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

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Notes
            </label>
            <textarea
              value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} disabled={isBusy}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isBusy}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all ${btnCls} disabled:opacity-50`}>
            {isBusy && <Loader2 size={14} className="animate-spin" />}
            {uploading ? "Uploading to storage..." : saving ? "Saving..." : "Upload Files"}
          </button>
        </div>
      </div>
    </div>
  );
}

/*  
   UPLOADS EDIT MODAL — Replace File option
  */
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
  const [replacingId, setReplacingId]   = useState(null);
  const [replaceError, setReplaceError] = useState(""); // ✅ NEW
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
    setReplaceError("");
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  // ✅ UPDATED: upload replacement file to Supabase first, then send JSON
  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !replacingId) return;
    try {
      const payload = await uploadFilesAndBuildPayload({
        files:      [file],
        expiryDate: drafts[replacingId]?.expiryDate || "",
        notes:      drafts[replacingId]?.notes      || "",
        reference:  drafts[replacingId]?.reference  || "",
        expirable:  row.expirable,
      });
      await onAdd({ groupId: row.groupId, documentId: row.documentId, data: payload });
      await onDelete({ groupId: row.groupId, documentId: row.documentId, uploadId: replacingId });
    } catch (err) {
      setReplaceError(err.message || "Replace failed");
    }
    setReplacingId(null);
    e.target.value = "";
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />

      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Edit Uploaded Files</h3>
            <p className="mt-1 text-sm text-slate-500">{row.groupName} / {row.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-semibold">Close</button>
        </div>

        {replaceError && (
          <div className="mx-5 mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {replaceError}
          </div>
        )}

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {(row.uploads || []).length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-slate-400">
              <FileText size={28} className="opacity-40" />
              <p className="text-sm font-semibold">No files uploaded yet</p>
            </div>
          ) : (
            (row.uploads || []).map((u) => (
              <div key={u.uploadId} className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <FileText size={15} className="text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{u.fileName || "Unnamed file"}</p>
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

                <div className={`grid grid-cols-1 gap-3 ${row.expirable ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Expiry Date
                    </label>
                    <ExpiryField
                      expirable={row.expirable}
                      value={drafts[u.uploadId]?.expiryDate || ""}
                      onChange={(v) => setDrafts((c) => ({ ...c, [u.uploadId]: { ...c[u.uploadId], expiryDate: v } }))}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Reference</label>
                    <input value={drafts[u.uploadId]?.reference || ""} placeholder="Certificate ref / batch no."
                      onChange={(e) => setDrafts((c) => ({ ...c, [u.uploadId]: { ...c[u.uploadId], reference: e.target.value } }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-400 focus:bg-white focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Notes</label>
                    <input value={drafts[u.uploadId]?.notes || ""} placeholder="Additional notes..."
                      onChange={(e) => setDrafts((c) => ({ ...c, [u.uploadId]: { ...c[u.uploadId], notes: e.target.value } }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-400 focus:bg-white focus:outline-none transition-all" />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button onClick={() => saveUpload(u.uploadId)} disabled={saving}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all ${btnCls} disabled:opacity-50`}>
                    Save Changes
                  </button>
                  <button onClick={() => handleReplaceClick(u.uploadId)} disabled={saving}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${btnSmCls} disabled:opacity-50`}>
                    <Upload size={12} />
                    {replacingId === u.uploadId ? "Replacing..." : "Replace File"}
                  </button>
                  <button onClick={() => deleteUpload(u.uploadId)} disabled={saving}
                    className="rounded-xl border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-all disabled:opacity-50">
                    Delete File
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-100 px-6 py-4">
          <button onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/*  
   BULK UPLOAD MODAL
  */
function BulkUploadModal({ allDocuments, accent = "blue", onClose, onSave, saving }) {
  const btnCls   = accent === "teal" ? "bg-teal-600 hover:bg-teal-700" : "bg-blue-600 hover:bg-blue-700";
  const btnSmCls = accent === "teal"
    ? "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
    : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100";

  const [step,      setStep]      = useState(1);
  const [selected,  setSelected]  = useState({});
  const [expanded,  setExpanded]  = useState({});
  const [docStates, setDocStates] = useState({});
  const [progress,  setProgress]  = useState("");
  const [error,     setError]     = useState("");
  const [uploading, setUploading] = useState(false); // ✅ NEW

  const uploadableDocuments = useMemo(
    () => allDocuments.filter((doc) => doc.status !== "uploaded"),
    [allDocuments]
  );

  const selectedIds = Object.keys(selected).filter((k) => selected[k]);

  const grouped = useMemo(() => {
    const map = {};
    uploadableDocuments.forEach((doc) => {
      if (!map[doc.groupId]) map[doc.groupId] = { groupId: doc.groupId, groupName: doc.groupName, docs: [] };
      map[doc.groupId].docs.push(doc);
    });
    return Object.values(map);
  }, [uploadableDocuments]);

  const toggleDoc   = (docId) => setSelected((c) => ({ ...c, [docId]: !c[docId] }));
  const toggleGroup = (groupId) => {
    const docs   = uploadableDocuments.filter((d) => d.groupId === groupId);
    const allSel = docs.every((d) => selected[d.documentId]);
    const next   = {};
    docs.forEach((d) => { next[d.documentId] = !allSel; });
    setSelected((c) => ({ ...c, ...next }));
  };
  const toggleExpand = (groupId) =>
    setExpanded((c) => ({ ...c, [groupId]: c[groupId] === false ? true : false }));
  const selectAll = () => {
    const next = {};
    uploadableDocuments.forEach((d) => { next[d.documentId] = true; });
    setSelected(next);
  };
  const clearAll = () => setSelected({});

  const goToUpload = () => {
    if (selectedIds.length === 0) { setError("Please select at least one document"); return; }
    setError("");
    const init = {};
    selectedIds.forEach((id) => { init[id] = { files: [], expiryDate: "", reference: "", notes: "" }; });
    setDocStates(init);
    setStep(2);
  };

  const updateDoc = (docId, field, value) =>
    setDocStates((c) => ({ ...c, [docId]: { ...c[docId], [field]: value } }));

  const anyFile = Object.values(docStates).some((s) => s.files?.length > 0);

  // ✅ UPDATED: upload each doc's files to Supabase, then send JSON
  const handleSubmit = async () => {
    const docsWithFiles = selectedIds.filter((id) => docStates[id]?.files?.length > 0);
    if (docsWithFiles.length === 0) { setError("Please select at least one file"); return; }
    setError("");
    setUploading(true);

    for (let i = 0; i < docsWithFiles.length; i++) {
      const docId = docsWithFiles[i];
      const doc   = uploadableDocuments.find((d) => d.documentId === docId);
      const state = docStates[docId];
      setProgress(`Uploading ${i + 1} / ${docsWithFiles.length}: ${doc?.name || docId}…`);

      try {
        const payload = await uploadFilesAndBuildPayload({
          files:     state.files,
          expiryDate: state.expiryDate,
          notes:     state.notes,
          reference: state.reference,
          expirable: doc?.expirable,
        });
        await onSave({ groupId: doc.groupId, documentId: docId, data: payload });
      } catch (err) {
        setError(`Failed on "${doc?.name}": ${err.message}`);
        setProgress("");
        setUploading(false);
        return;
      }
    }

    setProgress("");
    setUploading(false);
    onClose();
  };

  const isBusy      = saving || uploading;
  const selectedDocs = uploadableDocuments.filter((d) => selected[d.documentId]);

  if (uploadableDocuments.length === 0) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="flex max-h-[92vh] w-full max-w-md flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-bold text-slate-800">Bulk Upload</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-semibold">Close</button>
          </div>
          <div className="flex flex-col items-center gap-3 py-14 text-slate-400 px-6 text-center">
            <CheckSquare size={32} className="text-green-500 opacity-70" />
            <p className="font-semibold text-slate-700">All documents are already uploaded!</p>
            <p className="text-sm">There are no pending or expired documents left to upload.</p>
          </div>
          <div className="border-t border-slate-100 px-6 py-4">
            <button onClick={onClose}
              className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {step === 1
                ? `Bulk Upload — Select Documents (${uploadableDocuments.length} pending/expired)`
                : `Bulk Upload — ${selectedIds.length} Document${selectedIds.length !== 1 ? "s" : ""} Selected`}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {step === 1
                ? "Only pending and expired documents are shown"
                : "Add files and metadata for each selected document"}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-semibold">
            Close
          </button>
        </div>

        {/* ── STEP 1: checkbox selection ── */}
        {step === 1 && (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-3">
              <p className="text-xs font-semibold text-slate-500">
                {selectedIds.length} of {uploadableDocuments.length} selected
              </p>
              <div className="flex gap-2">
                <button onClick={selectAll}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${btnSmCls}`}>
                  Select All
                </button>
                <button onClick={clearAll}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                  Clear
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {error && (
                <div className="mx-5 mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              {grouped.map((grp) => {
                const allGroupSel  = grp.docs.every((d) => selected[d.documentId]);
                const someGroupSel = grp.docs.some((d) => selected[d.documentId]);
                const isOpen       = expanded[grp.groupId] !== false;

                return (
                  <div key={grp.groupId} className="border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-3 bg-slate-50 px-5 py-3">
                      <button
                        onClick={() => toggleGroup(grp.groupId)}
                        className="shrink-0 text-slate-400 hover:text-blue-600 transition-colors">
                        {allGroupSel
                          ? <CheckSquare size={16} className="text-blue-600" />
                          : someGroupSel
                            ? <CheckSquare size={16} className="text-blue-300" />
                            : <Square size={16} />}
                      </button>
                      <span className="flex-1 text-sm font-bold text-slate-700">{grp.groupName}</span>
                      <span className="text-xs text-slate-400 mr-2">
                        {grp.docs.length} doc{grp.docs.length !== 1 ? "s" : ""}
                      </span>
                      <button
                        onClick={() => toggleExpand(grp.groupId)}
                        className="text-slate-400 hover:text-slate-600 transition-colors">
                        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>

                    {isOpen && grp.docs.map((doc) => (
                      <div
                        key={doc.documentId}
                        onClick={() => toggleDoc(doc.documentId)}
                        className={`flex cursor-pointer items-center gap-4 px-5 py-3.5 transition-colors border-t border-slate-50
                          ${selected[doc.documentId] ? "bg-blue-50/60" : "hover:bg-slate-50"}`}>
                        <div className="shrink-0">
                          {selected[doc.documentId]
                            ? <CheckSquare size={16} className="text-blue-600" />
                            : <Square size={16} className="text-slate-300" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{doc.name}</p>
                          <div className="mt-0.5 flex items-center gap-2 flex-wrap">
                            {doc.mandatory && (
                              <span className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                                Mandatory
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">
                              {doc.expirable ? "Expiry tracked" : "Non-Expirable"}
                            </span>
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-lg border px-2 py-0.5 text-xs font-bold capitalize ${STATUS_STYLE[doc.status] || STATUS_STYLE.pending}`}>
                          {doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={onClose}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button
                onClick={goToUpload}
                disabled={selectedIds.length === 0}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all ${btnCls} disabled:opacity-40`}>
                Next — Upload {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2: upload form ── */}
        {step === 2 && (
          <>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {error && (
                <div className="mx-5 mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              {selectedDocs.map((doc) => {
                const state    = docStates[doc.documentId] || { files: [], expiryDate: "", reference: "", notes: "" };
                const gridCols = doc.expirable ? "sm:grid-cols-3" : "sm:grid-cols-2";
                return (
                  <div key={doc.documentId} className="p-5 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <FileText size={14} className="shrink-0 text-slate-400" />
                      <span className="text-sm font-bold text-slate-800">{doc.name}</span>
                      <span className="text-xs text-slate-400">{doc.groupName}</span>
                      {doc.mandatory && (
                        <span className="rounded-lg border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700">
                          Mandatory
                        </span>
                      )}
                      {!doc.expirable && (
                        <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-500">
                          Non-Expirable
                        </span>
                      )}
                      <span className={`ml-auto rounded-lg border px-2 py-0.5 text-xs font-bold capitalize ${STATUS_STYLE[doc.status] || STATUS_STYLE.pending}`}>
                        {doc.status}
                      </span>
                    </div>

                    <input
                      type="file" multiple
                      onChange={(e) => updateDoc(doc.documentId, "files", Array.from(e.target.files || []))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    />
                    {state.files.length > 0 && (
                      <p className="text-xs text-slate-400">{state.files.length} file(s) selected</p>
                    )}

                    <div className={`grid grid-cols-1 gap-3 ${gridCols}`}>
                      {doc.expirable && (
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">
                            Expiry Date
                          </label>
                          <ExpiryField
                            expirable={true}
                            value={state.expiryDate}
                            onChange={(v) => updateDoc(doc.documentId, "expiryDate", v)}
                            size="sm"
                          />
                        </div>
                      )}
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">
                          Reference
                        </label>
                        <input value={state.reference} placeholder="Cert ref / batch no."
                          onChange={(e) => updateDoc(doc.documentId, "reference", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">
                          Notes
                        </label>
                        <input value={state.notes} placeholder="Additional notes…"
                          onChange={(e) => updateDoc(doc.documentId, "notes", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={() => { setStep(1); setError(""); }} disabled={isBusy}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50">
                ← Back
              </button>
              {progress && (
                <p className="flex-1 truncate text-xs font-medium text-slate-500">{progress}</p>
              )}
              <div className="ml-auto flex gap-3">
                <button onClick={onClose} disabled={isBusy}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50">
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isBusy || !anyFile}
                  className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all ${btnCls} disabled:opacity-50`}>
                  {isBusy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {uploading ? "Uploading to storage…" : saving ? "Saving…" : "Upload All"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/*  
   MAIN COMPONENT
  */
export default function EntityDocumentsTab({ entityType, entityId, accent = "blue" }) {
  const [filters,   setFilters]   = useState({ search: "", group: "", status: "" });
  const [uploadRow, setUploadRow] = useState(null);
  const [manageRow, setManageRow] = useState(null);
  const [bulkOpen,  setBulkOpen]  = useState(false);

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
            {row.expirable ? "Expiry tracked" : "Non-Expirable"}
          </div>
        </div>
      ),
    },
    {
      header: "Mandatory", id: "mandatory",
      render: (row) => (
        <span className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${row.mandatory ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
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
        if (!row.expirable)
          return <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-500">Non-Expirable</span>;
        if (!row.latestUpload?.expiryDate)
          return <span className="text-slate-400">—</span>;
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
          {row.status !== "uploaded" && (
            <button onClick={() => setUploadRow(row)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white transition-all ${accentButton}`}>
              <Upload size={13} /> Upload
            </button>
          )}
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
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Assigned Document Groups
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Only groups assigned in Overview are shown here.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  ["Uploaded", summary.uploaded, "text-green-600"],
                  ["Pending",  summary.pending,  "text-amber-600"],
                  ["Expired",  summary.expired,  "text-red-600"],
                ].map(([label, value, color]) => (
                  <div key={label} className="min-w-[76px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className={`text-lg font-bold ${color}`}>{value}</p>
                    <p className="text-[11px] font-semibold text-slate-500">{label}</p>
                  </div>
                ))}
              </div>

              {(data?.documents || []).length > 0 && (
                <button
                  onClick={() => setBulkOpen(true)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all ${accentButton}`}>
                  <Upload size={14} />
                  Bulk Upload
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {groups.map((group) => (
              <span key={group.groupId}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                <FileText size={14} className="text-slate-400" />
                {group.groupName}
              </span>
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
            <select value={filters.group}
              onChange={(e) => setFilters((c) => ({ ...c, group: e.target.value }))}
              className="cursor-pointer bg-transparent text-sm outline-none">
              <option value="">All</option>
              {groups.map((g) => <option key={g.groupId} value={g.groupId}>{g.groupName}</option>)}
            </select>
          </FilterChip>
          <FilterChip label="Status">
            <select value={filters.status}
              onChange={(e) => setFilters((c) => ({ ...c, status: e.target.value }))}
              className="cursor-pointer bg-transparent text-sm outline-none">
              <option value="">All</option>
              <option value="uploaded">Uploaded</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>
          </FilterChip>
          {(filters.search || filters.group || filters.status) && (
            <button onClick={() => setFilters({ search: "", group: "", status: "" })}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
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

      {/* Single Upload Modal */}
      {uploadRow && (
        <UploadModal
          row={uploadRow} accent={accent}
          onClose={() => setUploadRow(null)}
          onSave={({ groupId, documentId, data: d }) =>
            addUploads.mutateAsync({ groupId, documentId, data: d })}
          saving={addUploads.isPending}
        />
      )}

      {/* Edit Uploads Modal */}
      {manageRow && (
        <UploadsModal
          row={manageRow} accent={accent}
          onClose={() => setManageRow(null)}
          onSave={({ groupId, documentId, uploadId, data: d }) =>
            updateUpload.mutateAsync({ groupId, documentId, uploadId, data: d })}
          onDelete={({ groupId, documentId, uploadId }) =>
            deleteUpload.mutateAsync({ groupId, documentId, uploadId })}
          onAdd={({ groupId, documentId, data: d }) =>
            addUploads.mutateAsync({ groupId, documentId, data: d })}
          saving={updateUpload.isPending || deleteUpload.isPending || addUploads.isPending}
        />
      )}

      {/* Bulk Upload Modal */}
      {bulkOpen && (
        <BulkUploadModal
          allDocuments={data?.documents || []}
          accent={accent}
          onClose={() => setBulkOpen(false)}
          onSave={({ groupId, documentId, data: d }) =>
            addUploads.mutateAsync({ groupId, documentId, data: d })}
          saving={addUploads.isPending}
        />
      )}
    </div>
  );
}