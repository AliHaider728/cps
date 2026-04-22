/**
 * ReportingArchivePanel.jsx
 * Reusable reporting archive component for PCN and Practice detail pages.
 *
 * ✅ UPDATED: File is uploaded to Supabase from frontend first.
 *             Backend receives plain JSON { fileUrl, fileName, mimeType, fileSize, month, year, notes }
 *             No more FormData / multer on this route.
 */
import { useState } from "react";
import {
  Archive, Upload, Trash2, Download, Star, X,
  FileText, Calendar, AlertCircle, Plus, Loader2,
} from "lucide-react";
import {
  useReportingArchive,
  useAddToReportingArchive,
  useDeleteFromReportingArchive,
} from "../../../hooks/useReportingArchive";
import { uploadFileToSupabase } from "../../../lib/supabase.js"; // ✅ NEW

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

/* ── Upload modal ── */
const UploadModal = ({ onClose, onSave, saving }) => {
  const now = new Date();
  const [month,     setMonth]     = useState(String(now.getMonth() + 1));
  const [year,      setYear]      = useState(String(now.getFullYear()));
  const [notes,     setNotes]     = useState("");
  const [file,      setFile]      = useState(null);
  const [err,       setErr]       = useState("");
  const [uploading, setUploading] = useState(false); // ✅ NEW: Supabase upload state

  const handle = async () => {
    if (!file)  { setErr("Please select a file"); return; }
    if (!month) { setErr("Month is required");    return; }
    if (!year)  { setErr("Year is required");     return; }
    setErr("");
    setUploading(true);

    try {
      // ✅ Step 1: Upload file to Supabase from frontend
      const uploaded = await uploadFileToSupabase(file);

      // ✅ Step 2: Send JSON metadata to backend (no FormData / no multer)
      await onSave({
        fileUrl:  uploaded.publicUrl,
        fileName: uploaded.fileName,
        mimeType: uploaded.mimeType,
        fileSize: uploaded.fileSize,
        month,
        year,
        notes,
      });
      onClose();
    } catch (e) {
      setErr(e.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const isBusy = saving || uploading;

  const yearOptions = [];
  for (let y = now.getFullYear() + 1; y >= now.getFullYear() - 3; y--) yearOptions.push(y);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-[15px] font-bold text-slate-800">Upload Monthly Report</h3>
          <button onClick={onClose} disabled={isBusy}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-50">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {err && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-3 py-2">
              {err}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Month *</label>
              <select value={month} onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 cursor-pointer">
                {MONTHS.map((m, i) => <option key={i + 1} value={String(i + 1)}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Year *</label>
              <select value={year} onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 cursor-pointer">
                {yearOptions.map((y) => <option key={y} value={String(y)}>{y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Report File *</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xlsx,.pptx"
              onChange={(e) => setFile(e.target.files[0] || null)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-100 file:px-4 file:py-1.5 file:text-sm file:text-blue-700"
            />
            {file && <p className="text-xs text-slate-400 mt-1">{file.name}</p>}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Notes (optional)</label>
            <textarea
              rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Q1 performance report, includes KPIs…"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 resize-none transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-5">
          <button onClick={onClose} disabled={isBusy}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handle} disabled={isBusy || !file}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {isBusy
              ? <><Loader2 size={14} className="animate-spin" />{uploading ? "Uploading…" : "Saving…"}</>
              : <><Upload size={14} />Upload Report</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main panel ── */
export default function ReportingArchivePanel({ entityType, entityId }) {
  const [showUpload, setShowUpload] = useState(false);
  const [filterYear, setFilterYear] = useState("");

  const { data, isLoading, isError } = useReportingArchive(entityType, entityId);
  const addReport    = useAddToReportingArchive(entityType, entityId);
  const deleteReport = useDeleteFromReportingArchive(entityType, entityId);

  const archive = data?.archive || [];
  const years   = [...new Set(archive.map((r) => r.year))].sort((a, b) => b - a);
  const filtered = filterYear ? archive.filter((r) => String(r.year) === filterYear) : archive;

  const handleDelete = async (reportId) => {
    if (!confirm("Delete this report from the archive?")) return;
    await deleteReport.mutateAsync(reportId);
  };

  // ✅ UPDATED: onSave now receives plain JSON (already uploaded to Supabase by modal)
  const handleUpload = async (jsonPayload) => {
    await addReport.mutateAsync(jsonPayload);
    setShowUpload(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Archive size={14} /> Monthly Report Archive
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {archive.length} report{archive.length !== 1 ? "s" : ""} stored
            </p>
          </div>
          <div className="flex items-center gap-2">
            {years.length > 0 && (
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="text-sm rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus:outline-none focus:border-blue-400 cursor-pointer">
                <option value="">All Years</option>
                {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
              </select>
            )}
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all">
              <Plus size={14} /> Upload Report
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-7 h-7 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600">Failed to load archive</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-slate-400">
            <Archive size={32} className="mb-3 opacity-30" />
            <p className="text-sm font-semibold">
              {archive.length === 0 ? "No reports uploaded yet" : "No reports for selected year"}
            </p>
            {archive.length === 0 && (
              <button
                onClick={() => setShowUpload(true)}
                className="mt-3 text-blue-600 text-xs font-bold hover:underline">
                Upload the first report
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-2.5">
            {filtered.map((report, idx) => {
              const monthName = MONTHS[(report.month || 1) - 1] || `Month ${report.month}`;
              return (
                <div
                  key={report._id || idx}
                  className="flex items-center gap-4 px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-200 group hover:border-blue-200 hover:bg-white transition-all">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <FileText size={15} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-800">{monthName} {report.year}</p>
                      {report.starred && <Star size={12} className="text-amber-500 fill-amber-500" />}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs text-slate-400 truncate max-w-[200px]">{report.fileName}</span>
                      {report.uploadedAt && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar size={10} /> {fmtDate(report.uploadedAt)}
                        </span>
                      )}
                    </div>
                    {report.notes && <p className="text-xs text-slate-500 mt-1">{report.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {report.reportUrl && (
                      <a href={report.reportUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-all">
                        <Download size={12} /> View
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(report._id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSave={handleUpload}
          saving={addReport.isPending}
        />
      )}
    </div>
  );
}