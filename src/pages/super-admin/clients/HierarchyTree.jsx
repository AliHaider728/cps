/**
 * HierarchyTree.jsx
 * Card-based hierarchy: ICB → Federation/INT → PCN → Practice
 * Replaces old sidebar tree style with expandable cards.
 */
import { useState, useEffect } from "react";
import {
  Building2, Layers, Network, Stethoscope,
  ChevronDown, ChevronRight,
  Pencil, Trash2, Loader2, Plus,
} from "lucide-react";

export default function HierarchyTree({
  tree, loading, selected,
  onSelect,
  onEditICB,        onDeleteICB,
  onEditFederation, onDeleteFederation,
  onEditPCN,        onDeletePCN,
  onEditPractice,   onDeletePractice,
  onAddFederation,  onAddPCN,  onAddPractice,
  isAdmin,
}) {
  const [expanded, setExpanded] = useState({});

  /* Auto-expand all when tree changes (after search) */
  useEffect(() => {
    if (!tree?.length) return;
    const next = {};
    tree.forEach(icb => {
      next[`icb-${icb._id}`] = true;
      (icb.federations || []).forEach(fed => {
        next[`fed-${fed._id}`] = true;
        (fed.pcns || []).forEach(pcn => { next[`pcn-${pcn._id}`] = true; });
      });
      (icb.pcns || []).forEach(pcn => { next[`pcn-${pcn._id}`] = true; });
    });
    setExpanded(next);
  }, [tree]);

  const toggle = (key) => setExpanded(p => ({ ...p, [key]: !p[key] }));

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 size={20} className="animate-spin text-blue-500" />
      <p className="text-xs text-slate-400 font-medium">Loading clients…</p>
    </div>
  );

  if (!tree?.length) return (
    <div className="flex flex-col items-center justify-center py-16 gap-2 px-4">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-1">
        <Building2 size={20} className="text-slate-300" />
      </div>
      <p className="text-sm text-slate-500 font-medium">No clients found</p>
      <p className="text-xs text-slate-400 text-center">Try adjusting your search</p>
    </div>
  );

  return (
    <div className="p-3 space-y-2">
      {tree.map(icb => (
        <ICBCard
          key={icb._id}
          icb={icb}
          expanded={expanded}
          toggle={toggle}
          selected={selected}
          onSelect={onSelect}
          isAdmin={isAdmin}
          onEditICB={onEditICB}
          onDeleteICB={onDeleteICB}
          onEditFederation={onEditFederation}
          onDeleteFederation={onDeleteFederation}
          onEditPCN={onEditPCN}
          onDeletePCN={onDeletePCN}
          onEditPractice={onEditPractice}
          onDeletePractice={onDeletePractice}
          onAddFederation={onAddFederation}
          onAddPCN={onAddPCN}
          onAddPractice={onAddPractice}
        />
      ))}
    </div>
  );
}

