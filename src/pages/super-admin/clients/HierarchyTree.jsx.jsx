/**
 * HierarchyTree.jsx
 * 4-level expandable tree: ICB → Federation → PCN → Practice
 * Auto-expands when search is active.
 */
import { useState, useEffect } from "react";
import {
  Building2, Layers, Network, Stethoscope,
  ChevronRight, ChevronDown,
  Pencil, Trash2, Loader2,
} from "lucide-react";

export default function HierarchyTree({
  tree, loading, selected,
  onSelect,
  onEditICB,        onDeleteICB,
  onEditFederation, onDeleteFederation,
  onEditPCN,        onDeletePCN,
  onEditPractice,   onDeletePractice,
}) {
  const [expanded, setExpanded] = useState({});

  /* Auto-expand everything when the tree changes (i.e. after search) */
  useEffect(() => {
    if (!tree?.length) return;
    const next = {};
    tree.forEach(icb => {
      next[icb._id] = true;
      (icb.pcns || []).forEach(pcn => {
        next[pcn._id] = true;
      });
    });
    setExpanded(next);
  }, [tree]);

  const toggle = (id, e) => {
    e?.stopPropagation();
    setExpanded(p => ({ ...p, [id]: !p[id] }));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-14 gap-3">
      <Loader2 size={22} className="animate-spin text-blue-500" />
      <p className="text-xs text-slate-400">Loading…</p>
    </div>
  );

  if (!tree?.length) return (
    <div className="flex flex-col items-center justify-center py-14 gap-2">
      <Building2 size={28} className="text-slate-200" />
      <p className="text-sm text-slate-400">No clients found</p>
    </div>
  );

  return (
    <div className="py-2 px-1">
      {tree.map(icb => (
        <ICBRow
          key={icb._id}
          icb={icb}
          expanded={expanded}
          toggle={toggle}
          selected={selected}
          onSelect={onSelect}
          onEditICB={onEditICB}
          onDeleteICB={onDeleteICB}
          onEditPCN={onEditPCN}
          onDeletePCN={onDeletePCN}
          onEditPractice={onEditPractice}
          onDeletePractice={onDeletePractice}
        />
      ))}
    </div>
  );
}

/* ── ICB row ── */
function ICBRow({ icb, expanded, toggle, selected, onSelect,
  onEditICB, onDeleteICB, onEditPCN, onDeletePCN, onEditPractice, onDeletePractice }) {
  const isOpen = !!expanded[icb._id];
  const pcnCount = (icb.pcns || []).length;

  return (
    <div>
      <Row
        depth={0}
        icon={Building2}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        label={icb.name}
        count={pcnCount}
        isOpen={isOpen}
        onToggle={e => toggle(icb._id, e)}
        onEdit={() => onEditICB(icb)}
        onDelete={() => onDeleteICB(icb._id)}
      />
      {isOpen && (
        <div className="ml-3">
          {(icb.pcns || []).map(pcn => (
            <PCNRow
              key={pcn._id}
              pcn={pcn}
              expanded={expanded}
              toggle={toggle}
              selected={selected}
              onSelect={onSelect}
              onEditPCN={onEditPCN}
              onDeletePCN={onDeletePCN}
              onEditPractice={onEditPractice}
              onDeletePractice={onDeletePractice}
            />
          ))}
          {!pcnCount && <Empty label="No PCNs" />}
        </div>
      )}
    </div>
  );
}

