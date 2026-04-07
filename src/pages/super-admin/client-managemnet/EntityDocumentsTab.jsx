import { useMemo, useState } from "react";
import { AlertCircle, ExternalLink, Eye, FileText, Filter, Loader2, Search, Upload } from "lucide-react";
import {
  useAddEntityDocumentUploads,
  useEntityDocuments,
  useUpdateEntityDocumentUpload,
} from "../../../hooks/useCompliance";

const STATUS_STYLE = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  uploaded: "bg-green-50 text-green-700 border-green-200",
  expired: "bg-red-50 text-red-700 border-red-200",
};

const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-GB") : "—";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

function UploadModal({ row, accent = "blue", onClose, onSave, saving }) {
  const [files, setFiles] = useState([]);
  const [expiryDate, setExpiryDate] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const buttonClass = accent === "teal" ? "bg-teal-600 hover:bg-teal-700" : "bg-blue-600 hover:bg-blue-700";

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError("Please choose at least one file");
      return;
    }
    setError("");
    const uploads = await Promise.all(
      files.map(async (file) => ({
        fileName: file.name,
        fileUrl: await readFileAsDataUrl(file),
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
        expiryDate: row.expirable ? expiryDate || null : null,
        notes,
        reference,
      }))
    );
    await onSave({ groupId: row.groupId, documentId: row.documentId, data: { uploads } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl flex flex-col max-h-[92vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Upload Documents</h3>
            <p className="text-sm text-slate-500 mt-1">{row.groupName} / {row.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">Close</button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-3 py-2">{error}</div>}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Files *</label>
            <input
              type="file"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files || []))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
            />
            {files.length > 0 && <p className="text-xs text-slate-400 mt-2">{files.length} file(s) selected</p>}
          </div>
          {row.expirable && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Expiry Date</label>
              <input type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400" />
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Reference / Metadata</label>
            <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="e.g. DBS renewal batch / certificate ref" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Notes</label>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 resize-none" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all ${buttonClass} disabled:opacity-50`}>
            {saving ? "Uploading..." : "Upload Files"}
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadsModal({ row, accent = "blue", onClose, onSave, saving }) {
  const [drafts, setDrafts] = useState(() => Object.fromEntries(
    (row.uploads || []).map((upload) => [upload.uploadId, {
      expiryDate: upload.expiryDate ? new Date(upload.expiryDate).toISOString().split("T")[0] : "",
      reference: upload.reference || "",
      notes: upload.notes || "",
    }])
  ));
  const buttonClass = accent === "teal" ? "bg-teal-600 hover:bg-teal-700" : "bg-blue-600 hover:bg-blue-700";

  const saveUpload = async (uploadId) => {
    await onSave({
      groupId: row.groupId,
      documentId: row.documentId,
      uploadId,
      data: drafts[uploadId],
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl flex flex-col max-h-[92vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Uploaded Files</h3>
            <p className="text-sm text-slate-500 mt-1">{row.groupName} / {row.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">Close</button>
        </div>
        <div className="overflow-auto">
          {row.uploads?.length > 0 ? (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["File", "Uploaded", "Status", "Expiry", "Reference", "Notes", "Preview", ""].map((label) => (
                    <th key={label} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {row.uploads.map((upload) => (
                  <tr key={upload.uploadId}>
                    <td className="px-4 py-3 font-semibold text-slate-800">{upload.fileName || "Unnamed file"}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(upload.uploadedAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border capitalize ${STATUS_STYLE[upload.status] || STATUS_STYLE.pending}`}>{upload.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={drafts[upload.uploadId]?.expiryDate || ""}
                        onChange={(event) => setDrafts((current) => ({ ...current, [upload.uploadId]: { ...current[upload.uploadId], expiryDate: event.target.value } }))}
                        disabled={!row.expirable}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 disabled:bg-slate-100"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={drafts[upload.uploadId]?.reference || ""}
                        onChange={(event) => setDrafts((current) => ({ ...current, [upload.uploadId]: { ...current[upload.uploadId], reference: event.target.value } }))}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <textarea
                        value={drafts[upload.uploadId]?.notes || ""}
                        onChange={(event) => setDrafts((current) => ({ ...current, [upload.uploadId]: { ...current[upload.uploadId], notes: event.target.value } }))}
                        rows={2}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 resize-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {upload.fileUrl ? (
                        <a href={upload.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700">
                          <Eye size={14} /> Preview
                        </a>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => saveUpload(upload.uploadId)} disabled={saving} className={`px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all ${buttonClass} disabled:opacity-50`}>
                        Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-10 text-center text-slate-400">No uploaded files yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EntityDocumentsTab({ entityType, entityId, accent = "blue" }) {
  const [filters, setFilters] = useState({ search: "", group: "", status: "" });
  const [uploadRow, setUploadRow] = useState(null);
  const [manageRow, setManageRow] = useState(null);
  const { data, isLoading, error } = useEntityDocuments(entityType, entityId);
  const addUploads = useAddEntityDocumentUploads(entityType, entityId);
  const updateUpload = useUpdateEntityDocumentUpload(entityType, entityId);

  const groups = data?.groups || [];
  const rows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return (data?.documents || []).filter((row) => {
      const matchesSearch = !query || [row.groupName, row.name, row.latestUpload?.fileName, row.latestUpload?.reference].filter(Boolean).join(" ").toLowerCase().includes(query);
      const matchesGroup = !filters.group || row.groupId === filters.group;
      const matchesStatus = !filters.status || row.status === filters.status;
      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [data?.documents, filters]);

  const summary = data?.summary || { total: 0, uploaded: 0, pending: 0, expired: 0 };
  const accentButton = accent === "teal" ? "bg-teal-600 hover:bg-teal-700" : "bg-blue-600 hover:bg-blue-700";

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-slate-400" /></div>;
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">Failed to load documents.</div>;
  }

  if (groups.length === 0) {
    return (
      <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-14 flex flex-col items-center text-slate-400 gap-3">
        <AlertCircle size={32} className="opacity-40" />
        <p className="font-semibold">No compliance groups are assigned yet</p>
        <p className="text-sm">Assign document groups from the list view or the Overview tab first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Assigned Document Groups</h3>
            <p className="text-sm text-slate-400 mt-1">Only document groups assigned in Client Management / Overview are shown here.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              ["Uploaded", summary.uploaded],
              ["Pending", summary.pending],
              ["Expired", summary.expired],
            ].map(([label, value]) => (
              <div key={label} className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 min-w-[84px]">
                <p className="text-lg font-bold text-slate-800">{value}</p>
                <p className="text-[11px] font-semibold text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {groups.map((group) => (
            <span key={group.groupId} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
              <FileText size={14} className="text-slate-400" />
              {group.groupName}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search by group, document, file, or reference..." className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white">
            <Filter size={13} className="text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-500">Group</span>
            <select value={filters.group} onChange={(event) => setFilters((current) => ({ ...current, group: event.target.value }))} className="text-sm bg-transparent outline-none cursor-pointer">
              <option value="">All</option>
              {groups.map((group) => <option key={group.groupId} value={group.groupId}>{group.groupName}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white">
            <Filter size={13} className="text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-500">Status</span>
            <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="text-sm bg-transparent outline-none cursor-pointer">
              <option value="">All</option>
              <option value="uploaded">Uploaded</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          {(filters.search || filters.group || filters.status) && (
            <button onClick={() => setFilters({ search: "", group: "", status: "" })} className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-14 text-center text-slate-400">
            <p className="font-semibold">No documents match the current filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Group", "Document", "Mandatory", "Uploads", "Latest File", "Expiry", "Status", "Actions"].map((label) => (
                    <th key={label} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={`${row.groupId}:${row.documentId}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">{row.groupName}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{row.name}</div>
                      <div className="text-xs text-slate-400 mt-1">{row.expirable ? "Expiry tracked" : "No expiry tracking"}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.mandatory ? "Mandatory" : "Optional"}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.uploadCount}</td>
                    <td className="px-4 py-3">
                      {row.latestUpload ? (
                        <div>
                          <div className="font-medium text-slate-700">{row.latestUpload.fileName}</div>
                          <div className="text-xs text-slate-400">{formatDate(row.latestUpload.uploadedAt)}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">No files uploaded</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(row.latestUpload?.expiryDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border capitalize ${STATUS_STYLE[row.status] || STATUS_STYLE.pending}`}>{row.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setUploadRow(row)} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all ${accentButton}`}>
                          <Upload size={13} /> Upload
                        </button>
                        <button onClick={() => setManageRow(row)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                          <ExternalLink size={13} /> Manage
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {uploadRow && (
        <UploadModal
          row={uploadRow}
          accent={accent}
          onClose={() => setUploadRow(null)}
          onSave={({ groupId, documentId, data }) => addUploads.mutateAsync({ groupId, documentId, data })}
          saving={addUploads.isPending}
        />
      )}

      {manageRow && (
        <UploadsModal
          row={manageRow}
          accent={accent}
          onClose={() => setManageRow(null)}
          onSave={({ groupId, documentId, uploadId, data }) => updateUpload.mutateAsync({ groupId, documentId, uploadId, data })}
          saving={updateUpload.isPending}
        />
      )}
    </div>
  );
}
