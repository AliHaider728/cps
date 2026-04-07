import { useRef, useState } from "react";
import { AlertCircle, CalendarClock, Download, FileText, Loader2, Upload } from "lucide-react";
import {
  useDocumentGroups,
  useEntityDocuments,
  useUpsertEntityDocument,
} from "../../../hooks/useCompliance";

const STATUS_STYLE = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  uploaded: "bg-green-50 text-green-700 border-green-200",
  expired: "bg-red-50 text-red-700 border-red-200",
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "Not set";

const toInputDate = (value) =>
  value ? new Date(value).toISOString().split("T")[0] : "";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

function DocumentRow({ doc, onUpload, onSaveExpiry, saving }) {
  const inputRef = useRef(null);
  const [expiryDate, setExpiryDate] = useState(toInputDate(doc.expiryDate));
  const [rowError, setRowError] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setRowError("");
    try {
      const fileUrl = await readFileAsDataUrl(file);
      await onUpload(doc.documentId, {
        fileName: file.name,
        fileUrl,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
        expiryDate: doc.expirable ? expiryDate || null : null,
      });
    } catch (error) {
      setRowError(error.message || "Upload failed");
    } finally {
      event.target.value = "";
    }
  };

  const handleSaveExpiry = async () => {
    setRowError("");
    try {
      await onSaveExpiry(doc.documentId, {
        expiryDate: expiryDate || null,
      });
    } catch (error) {
      setRowError(error.message || "Failed to save expiry date");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
            <FileText size={16} className="text-slate-400 shrink-0" />
            <span className="truncate">{doc.name}</span>
          </p>
          {doc.fileName && <p className="text-xs text-slate-400 mt-1 truncate">{doc.fileName}</p>}
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border capitalize ${STATUS_STYLE[doc.status] || STATUS_STYLE.pending}`}>
          {doc.status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px_auto] gap-3 items-end">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Document</p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => inputRef.current?.click()}
              disabled={saving}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-all"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {doc.fileUrl ? "Replace File" : "Upload File"}
            </button>
            {doc.fileUrl && (
              <a
                href={doc.fileUrl}
                download={doc.fileName || `${doc.name}.file`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
              >
                <Download size={13} /> Download
              </a>
            )}
            <input ref={inputRef} type="file" className="hidden" onChange={handleFileChange} />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Expiry Date</p>
          {doc.expirable ? (
            <input
              type="date"
              value={expiryDate}
              onChange={(event) => setExpiryDate(event.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 transition-all"
            />
          ) : (
            <div className="h-[42px] px-3 rounded-xl border border-dashed border-slate-200 text-sm text-slate-400 flex items-center">
              Not applicable
            </div>
          )}
        </div>

        <div className="flex flex-col items-start md:items-end">
          <button
            onClick={handleSaveExpiry}
            disabled={saving || !doc.expirable}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
          >
            Save Date
          </button>
          <p className="text-xs text-slate-400 mt-2">
            {doc.expirable ? formatDate(expiryDate) : "No expiry tracking"}
          </p>
        </div>
      </div>

      {rowError && <p className="text-xs text-red-500 mt-3">{rowError}</p>}
    </div>
  );
}

export default function EntityDocumentsTab({
  entityType,
  entityId,
  currentGroupId,
  onChangeGroup,
  accent = "blue",
}) {
  const [groupSaving, setGroupSaving] = useState(false);
  const [activeDocId, setActiveDocId] = useState("");

  const { data: groupsData } = useDocumentGroups({ active: true });
  const { data, isLoading, error } = useEntityDocuments(entityType, entityId);
  const upsertDocument = useUpsertEntityDocument(entityType, entityId);

  const groups = groupsData?.groups || [];
  const documents = data?.documents || [];
  const summary = data?.summary || { total: 0, uploaded: 0, pending: 0, expired: 0 };
  const currentValue = data?.complianceGroup?._id || currentGroupId || "";

  const handleGroupChange = async (nextGroupId) => {
    setGroupSaving(true);
    try {
      await onChangeGroup(nextGroupId || null);
    } finally {
      setGroupSaving(false);
    }
  };

  const handleUpsert = async (documentId, payload) => {
    setActiveDocId(documentId);
    try {
      await upsertDocument.mutateAsync({ documentId, data: payload });
    } finally {
      setActiveDocId("");
    }
  };

  const selectFocusClass = accent === "teal" ? "focus:border-teal-400" : "focus:border-blue-400";

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Documents</h3>
            <p className="text-sm text-slate-400 mt-1">
              Documents are generated automatically from the selected compliance group.
            </p>
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

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px] gap-4 items-end">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Compliance Group</p>
            <select
              value={currentValue}
              onChange={(event) => handleGroupChange(event.target.value)}
              disabled={groupSaving}
              className={`w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none transition-all cursor-pointer ${selectFocusClass}`}
            >
              <option value="">Select compliance group...</option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-slate-500">
            {groupSaving ? "Updating group..." : data?.complianceGroup?.name ? `Current: ${data.complianceGroup.name}` : "No group selected"}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">
          Failed to load documents.
        </div>
      ) : !currentValue ? (
        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-14 flex flex-col items-center text-slate-400 gap-3">
          <AlertCircle size={32} className="opacity-40" />
          <p className="font-semibold">Select a compliance group to generate documents</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-14 flex flex-col items-center text-slate-400 gap-3">
          <CalendarClock size={32} className="opacity-40" />
          <p className="font-semibold">This group has no active documents</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {documents.map((doc) => (
            <DocumentRow
              key={doc.documentId}
              doc={doc}
              saving={activeDocId === doc.documentId || upsertDocument.isPending}
              onUpload={handleUpsert}
              onSaveExpiry={handleUpsert}
            />
          ))}
        </div>
      )}
    </div>
  );
}