/* ── ICB Card ──────────────────────────────────────────────────────────── */
function ICBCard({ icb, expanded, toggle, selected, onSelect, isAdmin,
  onEditICB, onDeleteICB, onEditFederation, onDeleteFederation,
  onEditPCN, onDeletePCN, onEditPractice, onDeletePractice,
  onAddFederation, onAddPCN, onAddPractice }) {

  const key       = `icb-${icb._id}`;
  const isOpen    = !!expanded[key];
  const feds      = icb.federations || [];
  const loosePCNs = (icb.pcns || []).filter(p => !p.federation);
  const totalPCNs = (icb.pcns || []).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

      {/* ICB Header */}
      <div
        onClick={() => toggle(key)}
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-blue-50/40 transition-colors select-none">
        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <Building2 size={14} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 truncate">{icb.name}</p>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            ICB{icb.code ? ` · ${icb.code}` : ""} · {totalPCNs} PCN{totalPCNs !== 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
            <ActionBtn icon={Pencil} onClick={() => onEditICB(icb)} hover="hover:text-blue-600 hover:bg-blue-50" />
            <ActionBtn icon={Trash2} onClick={() => onDeleteICB(icb._id)} hover="hover:text-red-600 hover:bg-red-50" />
          </div>
        )}
        <ChevronIcon open={isOpen} />
      </div>

      {/* Expanded body */}
      {isOpen && (
        <div className="border-t border-slate-100 bg-slate-50/60 p-3 space-y-2">

          {/* Federations */}
          {feds.map(fed => (
            <FederationCard
              key={fed._id}
              fed={fed}
              expanded={expanded}
              toggle={toggle}
              selected={selected}
              onSelect={onSelect}
              isAdmin={isAdmin}
              onEditFederation={onEditFederation}
              onDeleteFederation={onDeleteFederation}
              onEditPCN={onEditPCN}
              onDeletePCN={onDeletePCN}
              onEditPractice={onEditPractice}
              onDeletePractice={onDeletePractice}
              onAddPCN={onAddPCN}
              onAddPractice={onAddPractice}
            />
          ))}

          {/* PCNs with no federation */}
          {loosePCNs.map(pcn => (
            <PCNCard
              key={pcn._id}
              pcn={pcn}
              expanded={expanded}
              toggle={toggle}
              selected={selected}
              onSelect={onSelect}
              isAdmin={isAdmin}
              onEditPCN={onEditPCN}
              onDeletePCN={onDeletePCN}
              onEditPractice={onEditPractice}
              onDeletePractice={onDeletePractice}
              onAddPractice={onAddPractice}
            />
          ))}

          {feds.length === 0 && loosePCNs.length === 0 && (
            <p className="text-[11px] text-slate-400 italic text-center py-2">
              No federations or PCNs yet
            </p>
          )}

          {/* Add buttons */}
          {isAdmin && (
            <div className="flex gap-2 pt-1 flex-wrap">
              {onAddFederation && (
                <DashedBtn
                  color="indigo"
                  label="Add Federation"
                  onClick={() => onAddFederation(icb._id)}
                />
              )}
              {onAddPCN && (
                <DashedBtn
                  color="purple"
                  label="Add PCN"
                  onClick={() => onAddPCN({ icb: icb._id })}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Federation Card ───────────────────────────────────────────────────── */
function FederationCard({ fed, expanded, toggle, selected, onSelect, isAdmin,
  onEditFederation, onDeleteFederation,
  onEditPCN, onDeletePCN, onEditPractice, onDeletePractice,
  onAddPCN, onAddPractice }) {

  const key    = `fed-${fed._id}`;
  const isOpen = !!expanded[key];
  const pcns   = fed.pcns || [];

  return (
    <div className="rounded-xl border border-indigo-100 bg-white overflow-hidden shadow-sm">

      {/* Federation header */}
      <div
        onClick={() => toggle(key)}
        className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-indigo-50/50 transition-colors select-none">
        <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
          <Layers size={12} className="text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12.5px] font-bold text-slate-700 truncate">{fed.name}</p>
          <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
            {fed.type === "INT" ? "INT" : "Federation"} · {pcns.length} PCN{pcns.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
            <ActionBtn size={9} icon={Pencil} onClick={() => onEditFederation(fed)} hover="hover:text-blue-600 hover:bg-blue-50" />
            <ActionBtn size={9} icon={Trash2} onClick={() => onDeleteFederation(fed._id)} hover="hover:text-red-600 hover:bg-red-50" />
          </div>
        )}
        <ChevronIcon open={isOpen} size={12} />
      </div>

      {/* PCNs under this federation */}
      {isOpen && (
        <div className="border-t border-indigo-50 bg-indigo-50/20 px-3 py-2 space-y-1.5">
          {pcns.map(pcn => (
            <PCNCard
              key={pcn._id}
              pcn={pcn}
              expanded={expanded}
              toggle={toggle}
              selected={selected}
              onSelect={onSelect}
              isAdmin={isAdmin}
              onEditPCN={onEditPCN}
              onDeletePCN={onDeletePCN}
              onEditPractice={onEditPractice}
              onDeletePractice={onDeletePractice}
              onAddPractice={onAddPractice}
            />
          ))}
          {pcns.length === 0 && (
            <p className="text-[10px] text-slate-400 italic text-center py-1.5">No PCNs</p>
          )}
          {isAdmin && onAddPCN && (
            <DashedBtn
              color="purple"
              label="Add PCN"
              onClick={() => onAddPCN({ federation: fed._id })}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ── PCN Card ──────────────────────────────────────────────────────────── */
function PCNCard({ pcn, expanded, toggle, selected, onSelect, isAdmin,
  onEditPCN, onDeletePCN, onEditPractice, onDeletePractice, onAddPractice }) {

  const key       = `pcn-${pcn._id}`;
  const isOpen    = !!expanded[key];
  const isActive  = selected?.type === "pcn" && selected?.data?._id === pcn._id;
  const practices = pcn.practices || [];

  return (
    <div className={`rounded-xl border overflow-hidden transition-all
      ${isActive ? "border-purple-300 shadow-sm" : "border-slate-200 bg-white"}`}>

      <div
        onClick={() => onSelect({ type: "pcn", data: pcn })}
        className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors select-none
          ${isActive ? "bg-purple-50" : "bg-white hover:bg-purple-50/30"}`}>
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0
          ${isActive ? "bg-purple-200" : "bg-purple-100"}`}>
          <Network size={11} className="text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[12px] font-bold truncate
            ${isActive ? "text-purple-700" : "text-slate-700"}`}>
            {pcn.name}
          </p>
          <p className="text-[10px] text-slate-400">
            {practices.length} practice{practices.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
            <ActionBtn size={9} icon={Pencil} onClick={() => onEditPCN(pcn)} hover="hover:text-blue-600 hover:bg-blue-50" />
            <ActionBtn size={9} icon={Trash2} onClick={() => onDeletePCN(pcn._id)} hover="hover:text-red-600 hover:bg-red-50" />
          </div>
        )}
        <button
          onClick={e => { e.stopPropagation(); toggle(key); }}
          className="text-slate-400 hover:text-purple-500 shrink-0 transition-colors">
          <ChevronIcon open={isOpen} size={12} />
        </button>
      </div>

      {/* Practices */}
      {isOpen && (
        <div className="border-t border-slate-100 bg-slate-50/40 px-2.5 py-2 space-y-0.5">
          {practices.map(pr => (
            <PracticeRow
              key={pr._id}
              pr={pr}
              pcnId={pcn._id}
              selected={selected}
              onSelect={onSelect}
              isAdmin={isAdmin}
              onEdit={onEditPractice}
              onDelete={onDeletePractice}
            />
          ))}
          {practices.length === 0 && (
            <p className="text-[10px] text-slate-400 italic text-center py-1.5">No practices</p>
          )}
          {isAdmin && onAddPractice && (
            <DashedBtn
              color="emerald"
              label="Add Practice"
              onClick={() => onAddPractice({ pcn: pcn._id })}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ── Practice Row ──────────────────────────────────────────────────────── */
function PracticeRow({ pr, pcnId, selected, onSelect, isAdmin, onEdit, onDelete }) {
  const isActive = selected?.type === "practice" && selected?.data?._id === pr._id;

  return (
    <div
      onClick={() => onSelect({ type: "practice", data: pr })}
      className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg
        cursor-pointer transition-all border select-none
        ${isActive
          ? "bg-emerald-50 border-emerald-200"
          : "border-transparent hover:bg-white hover:border-slate-200"
        }`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0
        ${isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0
        ${isActive ? "bg-emerald-100" : "bg-emerald-50"}`}>
        <Stethoscope size={10} className={isActive ? "text-emerald-700" : "text-emerald-500"} />
      </div>
      <span className={`text-[11.5px] font-medium flex-1 truncate
        ${isActive ? "text-emerald-700 font-semibold" : "text-slate-600"}`}>
        {pr.name}
      </span>
      {pr.odsCode && (
        <span className="text-[9px] font-mono text-slate-400 hidden group-hover:block shrink-0">
          {pr.odsCode}
        </span>
      )}
      {isAdmin && (
        <div className="hidden group-hover:flex items-center gap-0.5 shrink-0"
          onClick={e => e.stopPropagation()}>
          <ActionBtn size={9} icon={Pencil} onClick={() => onEdit(pr, pcnId)} hover="hover:text-blue-600 hover:bg-blue-50" />
          <ActionBtn size={9} icon={Trash2} onClick={() => onDelete(pr._id)} hover="hover:text-red-600 hover:bg-red-50" />
        </div>
      )}
    </div>
  );
}

/* ── Primitives ────────────────────────────────────────────────────────── */
const DASHED_COLORS = {
  indigo:  "border-indigo-200 text-indigo-400 hover:bg-indigo-50",
  purple:  "border-purple-200 text-purple-400 hover:bg-purple-50",
  emerald: "border-emerald-200 text-emerald-500 hover:bg-emerald-50",
};

function DashedBtn({ color = "purple", label, onClick }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center justify-center gap-1 py-1.5 rounded-xl
        border border-dashed text-[11px] font-semibold transition-all
        ${DASHED_COLORS[color]}`}>
      <Plus size={10} /> {label}
    </button>
  );
}

function ActionBtn({ icon: Icon, onClick, hover, size = 10 }) {
  return (
    <button onClick={onClick}
      className={`w-5 h-5 rounded flex items-center justify-center
        text-slate-400 transition-colors ${hover}`}>
      <Icon size={size} />
    </button>
  );
}

function ChevronIcon({ open, size = 13 }) {
  return open
    ? <ChevronDown  size={size} className="text-slate-400 shrink-0" />
    : <ChevronRight size={size} className="text-slate-400 shrink-0" />;
}