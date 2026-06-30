import React, { useRef, useState } from "react";
import { useAppSelector } from "../../hooks/redux";
import {
  useClinicianCompliance,
  useUpsertClinicianDoc,
} from "../../hooks/useClinicianCompliance";
import {
  ShieldCheck, ShieldAlert, ShieldX, Clock, Upload, FileText,
  CheckCircle2, XCircle, AlertTriangle, Paperclip, Loader2,
  RefreshCcw, AlertCircle, FileBadge
} from "lucide-react";

const STATUS_CONFIG: Record<string, any> = {
  missing: {
    label    : "Required",
    badgeCls : "badge-red",
    cardBdr  : "border-red-200",
    Icon     : AlertTriangle,
    iconCls  : "bg-red-50 text-red-500",
  },
  uploaded: {
    label    : "Under Review",
    badgeCls : "badge-amber",
    cardBdr  : "border-amber-200",
    Icon     : Clock,
    iconCls  : "bg-amber-50 text-amber-500",
  },
  approved: {
    label    : "Approved",
    badgeCls : "badge-green",
    cardBdr  : "border-green-200",
    Icon     : ShieldCheck,
    iconCls  : "bg-green-50 text-green-600",
  },
  rejected: {
    label    : "Rejected — Reupload Required",
    badgeCls : "badge-red",
    cardBdr  : "border-red-200",
    Icon     : ShieldX,
    iconCls  : "bg-red-50 text-red-500",
  },
  expired: {
    label    : "Expired",
    badgeCls : "badge-amber",
    cardBdr  : "border-orange-200",
    Icon     : ShieldAlert,
    iconCls  : "bg-orange-50 text-orange-500",
  },
};

interface Document {
  _id?: string;
  id?: string;
  status?: string;
  approvalStatus?: string;
  docName?: string;
  name?: string;
  expiryDate?: string;
  uploadedAt?: string;
  approvedAt?: string;
  rejectReason?: string;
  notes?: string;
  rejectionReason?: string;
}

const docIdOf = (doc: Document) => doc?._id || doc?.id;

const fmtDate = (d: string | Date | undefined) => {
  if (!d) return "—";
  try {
    const raw      = String(d);
    const dateOnly = raw.includes("T") ? raw.split("T")[0] : raw.slice(0, 10);
    const dt       = new Date(dateOnly);
    if (Number.isNaN(dt.getTime())) return dateOnly;
    return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return String(d); }
};

