import { useState } from "react";
import { Building2, Network, Stethoscope, ChevronRight, ChevronDown, Pencil, Trash2, Loader2 } from "lucide-react";

export default function HierarchyTree({ tree, loading, selected, onSelect, onEditICB, onDeleteICB, onEditPCN, onDeletePCN, onEditPractice, onDeletePractice }) {
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  if (loading) return (
    <div className="flex items-center justify-center py-10">
      <Loader2 size={20} className="animate-spin text-blue-600"/>
    </div>
  );

  if (tree.length === 0) return (
    <p className="text-center text-sm text-slate-400 py-8">No clients found</p>
  );

  return (
    <div className="p-2">
      {tree.map(icb => (
        <div key={icb._id}>
          {/* ICB */}
          <div className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-slate-50 group">
            <button onClick={() => toggle(icb._id)} className="text-slate-400 shrink-0">
              {expanded[icb._id]
                ? <ChevronDown size={14}/>
                : <ChevronRight size={14}/>
              }
            </button>
            <Building2 size={14} className="text-blue-500 shrink-0"/>
            <span className="text-sm font-bold text-slate-700 flex-1 truncate">{icb.name}</span>
            <span className="text-xs text-slate-400 shrink-0">{icb.pcns?.length || 0}</span>
            <div className="hidden group-hover:flex items-center gap-1">
              <button
                onClick={() => onEditICB(icb)}
                className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600"
              >
                <Pencil size={11}/>
              </button>
              <button
                onClick={() => onDeleteICB(icb._id)}
                className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
              >
                <Trash2 size={11}/>
              </button>
            </div>
          </div>

          {/* PCNs */}
          {expanded[icb._id] && icb.pcns?.map(pcn => (
            <div key={pcn._id} className="ml-4">
              <div
                onClick={() => onSelect({ type: "pcn", data: pcn })}
                className={`flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-slate-50 group cursor-pointer
                  ${selected?.data?._id === pcn._id ? "bg-blue-50 border border-blue-200" : ""}`}
              >
                <button
                  onClick={e => { e.stopPropagation(); toggle(pcn._id); }}
                  className="text-slate-400 shrink-0"
                >
                  {expanded[pcn._id]
                    ? <ChevronDown size={13}/>
                    : <ChevronRight size={13}/>
                  }
                </button>
                <Network size={13} className="text-purple-500 shrink-0"/>
                <span className="text-sm font-semibold text-slate-700 flex-1 truncate">{pcn.name}</span>
                <span className="text-xs text-slate-400 shrink-0">{pcn.practices?.length || 0}</span>
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={e => { e.stopPropagation(); onEditPCN(pcn); }}
                    className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600"
                  >
                    <Pencil size={11}/>
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onDeletePCN(pcn._id); }}
                    className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 size={11}/>
                  </button>
                </div>
              </div>

              {/* Practices */}
              {expanded[pcn._id] && pcn.practices?.map(pr => (
                <div
                  key={pr._id}
                  onClick={() => onSelect({ type: "practice", data: pr })}
                  className={`flex items-center gap-2 ml-4 px-2 py-1.5 rounded-xl
                    hover:bg-slate-50 group cursor-pointer
                    ${selected?.data?._id === pr._id ? "bg-blue-50 border border-blue-200" : ""}`}
                >
                  <Stethoscope size={12} className="text-green-500 shrink-0"/>
                  <span className="text-xs font-medium text-slate-600 flex-1 truncate">{pr.name}</span>
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button
                      onClick={e => { e.stopPropagation(); onEditPractice(pr, pcn._id); }}
                      className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600"
                    >
                      <Pencil size={10}/>
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); onDeletePractice(pr._id); }}
                      className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 size={10}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}