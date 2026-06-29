import React, { useState } from "react";
import {
  ShieldCheck, Upload, Check, XCircle, Plus, FileText,
  ChevronDown, ChevronUp, Settings, AlertCircle,
} from "lucide-react";
import {
  useClinicianCompliance,
  useClinicianComplianceGroups,
  useUpsertClinicianDoc,
  useApproveClinicianDoc,
  useRejectClinicianDoc,
  useAssignComplianceGroups,
} from "../../../../hooks/useClinicianCompliance";
import { useDocumentGroups } from "../../../../hooks/useCompliance";
import { Btn, FormField, Spinner, StatusBadge } from "./shared";
import { ModalShell } from "../../../../components/ui/ModalShell";
import { fmtDate } from "../../../../lib/formatters";

interface CompliancePanelProps {
  clinicianId: string;
  canManage?: boolean;
}

interface UploadFormState {
  docName?: string;
  expiryDate?: string;
  notes?: string;
  docId?: string;
  docKey?: string;
  reason?: string;
  _id?: string;
}

export default function CompliancePanel({ clinicianId, canManage }: CompliancePanelProps) {
  const { data: legacyData, isLoading: legacyLoading }   = useClinicianCompliance(clinicianId);
  const { data: groupsData, isLoading: groupsLoading }   = useClinicianComplianceGroups(clinicianId);
  const { data: allGroupsData }                          = useDocumentGroups();

  const upsertM  = useUpsertClinicianDoc(clinicianId);
  const approveM = useApproveClinicianDoc(clinicianId);
  const rejectM  = useRejectClinicianDoc(clinicianId);
  const assignM  = useAssignComplianceGroups(clinicianId);

  const [modal,          setModal]          = useState<{ mode: "upload" | "reject", doc?: any } | null>(null);
  const [form,           setForm]           = useState<UploadFormState>({});
  const [file,           setFile]           = useState<File | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [assignModal,    setAssignModal]    = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [assignError,    setAssignError]    = useState("");

  const isLoading  = legacyLoading || groupsLoading;
  // @ts-ignore
  const groups     = groupsData?.groups     || [];
  // @ts-ignore
  const legacyDocs = legacyData?.docs       || [];
  // @ts-ignore
  const allGroups  = allGroupsData?.groups  || allGroupsData?.data || [];

  /* ── Summary numbers ── */
  // @ts-ignore
  const totalDocs     = groupsData?.totalDocs     ?? legacyDocs.length;
  // @ts-ignore
  const totalUploaded = groupsData?.totalUploaded ?? legacyDocs.filter((d: any) => d.status === "approved").length;
  // @ts-ignore
  const totalMissing  = groupsData?.totalMissing  ?? legacyDocs.filter((d: any) => d.status === "missing").length;
  const progressPct   = totalDocs > 0 ? Math.round((totalUploaded / totalDocs) * 100) : 0;

  /* ── Helpers ── */
  const toggleGroup = (id: string) =>
    setExpandedGroups(prev => ({ ...prev, [id]: prev[id] === false ? true : false }));

  const isGroupExpanded = (id: string) => expandedGroups[id] !== false; // default open

  /* ── Assign modal ── */
  const openAssignModal = () => {
    setSelectedGroups(groups.map((g: any) => String(g._id)));
    setAssignError("");
    setAssignModal(true);
  };

  const submitAssign = async () => {
    setAssignError("");
    try {
      await assignM.mutateAsync({ groupIds: selectedGroups });
      setAssignModal(false);
    } catch (e: any) {
      setAssignError(e?.response?.data?.message || "Failed to assign groups");
    }
  };

  const toggleGroupSelect = (id: string) => {
    const sid = String(id);
    setSelectedGroups(prev =>
      prev.includes(sid) ? prev.filter(x => x !== sid) : [...prev, sid]
    );
  };

  /* ── Upload modal ── */
  const openUpload = (doc: any, groupId: string | null) => {
    setForm({
      docName:    doc?.name    || doc?.docName || "",
      expiryDate: doc?.expiryDate ? new Date(doc.expiryDate).toISOString().split("T")[0] : "",
      notes:      "",
      docId:      doc?.docId  || "",
      docKey:     doc?._id    ? `group_${groupId || "misc"}_${doc._id}` : "",
    });
    setFile(null);
    setModal({ mode: "upload", doc });
  };

  const submitUpload = async () => {
    if (!form.docName) return;
    const fd = new FormData();
    fd.append("docName", form.docName);
    if (form.docKey)     fd.append("docKey",     form.docKey);
    if (form.expiryDate) fd.append("expiryDate", form.expiryDate);
    if (form.notes)      fd.append("notes",      form.notes);
    if (file)            fd.append("file",        file);
    try {
      await upsertM.mutateAsync({ docId: form.docId || "new", data: fd });
      setModal(null);
    } catch (e) {
      // error shown by mutation
    }
  };

  /* ── Reject modal ── */
  const openReject = (doc: any) => {
    setForm({ reason: "", _id: doc.docId || doc._id });
    setModal({ mode: "reject", doc });
  };

  const submitReject = async () => {
    if (!form.reason?.trim() || !form._id) return;
    await rejectM.mutateAsync({ docId: form._id, reason: form.reason });
    setModal(null);
  };

  /* ── Loading state ── */
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <Spinner cls="border-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
            <ShieldCheck size={18} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Compliance Documents</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {groups.length > 0
                ? `${groups.length} group${groups.length !== 1 ? "s" : ""} assigned`
                : "No groups assigned yet"}
            </p>
          </div>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <Btn variant="outline" size="sm" onClick={openAssignModal}>
              <Settings size={13} /> Assign Groups
            </Btn>
            <Btn variant="outline" size="sm" onClick={() => openUpload(null, null)}>
              <Plus size={13} /> Add Doc
            </Btn>
          </div>
        )}
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <p className="text-xl font-extrabold text-slate-800">{totalDocs}</p>
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide mt-0.5">Total</p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
          <p className="text-xl font-extrabold text-emerald-700">{totalUploaded}</p>
          <p className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wide mt-0.5">Uploaded</p>
        </div>
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
          <p className="text-xl font-extrabold text-amber-700">{totalMissing}</p>
          <p className="text-[11px] text-amber-600 font-semibold uppercase tracking-wide mt-0.5">Remaining</p>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Compliance Progress</p>
          <p className="text-sm font-extrabold text-slate-800">{progressPct}%</p>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progressPct >= 80 ? "bg-emerald-500" : progressPct >= 50 ? "bg-amber-400" : "bg-red-400"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ── Groups View ── */}
      {groups.length > 0 ? (
        <div className="space-y-3">
          {groups.map((group: any) => {
            const expanded = isGroupExpanded(group._id);
            const allDone  = group.summary.uploaded === group.summary.total && group.summary.total > 0;

            return (
              <div key={String(group._id)} className="border border-slate-200 rounded-xl overflow-hidden">

                {/* Group header */}
                <button
                  onClick={() => toggleGroup(group._id)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-bold text-slate-700 truncate">{group.name}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold whitespace-nowrap ${
                      allDone
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-white border-slate-200 text-slate-500"
                    }`}>
                      {group.summary.uploaded}/{group.summary.total} uploaded
                    </span>
                    {group.summary.missing > 0 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold whitespace-nowrap">
                        {group.summary.missing} remaining
                      </span>
                    )}
                  </div>
                  {expanded
                    ? <ChevronUp size={15} className="text-slate-400 shrink-0" />
                    : <ChevronDown size={15} className="text-slate-400 shrink-0" />
                  }
                </button>

                {/* Group docs */}
                {expanded && (
                  <div className="divide-y divide-slate-100">
                    {group.docs.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">No documents in this group.</p>
                    ) : (
                      group.docs.map((doc: any) => (
                        <div
                          key={String(doc._id)}
                          className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                        >
                          {/* Doc info */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <FileText size={13} className="text-slate-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">
                                {doc.name}
                                {doc.mandatory && (
                                  <span className="ml-1 text-red-400 text-[11px]">*</span>
                                )}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {doc.uploadedAt
                                  ? `Uploaded ${fmtDate(doc.uploadedAt)}`
                                  : "Not uploaded"}
                                {doc.expiryDate && ` · Expires ${fmtDate(doc.expiryDate)}`}
                              </p>
                              {doc.rejectReason && (
                                <p className="text-[11px] text-red-600 mt-0.5 italic truncate">
                                  Rejected: {doc.rejectReason}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Status badge */}
                          <StatusBadge status={doc.status} />

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {doc.fileUrl && (
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-200 text-slate-600 hover:bg-white transition-colors"
                              >
                                📥 View
                              </a>
                            )}
                            {canManage && (
                              <>
                                <Btn variant="ghost" size="sm" onClick={() => openUpload(doc, group._id)}>
                                  <Upload size={12} />
                                </Btn>
                                {(doc.status === "uploaded" || doc.status === "pending") && (
                                  <>
                                    <Btn
                                      variant="success"
                                      size="sm"
                                      onClick={() => approveM.mutate(doc.docId)}
                                      disabled={approveM.isPending}
                                    >
                                      <Check size={12} /> Approve
                                    </Btn>
                                    <Btn
                                      variant="danger"
                                      size="sm"
                                      onClick={() => openReject(doc)}
                                    >
                                      <XCircle size={12} /> Reject
                                    </Btn>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Legacy docs fallback OR empty state ── */
        legacyDocs.length > 0 ? (
          <div className="space-y-2">
            {legacyDocs.map((d: any) => (
              <div
                key={d._id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <FileText size={15} className="text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{d.docName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {d.uploadedAt ? `Uploaded ${fmtDate(d.uploadedAt)}` : "Not uploaded"}
                      {d.expiryDate && ` · Expires ${fmtDate(d.expiryDate)}`}
                    </p>
                    {d.rejectReason && (
                      <p className="text-[11px] text-red-600 mt-0.5 italic truncate">
                        Rejected: {d.rejectReason}
                      </p>
                    )}
                  </div>
                </div>
                <StatusBadge status={d.status} />
                <div className="flex items-center gap-1.5 shrink-0">
                  {d.fileUrl && (
                    <a href={d.fileUrl} target="_blank" rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-200 text-slate-600 hover:bg-white">
                      📥 View
                    </a>
                  )}
                  {canManage && (
                    <>
                      <Btn variant="ghost" size="sm" onClick={() => openUpload(d, null)}>
                        <Upload size={12} />
                      </Btn>
                      {(d.status === "uploaded" || d.status === "pending") && (
                        <>
                          <Btn variant="success" size="sm"
                            onClick={() => approveM.mutate(d._id)} disabled={approveM.isPending}>
                            <Check size={12} /> Approve
                          </Btn>
                          <Btn variant="danger" size="sm" onClick={() => openReject(d)}>
                            <XCircle size={12} /> Reject
                          </Btn>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={22} className="text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-1">No compliance groups assigned</p>
            <p className="text-xs text-slate-400 mb-4">
              Assign document groups to track this clinician's compliance requirements.
            </p>
            {canManage && (
              <Btn variant="outline" size="sm" onClick={openAssignModal}>
                <Settings size={13} /> Assign Groups
              </Btn>
            )}
          </div>
        )
      )}

      {/* ══════════ ASSIGN GROUPS MODAL ══════════ */}
      {assignModal && (
        <ModalShell
          title="Assign Compliance Groups"
          onClose={() => setAssignModal(false)}
          footer={
            <>
              <Btn variant="ghost" onClick={() => setAssignModal(false)} cls="flex-1">
                Cancel
              </Btn>
              <Btn
                onClick={submitAssign}
                disabled={assignM.isPending}
                cls="flex-1"
              >
                {assignM.isPending ? <Spinner /> : <Check size={14} />} Save Groups
              </Btn>
            </>
          }
        >
          <p className="text-xs text-slate-500 mb-3">
            Select document groups to assign. Documents inside each group will automatically
            become required for this clinician.
          </p>

          {assignError && (
            <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-700">
              <AlertCircle size={14} className="shrink-0" /> {assignError}
            </div>
          )}

          {allGroups.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No document groups found.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {allGroups.map((g: any) => {
                const gid     = String(g._id || g.id);
                const checked = selectedGroups.includes(gid);
                const docCount = g.documents?.length ?? 0;
                return (
                  <label
                    key={gid}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      checked
                        ? "border-blue-200 bg-blue-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleGroupSelect(gid)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{g.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {docCount} document{docCount !== 1 ? "s" : ""}
                        {g.active === false && " · Inactive"}
                      </p>
                    </div>
                    {checked && (
                      <Check size={14} className="text-blue-600 shrink-0" />
                    )}
                  </label>
                );
              })}
            </div>
          )}

          <p className="text-xs text-slate-400 mt-3">
            {selectedGroups.length} group{selectedGroups.length !== 1 ? "s" : ""} selected
          </p>
        </ModalShell>
      )}

      {/* ══════════ UPLOAD MODAL ══════════ */}
      {modal?.mode === "upload" && (
        <ModalShell
          title={modal.doc ? `Update — ${modal.doc.name || "Document"}` : "Add Document"}
          onClose={() => setModal(null)}
          footer={
            <>
              <Btn variant="ghost" onClick={() => setModal(null)} cls="flex-1">
                Cancel
              </Btn>
              <Btn
                onClick={submitUpload}
                disabled={upsertM.isPending || !form.docName}
                cls="flex-1"
              >
                {upsertM.isPending ? <Spinner /> : <Check size={14} />} Save
              </Btn>
            </>
          }
        >
          {!modal.doc && (
            <FormField
              label="Document name"
              value={form.docName}
              onChange={(v) => setForm((f) => ({ ...f, docName: v }))}
              required
            />
          )}
          <FormField
            label="Expiry date"
            value={form.expiryDate}
            onChange={(v) => setForm((f) => ({ ...f, expiryDate: v }))}
            type="date"
          />
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
              File
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 file:font-bold file:text-xs hover:file:bg-blue-100"
            />
          </div>
          <FormField
            label="Notes"
            value={form.notes}
            onChange={(v) => setForm((f) => ({ ...f, notes: v }))}
            textarea
            rows={3}
          />
          {upsertM.isError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-700">
              <AlertCircle size={14} className="shrink-0" />
              {(upsertM.error as any)?.response?.data?.message || "Upload failed. Please try again."}
            </div>
          )}
        </ModalShell>
      )}

      {/* ══════════ REJECT MODAL ══════════ */}
      {modal?.mode === "reject" && (
        <ModalShell
          title="Reject Document"
          onClose={() => setModal(null)}
          footer={
            <>
              <Btn variant="ghost" onClick={() => setModal(null)} cls="flex-1">
                Cancel
              </Btn>
              <Btn
                variant="danger"
                onClick={submitReject}
                disabled={rejectM.isPending || !form.reason?.trim()}
                cls="flex-1"
              >
                {rejectM.isPending ? <Spinner /> : <XCircle size={14} />} Reject
              </Btn>
            </>
          }
        >
          <FormField
            label="Rejection reason"
            value={form.reason}
            onChange={(v) => setForm((f) => ({ ...f, reason: v }))}
            textarea
            rows={4}
            required
          />
        </ModalShell>
      )}
    </div>
  );
}