/* ── PCN row ── */
function PCNRow({ pcn, expanded, toggle, selected, onSelect,
  onEditPCN, onDeletePCN, onEditPractice, onDeletePractice }) {
  const isOpen   = !!expanded[pcn._id];
  const isActive = selected?.type === "pcn" && selected?.data?._id === pcn._id;
  const prCount  = (pcn.practices || []).length;

  return (
    <div>
      <Row
        depth={1}
        icon={Network}
        iconBg={isActive ? "bg-blue-200"   : "bg-purple-100"}
        iconColor={isActive ? "text-blue-700" : "text-purple-600"}
        label={pcn.name}
        sublabel={pcn.federationName || pcn.federation?.name}
        count={prCount}
        isOpen={isOpen}
        isActive={isActive}
        onToggle={e => { e.stopPropagation(); toggle(pcn._id, e); }}
        onClick={() => onSelect({ type: "pcn", data: pcn })}
        onEdit={e => { e.stopPropagation(); onEditPCN(pcn); }}
        onDelete={e => { e.stopPropagation(); onDeletePCN(pcn._id); }}
      />
      {isOpen && (
        <div className="ml-4">
          {(pcn.practices || []).map(pr => (
            <PracticeRow
              key={pr._id}
              practice={pr}
              pcnId={pcn._id}
              selected={selected}
              onSelect={onSelect}
              onEdit={onEditPractice}
              onDelete={onDeletePractice}
            />
          ))}
          {!prCount && <Empty label="No practices" />}
        </div>
      )}
    </div>
  );
}

/* ── Practice row ── */
function PracticeRow({ practice: pr, pcnId, selected, onSelect, onEdit, onDelete }) {
  const isActive = selected?.type === "practice" && selected?.data?._id === pr._id;

  return (
    <div
      onClick={() => onSelect({ type: "practice", data: pr })}
      className={`group flex items-center gap-2 px-2 py-1.5 mx-1 rounded-lg
        cursor-pointer transition-all border
        ${isActive
          ? "bg-emerald-50 border-emerald-200"
          : "border-transparent hover:bg-slate-50"
        }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ml-1
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
        <span className="text-[9px] font-mono text-slate-400 hidden group-hover:block">
          {pr.odsCode}
        </span>
      )}
      <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
        <ActionBtn icon={Pencil} size={9} onClick={e => { e.stopPropagation(); onEdit(pr, pcnId); }} hover="hover:text-blue-600 hover:bg-blue-50" />
        <ActionBtn icon={Trash2} size={9} onClick={e => { e.stopPropagation(); onDelete(pr._id); }}  hover="hover:text-red-600 hover:bg-red-50"  />
      </div>
    </div>
  );
}

/* ── Generic row ── */
function Row({
  depth, icon: Icon, iconBg, iconColor, label, sublabel, count,
  isOpen, isActive, onToggle, onClick, onEdit, onDelete,
}) {
  const py    = depth === 0 ? "py-2"   : "py-1.5";
  const px    = depth === 0 ? "px-2"   : "px-2";
  const text  = depth === 0 ? "text-[13px] font-bold" : "text-[12.5px] font-semibold";

  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-2 ${py} ${px} mx-1 rounded-xl
        transition-all border cursor-pointer
        ${isActive
          ? "bg-blue-50 border-blue-200"
          : "border-transparent hover:bg-slate-50"
        }
        ${onClick ? "cursor-pointer" : "cursor-default"}
      `}
    >
      <button
        onClick={onToggle}
        className="w-4 h-4 flex items-center justify-center shrink-0
          text-slate-400 hover:text-slate-600"
      >
        {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>

      <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={12} className={iconColor} />
      </div>

      <div className="flex-1 min-w-0">
        <span className={`${text} truncate block ${isActive ? "text-blue-700" : "text-slate-700"}`}>
          {label}
        </span>
        {sublabel && (
          <span className="text-[10px] text-slate-400 truncate block">{sublabel}</span>
        )}
      </div>

      {count != null && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0
          ${isActive ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"}`}>
          {count}
        </span>
      )}

      <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
        {onEdit   && <ActionBtn icon={Pencil} size={10} onClick={e => { e.stopPropagation(); onEdit(e); }}   hover="hover:text-blue-600 hover:bg-blue-50" />}
        {onDelete && <ActionBtn icon={Trash2} size={10} onClick={e => { e.stopPropagation(); onDelete(e); }} hover="hover:text-red-600 hover:bg-red-50"  />}
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, onClick, hover, size = 10 }) {
  return (
    <button
      onClick={onClick}
      className={`w-5 h-5 rounded flex items-center justify-center
        text-slate-400 transition-colors ${hover}`}
    >
      <Icon size={size} />
    </button>
  );
}

function Empty({ label }) {
  return (
    <p className="text-[10px] text-slate-400 italic pl-6 py-1">{label}</p>
  );
}