import { useState } from "react";
import { ShieldCheck, Upload, Check, XCircle, Plus, FileText } from "lucide-react";
import {
  useClinicianCompliance,
  useUpsertClinicianDoc,
  useApproveClinicianDoc,
  useRejectClinicianDoc,
} from "../../../../hooks/useClinicianCompliance";
import { Btn, ModalShell, FormField, Spinner, StatusBadge, fmtDate } from "./shared.jsx";

const REQUIRED_DOC_TYPES = [
  "DBS Certificate", "GPhC Registration", "Professional Indemnity",
  "Right to Work", "ID Verification", "References", "Hep B Vaccination",
  "BLS Certificate", "Information Governance", "GDPR",
];

export default function CompliancePanel({ clinicianId, canManage }) {
  const { data, isLoading } = useClinicianCompliance(clinicianId);
  const upsertM   = useUpsertClinicianDoc(clinicianId);
  const approveM  = useApproveClinicianDoc(clinicianId);
  const rejectM   = useRejectClinicianDoc(clinicianId);

  const [modal, setModal] = useState(null); // {mode:'upload'|'reject', doc?}
  const [form,  setForm]  = useState({});
  const [file,  setFile]  = useState(null);

  if (isLoading) {
    return <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center"><Spinner cls="border-blue-600" /></div>;
  }

  const docs = data?.docs || [];
  const have = new Set(docs.map((d) => d.docType));
  const missing = REQUIRED_DOC_TYPES.filter((t) => !have.has(t));

  const openUpload = (doc) => {
    setForm({
      docType:    doc?.docType    || "",
      issueDate:  doc?.issueDate ? new Date(doc.issueDate).toISOString().split("T")[0]   : "",
      expiryDate: doc?.expiryDate ? new Date(doc.expiryDate).toISOString().split("T")[0] : "",
      notes:      doc?.notes      || "",
      _id:        doc?._id        || "",
    });
    setFile(null);
    setModal({ mode: "upload", doc });
  };

  const submitUpload = async (e) => {
    e.preventDefault();
    if (!form.docType) return;
    const fd = new FormData();
    fd.append("docType",    form.docType);
    if (form.issueDate)  fd.append("issueDate",  form.issueDate);
    if (form.expiryDate) fd.append("expiryDate", form.expiryDate);
    if (form.notes)      fd.append("notes",      form.notes);
    if (file) fd.append("file", file);
    await upsertM.mutateAsync({ docId: form._id || "new", data: fd });
    setModal(null);
  };

  const openReject = (doc) => { setForm({ reason: "", _id: doc._id }); setModal({ mode: "reject", doc }); };
  const submitReject = async (e) => {
    e.preventDefault();
    if (!form.reason?.trim()) return;
    await rejectM.mutateAsync({ docId: form._id, reason: form.reason });
    setModal(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
            <ShieldCheck size={18} className="text-emerald-600" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Compliance documents</h3>
        </div>
        {canManage && (
          <Btn variant="outline" size="sm" onClick={() => openUpload(null)}>
            <Plus size={13} /> Upload
          </Btn>
        )}
      </div>

      {missing.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-xs font-bold text-amber-700 mb-1">Missing required documents:</p>
          <p className="text-xs text-amber-600">{missing.join(", ")}</p>
        </div>
      )}

      {docs.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-10">No compliance documents uploaded yet.</p>
      ) : (
        <div className="space-y-2">
          {docs.map((d) => (
            <div key={d._id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <FileText size={15} className="text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{d.docType}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Issued {fmtDate(d.issueDate)} · Expires {fmtDate(d.expiryDate)}
                  </p>
                  {d.rejectionReason && (
                    <p className="text-[11px] text-red-600 mt-0.5 italic truncate">Rejected: {d.rejectionReason}</p>
                  )}
                </div>
              </div>
              <StatusBadge status={d.status} />
              <div className="flex items-center gap-1.5">
                {d.fileUrl && (
                  <a href={d.fileUrl} target="_blank" rel="noreferrer"
                     className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-200 text-slate-600 hover:bg-white">
                    View
                  </a>
                )}
                {canManage && (
                  <>
                    <Btn variant="ghost" size="sm" onClick={() => openUpload(d)}>
                      <Upload size={12} />
                    </Btn>
                    {d.status !== "approved" && (
                      <Btn variant="success" size="sm" onClick={() => approveM.mutate(d._id)} disabled={approveM.isPending}>
                        <Check size={12} />
                      </Btn>
                    )}
                    {d.status !== "rejected" && (
                      <Btn variant="danger" size="sm" onClick={() => openReject(d)}>
                        <XCircle size={12} />
                      </Btn>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal?.mode === "upload" && (
        <ModalShell
          title={modal.doc ? "Update document" : "Upload document"}
          onClose={() => setModal(null)}
          footer={
            <>
              <Btn variant="ghost" onClick={() => setModal(null)} cls="flex-1">Cancel</Btn>
              <Btn onClick={submitUpload} disabled={upsertM.isPending || !form.docType} cls="flex-1">
                {upsertM.isPending ? <Spinner /> : <Check size={14} />} Save
              </Btn>
            </>
          }
        >
          <FormField
            label="Document type" value={form.docType}
            onChange={(v) => setForm((f) => ({ ...f, docType: v }))}
            options={REQUIRED_DOC_TYPES} required
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Issue date"  value={form.issueDate}  onChange={(v) => setForm((f) => ({ ...f, issueDate: v }))}  type="date" />
            <FormField label="Expiry date" value={form.expiryDate} onChange={(v) => setForm((f) => ({ ...f, expiryDate: v }))} type="date" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">File</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 file:font-bold file:text-xs hover:file:bg-blue-100"
            />
          </div>
          <FormField
            label="Notes" value={form.notes}
            onChange={(v) => setForm((f) => ({ ...f, notes: v }))}
            textarea rows={3}
          />
        </ModalShell>
      )}

      {modal?.mode === "reject" && (
        <ModalShell
          title="Reject document"
          onClose={() => setModal(null)}
          footer={
            <>
              <Btn variant="ghost" onClick={() => setModal(null)} cls="flex-1">Cancel</Btn>
              <Btn variant="danger" onClick={submitReject} disabled={rejectM.isPending || !form.reason?.trim()} cls="flex-1">
                {rejectM.isPending ? <Spinner /> : <XCircle size={14} />} Reject
              </Btn>
            </>
          }
        >
          <FormField
            label="Rejection reason" value={form.reason}
            onChange={(v) => setForm((f) => ({ ...f, reason: v }))}
            textarea rows={4} required
          />
        </ModalShell>
      )}
    </div>
  );
}