export default function ClinicianCertificatesPage() {
  const user        = useAppSelector((s: any) => s.auth.user);
  const clinicianId = user?.clinicianId;
  const fileInputRefs   = useRef<Record<string, HTMLInputElement | null>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [uploadingId,   setUploadingId]   = useState<string | null>(null);

  const { data, isLoading, error } = useClinicianCompliance(clinicianId);
  const { mutateAsync: upsertDoc } = useUpsertClinicianDoc(clinicianId);

  const docs: Document[] = data?.docs || data || [];
  const approvedCount = docs.filter((d) => (d.status || d.approvalStatus) === "approved").length;
  const progress      = docs.length > 0 ? Math.round((approvedCount / docs.length) * 100) : 0;

  const canUpload = (doc: Document) => {
    const status = doc.status || doc.approvalStatus || "missing";
    return ["missing", "rejected", "expired"].includes(status);
  };

  const handleFileChange = (id: string, file?: File) => {
    if (file) {
      setSelectedFiles((prev) => ({ ...prev, [id]: file }));
    }
  };

  const handleUpload = async (doc: Document) => {
    const id   = docIdOf(doc);
    if (!id) return;
    const file = selectedFiles[id];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("docName", doc.docName || doc.name || "Document");
    setUploadingId(id);
    try {
      await upsertDoc({ docId: id || "new", data: formData });
      setSelectedFiles((prev) => { const n = { ...prev }; delete n[id]; return n; });
    } finally { setUploadingId(null); }
  };

  if (!clinicianId)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
          <AlertCircle size={24} className="text-slate-400" />
        </div>
        <p className="text-sm font-bold text-slate-600">Account not linked</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Your account is not linked to a clinician profile. Contact your administrator.
        </p>
      </div>
    );

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl gradient-blue-indigo flex items-center justify-center
            shadow-[0_4px_16px_rgba(59,130,246,0.35)] animate-pulse">
            <FileBadge size={18} className="text-white" />
          </div>
          <p className="text-sm text-slate-400 font-semibold">Loading documents…</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="alert-error m-4 animate-scale-in">
        <XCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
        <p className="text-sm font-medium text-red-600">
          Failed to load compliance documents. Please try again.
        </p>
      </div>
    );

  return (
    <div className="max-w-full mx-auto px-2 py-6 space-y-6 animate-fade-up">

      {/* ── Page header ── */}
      <div className="card p-5 border-l-4 border-l-blue-500">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-xl gradient-blue-indigo flex items-center justify-center
            shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
            <FileBadge size={16} className="text-white" />
          </div>
          <h1 className="page-title">My Certificates</h1>
        </div>
        <p className="text-[13px] text-slate-500 ml-[2.875rem]">
          Upload required compliance documents for admin review. All must be approved before shift assignment.
        </p>
      </div>

      {/* ── Progress bar ── */}
      {docs.length > 0 && (
        <div className="card p-5 animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[13px] font-bold text-slate-700">Compliance Progress</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {approvedCount} of {docs.length} documents approved
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900 leading-none">{progress}</span>
              <span className="text-sm text-slate-400 ml-0.5">%</span>
            </div>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
                background: progress === 100
                  ? "linear-gradient(90deg,#16a34a,#22c55e)"
                  : progress > 50
                    ? "linear-gradient(90deg,#3b82f6,#6366f1)"
                    : "linear-gradient(90deg,#f59e0b,#f97316)",
              }}
            />
          </div>
          {progress === 100 && (
            <div className="flex items-center gap-2 mt-3 text-sm text-green-600 font-semibold">
              <CheckCircle2 size={14} />
              All documents approved — ready for shift assignment
            </div>
          )}
        </div>
      )}

      {/* ── Empty state ── */}
      {docs.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <FileText size={24} className="text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-500">No documents assigned yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Your administrator will assign required compliance documents
          </p>
        </div>
      )}

      {/* ── Document cards ── */}
      <div className="space-y-3">
        {docs.map((doc) => {
          const id              = docIdOf(doc);
          if (!id) return null;
          const status          = doc.status || doc.approvalStatus || "missing";
          const cfg             = STATUS_CONFIG[status] || STATUS_CONFIG.missing;
          const { Icon }        = cfg;
          const uploadable      = canUpload(doc);
          const isUploading     = uploadingId === id;
          const chosenFile      = selectedFiles[id];
          const rejectionReason = doc.rejectReason || doc.notes || doc.rejectionReason;

          return (
            <div key={id}
              className={`card overflow-hidden transition-all duration-300 animate-scale-in border ${cfg.cardBdr}`}>
              <div className="p-5">
                {/* Top row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.iconCls}`}>
                      <Icon size={18} strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[13.5px] font-bold text-slate-800 truncate">
                        {doc.docName || doc.name}
                      </h3>
                      <div className="flex flex-wrap gap-3 mt-1">
                        {doc.expiryDate && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock size={10} /> Expiry: {fmtDate(doc.expiryDate)}
                          </span>
                        )}
                        {status === "uploaded" && doc.uploadedAt && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Upload size={10} /> Uploaded: {fmtDate(doc.uploadedAt)}
                          </span>
                        )}
                        {status === "approved" && doc.approvedAt && (
                          <span className="text-[11px] text-green-600 flex items-center gap-1">
                            <CheckCircle2 size={10} /> Approved: {fmtDate(doc.approvedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`badge shrink-0 ${cfg.badgeCls}`}>{cfg.label}</span>
                </div>

                {/* Rejection reason */}
                {status === "rejected" && rejectionReason && (
                  <div className="mt-3 flex items-start gap-2.5 p-3
                    bg-red-50 border border-red-100 rounded-xl">
                    <AlertTriangle size={13} className="text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-red-700 mb-0.5 uppercase tracking-wide">
                        Rejection Reason
                      </p>
                      <p className="text-[12.5px] text-red-600">{rejectionReason}</p>
                    </div>
                  </div>
                )}

                {/* Upload section */}
                {uploadable && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <input
                      type="file"
                      className="hidden"
                      ref={(el) => { fileInputRefs.current[id] = el; }}
                      onChange={(e) => handleFileChange(id, e.target.files?.[0])}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[id]?.click()}
                        className="btn btn-ghost gap-2"
                      >
                        <Paperclip size={13} />
                        {chosenFile ? chosenFile.name : "Choose File"}
                      </button>
                      {chosenFile && (
                        <button
                          type="button"
                          onClick={() => handleUpload(doc)}
                          disabled={isUploading}
                          className="btn btn-primary"
                        >
                          {isUploading
                            ? <><Loader2 size={13} className="spin-arc" /> Uploading…</>
                            : status === "rejected"
                              ? <><RefreshCcw size={13} /> Reupload</>
                              : <><Upload size={13} /> Upload</>}
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Accepted: PDF, JPG, PNG, DOC, DOCX · Max 10 MB
                    </p>
                  </div>
                )}

                {/* Status messages */}
                {status === "approved" && (
                  <div className="mt-3 flex items-center gap-2 text-[12.5px] text-green-600 font-medium">
                    <CheckCircle2 size={13} />
                    This document has been verified and approved by admin.
                  </div>
                )}
                {status === "uploaded" && (
                  <div className="mt-3 flex items-center gap-2 text-[12.5px] text-amber-600 font-medium">
                    <Clock size={13} />
                    Under review — you will be notified once a decision is made.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


