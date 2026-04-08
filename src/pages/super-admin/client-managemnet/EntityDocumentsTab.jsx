import { useMemo, useState } from "react";
import { AlertCircle, ExternalLink, Eye, FileText, Filter, Loader2, Search, Upload } from "lucide-react";
import {
  useAddEntityDocumentUploads,
  useEntityDocuments,
  useUpdateEntityDocumentUpload,
} from "../../../hooks/useCompliance";
import DataTable from "../../../components/ui/DataTable";

const STATUS_STYLE = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  uploaded: "border-green-200 bg-green-50 text-green-700",
  expired: "border-red-200 bg-red-50 text-red-700",
};

const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-GB") : "—";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

const FilterChip = ({ label, children }) => (
  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
    <Filter size={13} className="shrink-0 text-slate-400" />
    <span className="text-xs font-semibold text-slate-500">{label}</span>
    {children}
  </div>
);

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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Upload Documents</h3>
            <p className="mt-1 text-sm text-slate-500">{row.groupName} / {row.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">Close</button>
        </div>
        <div className="space-y-4 overflow-y-auto p-6">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Files *</label>
            <input
              type="file"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files || []))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
            />
            {files.length > 0 && <p className="mt-2 text-xs text-slate-400">{files.length} file(s) selected</p>}
          </div>
          {row.expirable && (
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Expiry Date</label>
              <input type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none" />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Reference / Metadata</label>
            <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="e.g. DBS renewal batch / certificate ref" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Notes</label>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none" />
          </div>
        </div>
        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all ${buttonClass} disabled:opacity-50`}>
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

  const columns = [
    {
      header: "File",
      id: "file",
      render: (upload) => <span className="font-semibold text-slate-800">{upload.fileName || "Unnamed file"}</span>,
    },
    {
      header: "Uploaded",
      id: "uploadedAt",
      render: (upload) => formatDate(upload.uploadedAt),
      cellClassName: "px-4 py-3 whitespace-nowrap text-slate-600 align-top",
    },
    {
      header: "Status",
      id: "status",
      render: (upload) => (
        <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold capitalize ${STATUS_STYLE[upload.status] || STATUS_STYLE.pending}`}>{upload.status}</span>
      ),
    },
    {
      header: "Expiry",
      id: "expiry",
      render: (upload) => (
        <input
          type="date"
          value={drafts[upload.uploadId]?.expiryDate || ""}
          onChange={(event) => setDrafts((current) => ({ ...current, [upload.uploadId]: { ...current[upload.uploadId], expiryDate: event.target.value } }))}
          disabled={!row.expirable}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:border-blue-400 focus:outline-none disabled:bg-slate-100"
        />
      ),
      mobileLabel: "Expiry / metadata",
      mobileRender: (upload) => (
        <div className="space-y-3">
          <input
            type="date"
            value={drafts[upload.uploadId]?.expiryDate || ""}
            onChange={(event) => setDrafts((current) => ({ ...current, [upload.uploadId]: { ...current[upload.uploadId], expiryDate: event.target.value } }))}
            disabled={!row.expirable}
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:border-blue-400 focus:outline-none disabled:bg-slate-100"
          />
          <input
            value={drafts[upload.uploadId]?.reference || ""}
            onChange={(event) => setDrafts((current) => ({ ...current, [upload.uploadId]: { ...current[upload.uploadId], reference: event.target.value } }))}
            placeholder="Reference"
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:border-blue-400 focus:outline-none"
          />
          <textarea
            value={drafts[upload.uploadId]?.notes || ""}
            onChange={(event) => setDrafts((current) => ({ ...current, [upload.uploadId]: { ...current[upload.uploadId], notes: event.target.value } }))}
            rows={2}
            placeholder="Notes"
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:border-blue-400 focus:outline-none"
          />
        </div>
      ),
    },
    {
      header: "Reference",
      id: "reference",
      render: (upload) => (
        <input
          value={drafts[upload.uploadId]?.reference || ""}
          onChange={(event) => setDrafts((current) => ({ ...current, [upload.uploadId]: { ...current[upload.uploadId], reference: event.target.value } }))}
          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:border-blue-400 focus:outline-none"
        />
      ),
      hideOnMobile: true,
    },
    {
      header: "Notes",
      id: "notes",
      render: (upload) => (
        <textarea
          value={drafts[upload.uploadId]?.notes || ""}
          onChange={(event) => setDrafts((current) => ({ ...current, [upload.uploadId]: { ...current[upload.uploadId], notes: event.target.value } }))}
          rows={2}
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:border-blue-400 focus:outline-none"
        />
      ),
      hideOnMobile: true,
    },
    {
      header: "Preview",
      id: "preview",
      render: (upload) => upload.fileUrl ? (
        <a href={upload.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700">
          <Eye size={14} /> Preview
        </a>
      ) : "—",
    },
    {
      header: "",
      id: "save",
      render: (upload) => (
        <button onClick={() => saveUpload(upload.uploadId)} disabled={saving} className={`rounded-xl px-3 py-2 text-xs font-semibold text-white transition-all ${buttonClass} disabled:opacity-50`}>
          Save
        </button>
      ),
      mobileLabel: "Save",
    },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Uploaded Files</h3>
            <p className="mt-1 text-sm text-slate-500">{row.groupName} / {row.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">Close</button>
        </div>
        <div className="overflow-auto">
          <DataTable
            columns={columns}
            data={row.uploads || []}
            rowKey="uploadId"
            loading={false}
            emptyTitle="No uploaded files yet"
            pagination={(row.uploads || []).length > 5}
            initialPageSize={5}
            pageSizeOptions={[5, 10, 20]}
            className="rounded-none border-0 shadow-none"
          />
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

  const columns = [
    {
      header: "Group",
      id: "group",
      render: (row) => <span className="font-semibold text-slate-700">{row.groupName}</span>,
      cellClassName: "px-4 py-3 whitespace-nowrap text-slate-700 align-top",
    },
    {
      header: "Document",
      id: "document",
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800">{row.name}</div>
          <div className="mt-1 text-xs text-slate-400">{row.expirable ? "Expiry tracked" : "No expiry tracking"}</div>
        </div>
      ),
    },
    {
      header: "Mandatory",
      id: "mandatory",
      render: (row) => row.mandatory ? "Mandatory" : "Optional",
      cellClassName: "px-4 py-3 whitespace-nowrap text-slate-600 align-top",
    },
    {
      header: "Uploads",
      id: "uploads",
      render: (row) => row.uploadCount,
      cellClassName: "px-4 py-3 whitespace-nowrap text-slate-600 align-top",
    },
    {
      header: "Latest File",
      id: "latestFile",
      render: (row) => row.latestUpload ? (
        <div>
          <div className="font-medium text-slate-700">{row.latestUpload.fileName}</div>
          <div className="text-xs text-slate-400">{formatDate(row.latestUpload.uploadedAt)}</div>
        </div>
      ) : (
        <span className="text-slate-400">No files uploaded</span>
      ),
    },
    {
      header: "Expiry",
      id: "expiry",
      render: (row) => formatDate(row.latestUpload?.expiryDate),
      cellClassName: "px-4 py-3 whitespace-nowrap text-slate-600 align-top",
    },
    {
      header: "Status",
      id: "status",
      render: (row) => (
        <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold capitalize ${STATUS_STYLE[row.status] || STATUS_STYLE.pending}`}>{row.status}</span>
      ),
    },
    {
      header: "Actions",
      id: "actions",
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setUploadRow(row)} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white transition-all ${accentButton}`}>
            <Upload size={13} /> Upload
          </button>
          <button onClick={() => setManageRow(row)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50">
            <ExternalLink size={13} /> Manage
          </button>
        </div>
      ),
      mobileLabel: "Actions",
      mobileCellClassName: "pt-1",
    },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-slate-400" /></div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">Failed to load documents.</div>;
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-slate-400">
        <AlertCircle size={32} className="opacity-40" />
        <p className="font-semibold">No compliance groups are assigned yet</p>
        <p className="text-sm">Assign document groups from the list view or the Overview tab first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Assigned Document Groups</h3>
            <p className="mt-1 text-sm text-slate-400">Only document groups assigned in Client Management / Overview are shown here.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              ["Uploaded", summary.uploaded],
              ["Pending", summary.pending],
              ["Expired", summary.expired],
            ].map(([label, value]) => (
              <div key={label} className="min-w-[84px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-lg font-bold text-slate-800">{value}</p>
                <p className="text-[11px] font-semibold text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {groups.map((group) => (
            <span key={group.groupId} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
              <FileText size={14} className="text-slate-400" />
              {group.groupName}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search by group, document, file, or reference..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm transition-all focus:border-blue-400 focus:bg-white focus:outline-none" />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip label="Group">
            <select value={filters.group} onChange={(event) => setFilters((current) => ({ ...current, group: event.target.value }))} className="cursor-pointer bg-transparent text-sm outline-none">
              <option value="">All</option>
              {groups.map((group) => <option key={group.groupId} value={group.groupId}>{group.groupName}</option>)}
            </select>
          </FilterChip>
          <FilterChip label="Status">
            <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="cursor-pointer bg-transparent text-sm outline-none">
              <option value="">All</option>
              <option value="uploaded">Uploaded</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>
          </FilterChip>
          {(filters.search || filters.group || filters.status) && (
            <button onClick={() => setFilters({ search: "", group: "", status: "" })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        rowKey={(row) => `${row.groupId}:${row.documentId}`}
        loading={false}
        emptyTitle="No documents match the current filters"
        initialPageSize={10}
        pageSizeOptions={[10, 20, 50]}
      />

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
