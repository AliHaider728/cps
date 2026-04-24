import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Network,
  Stethoscope,
  Layers,
  ChevronRight,
  ChevronDown,
  Search,
  TrendingUp,
  MapPin,
  ArrowRight,
  Loader2,
  X,
} from "lucide-react";
import { useHierarchy, useSearchClients } from "../../../hooks/useHierarchy";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { setHierarchySearch } from "../../../slices/clientsSlice";

/* ---------------- Small UI primitives ---------------- */

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}
    >
      <Icon size={22} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-3xl font-bold text-slate-800 leading-none mt-1">
        {value ?? "—"}
      </p>
    </div>
  </div>
);

const Badge = ({ children, tone = "slate" }) => {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    teal: "bg-teal-50 text-teal-700",
    indigo: "bg-indigo-50 text-indigo-700",
    green: "bg-green-50 text-green-700",
  };
  return (
    <span
      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${tones[tone] || tones.slate}`}
    >
      {children}
    </span>
  );
};

/* ---------------- Highlight helper ---------------- */

const Highlight = ({ text = "", query = "" }) => {
  if (!query) return <>{text}</>;
  const parts = String(text).split(new RegExp(`(${escapeRegExp(query)})`, "ig"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-yellow-100 text-slate-900 rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
};

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ---------------- Hierarchy rows ---------------- */

const PracticeRow = ({ practice, navigate, query }) => (
  <button
    onClick={() =>
      navigate(`/dashboard/super-admin/clients/practice/${practice._id}`)
    }
    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors group text-left"
  >
    <div className="w-7 h-7 rounded-md bg-teal-50 flex items-center justify-center shrink-0">
      <Stethoscope size={13} className="text-teal-600" />
    </div>
    <div className="flex-1 min-w-0">
      <span className="text-sm font-semibold text-slate-700 group-hover:text-teal-700 truncate block">
        <Highlight text={practice.name} query={query} />
      </span>
      {practice.odsCode && (
        <span className="text-xs text-slate-400">
          ODS: <Highlight text={practice.odsCode} query={query} />
        </span>
      )}
    </div>
    <div className="flex items-center gap-2">
      {practice.contractType && (
        <Badge>{practice.contractType}</Badge>
      )}
      <ArrowRight
        size={14}
        className="text-slate-300 group-hover:text-teal-500 transition-colors"
      />
    </div>
  </button>
);

const PCNCard = ({ pcn, navigate, query, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const practiceCount = pcn.practices?.length || 0;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-2">
      <div
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left group cursor-pointer"
        onClick={() => practiceCount && setOpen((o) => !o)}
      >
        <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
          <Network size={16} className="text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">
            <Highlight text={pcn.name} query={query} />
          </p>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {pcn.federation?.name && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Layers size={10} />
                {pcn.federation.name}
              </span>
            )}
            <span className="text-xs text-slate-400">
              {practiceCount} practice{practiceCount !== 1 ? "s" : ""}
            </span>
            {pcn.annualSpend > 0 && (
              <span className="text-xs font-semibold text-green-600">
                £{pcn.annualSpend.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {pcn.contractType && (
            <Badge tone="purple">{pcn.contractType}</Badge>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dashboard/super-admin/clients/pcn/${pcn._id}`);
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-all"
          >
            View
          </button>
          {practiceCount > 0 && (
            <ChevronDown
              size={15}
              className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          )}
        </div>
      </div>
      {open && practiceCount > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/50 divide-y divide-slate-100">
          {pcn.practices.map((p) => (
            <PracticeRow
              key={p._id}
              practice={p}
              navigate={navigate}
              query={query}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ICBSection = ({ icb, navigate, query, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  const pcnCount = icb.pcns?.length || 0;
  const fedCount = icb.federations?.length || 0;
  const practiceCount =
    icb.pcns?.reduce((s, p) => s + (p.practices?.length || 0), 0) || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4">
      <button
        className="w-full flex items-center gap-4 px-6 py-5 hover:bg-slate-50 transition-colors text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <Building2 size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-slate-800">
            <Highlight text={icb.name} query={query} />
          </p>
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            {icb.region && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin size={11} />
                {icb.region}
              </span>
            )}
            <span className="text-xs text-slate-400">{pcnCount} PCNs</span>
            <span className="text-xs text-slate-400">
              {fedCount} Federations
            </span>
            <span className="text-xs text-slate-400">
              {practiceCount} Practices
            </span>
          </div>
        </div>
        {icb.code && <Badge tone="blue">{icb.code}</Badge>}
        <ChevronDown
          size={17}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && pcnCount > 0 && (
        <div className="px-6 pb-5 border-t border-slate-100 pt-4">
          {icb.pcns.map((pcn) => (
            <PCNCard
              key={pcn._id}
              pcn={pcn}
              navigate={navigate}
              query={query}
            />
          ))}
        </div>
      )}
      {open && pcnCount === 0 && (
        <div className="px-6 pb-6 pt-3 border-t border-slate-100 text-center text-slate-400 text-sm">
          No active PCNs under this ICB
        </div>
      )}
    </div>
  );
};

/* ---------------- Search dropdown ---------------- */

const SearchResults = ({ results, navigate, onSelect, query }) => {
  const typeIcon = { icb: Building2, pcn: Network, practice: Stethoscope };
  const typeColor = {
    icb: "bg-blue-50 text-blue-600",
    pcn: "bg-purple-50 text-purple-600",
    practice: "bg-teal-50 text-teal-600",
  };
  const getPath = (r) => `/dashboard/super-admin/clients/${r._type}/${r._id}`;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden max-h-[420px] overflow-y-auto">
      {results.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <Search size={20} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600">
            No matches found
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Try a different name or ODS code
          </p>
        </div>
      ) : (
        results.map((r, i) => {
          const Icon = typeIcon[r._type] || Building2;
          return (
            <button
              key={`${r._type}-${r._id}-${i}`}
              onMouseDown={(e) => {
                // use mouseDown so it fires before input's onBlur
                e.preventDefault();
                navigate(getPath(r));
                onSelect();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-b-0"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeColor[r._type]}`}
              >
                <Icon size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  <Highlight text={r.name} query={query} />
                </p>
                <p className="text-xs text-slate-400 capitalize mt-0.5 truncate">
                  {r._type}
                  {r.odsCode ? ` · ${r.odsCode}` : ""}
                  {r.region ? ` · ${r.region}` : ""}
                </p>
              </div>
              <ArrowRight size={14} className="text-slate-300 shrink-0" />
            </button>
          );
        })
      )}
    </div>
  );
};

/* ---------------- Page ---------------- */

export default function ClientsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const search = useAppSelector((state) => state.clients.hierarchySearch);

  const [debounced, setDebounced] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Open dropdown whenever the user is typing or focused with a query
  useEffect(() => {
    if (isFocused && debounced.length > 0) setShowDropdown(true);
    if (debounced.length === 0) setShowDropdown(false);
  }, [debounced, isFocused]);

  // Close dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Keyboard: Escape clears the search
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        dispatch(setHierarchySearch(""));
        setShowDropdown(false);
      }
    };
    if (isFocused) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFocused, dispatch]);

  // React Query — server-side search
  const { data, isLoading } = useHierarchy();
  const { data: searchData, isFetching: searching } =
    useSearchClients(debounced);

  const counts = data?.counts || {};
  const tree = data?.tree || [];
  const serverResults = searchData?.results || [];

  // Client-side fallback: if server returned no results but we have a query
  // and a loaded tree, filter the tree locally so the user always gets
  // immediate, useful feedback (this also fixes the "search not working" case
  // when the backend endpoint is missing or slow).
  const localResults = useMemo(() => {
    if (!debounced) return [];
    const q = debounced.toLowerCase();
    const out = [];
    for (const icb of tree) {
      if (
        icb.name?.toLowerCase().includes(q) ||
        icb.code?.toLowerCase().includes(q) ||
        icb.region?.toLowerCase().includes(q)
      ) {
        out.push({ ...icb, _type: "icb" });
      }
      for (const pcn of icb.pcns || []) {
        if (
          pcn.name?.toLowerCase().includes(q) ||
          pcn.federation?.name?.toLowerCase().includes(q)
        ) {
          out.push({ ...pcn, _type: "pcn" });
        }
        for (const pr of pcn.practices || []) {
          if (
            pr.name?.toLowerCase().includes(q) ||
            pr.odsCode?.toLowerCase().includes(q)
          ) {
            out.push({ ...pr, _type: "practice" });
          }
        }
      }
    }
    return out.slice(0, 30);
  }, [debounced, tree]);

  const searchResults =
    serverResults.length > 0 ? serverResults : localResults;

  // Filter the rendered hierarchy so visible cards also reflect the query
  const filteredTree = useMemo(() => {
    if (!debounced) return tree;
    const q = debounced.toLowerCase();
    return tree
      .map((icb) => {
        const icbHit =
          icb.name?.toLowerCase().includes(q) ||
          icb.code?.toLowerCase().includes(q) ||
          icb.region?.toLowerCase().includes(q);

        const pcns = (icb.pcns || [])
          .map((pcn) => {
            const pcnHit =
              pcn.name?.toLowerCase().includes(q) ||
              pcn.federation?.name?.toLowerCase().includes(q);

            const practices = (pcn.practices || []).filter(
              (pr) =>
                pr.name?.toLowerCase().includes(q) ||
                pr.odsCode?.toLowerCase().includes(q),
            );

            if (pcnHit || practices.length || icbHit) {
              return {
                ...pcn,
                practices: practices.length
                  ? practices
                  : pcnHit || icbHit
                    ? pcn.practices
                    : [],
              };
            }
            return null;
          })
          .filter(Boolean);

        if (icbHit || pcns.length) {
          return { ...icb, pcns: icbHit && !pcns.length ? icb.pcns : pcns };
        }
        return null;
      })
      .filter(Boolean);
  }, [debounced, tree]);

  const clearSearch = () => {
    dispatch(setHierarchySearch(""));
    setShowDropdown(false);
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium">
            Loading client hierarchy…
          </p>
        </div>
      </div>
    );

  return (
    <div>
      {/* Page header */}
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Client Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Full hierarchy: ICB → Federation / INT → Client → Practice
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/super-admin/clients/icb")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-md transition-all"
        >
          <Building2 size={14} /> Manage ICBs
        </button>
      </div>

     
      {/* Search */}
      <div className="relative mb-7" ref={wrapperRef}>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          {searching && (
            <Loader2
              size={15}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 animate-spin"
            />
          )}
          {search && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
          <input
            value={search}
            onChange={(e) => {
              dispatch(setHierarchySearch(e.target.value));
              if (e.target.value) setShowDropdown(true);
            }}
            onFocus={() => {
              setIsFocused(true);
              if (debounced) setShowDropdown(true);
            }}
            onBlur={() => setIsFocused(false)}
            placeholder="Search ICBs, PCNs, Practices or ODS codes…"
            className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 shadow-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
          />
        </div>
        {showDropdown && debounced && (
          <SearchResults
            results={searchResults}
            navigate={navigate}
            onSelect={clearSearch}
            query={debounced}
          />
        )}
      </div>

      {/* Quick nav — redesigned tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[
          {
            label: "ICBs",
            desc: "Integrated Care Boards",
            path: "/dashboard/super-admin/clients/icb",
            icon: Building2,
            count: counts.icbs,
            gradient: "from-blue-500 to-blue-700",
            ring: "ring-blue-100",
            accent: "bg-blue-50 text-blue-700",
            glow: "group-hover:shadow-blue-200/60",
          },
          {
            label: "Federations",
            desc: "Provider federations",
            path: "/dashboard/super-admin/clients/federation",
            icon: Layers,
            count: counts.federations,
            gradient: "from-indigo-500 to-indigo-700",
            ring: "ring-indigo-100",
            accent: "bg-indigo-50 text-indigo-700",
            glow: "group-hover:shadow-indigo-200/60",
          },
          {
            label: "PCNs",
            desc: "Primary Care Networks",
            path: "/dashboard/super-admin/clients/pcn",
            icon: Network,
            count: counts.pcns,
            gradient: "from-purple-500 to-fuchsia-600",
            ring: "ring-purple-100",
            accent: "bg-purple-50 text-purple-700",
            glow: "group-hover:shadow-purple-200/60",
          },
          {
            label: "Practices",
            desc: "GP practices",
            path: "/dashboard/super-admin/clients/practice",
            icon: Stethoscope,
            count: counts.practices,
            gradient: "from-teal-500 to-emerald-600",
            ring: "ring-teal-100",
            accent: "bg-teal-50 text-teal-700",
            glow: "group-hover:shadow-teal-200/60",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`group relative overflow-hidden text-left rounded-2xl bg-white border border-slate-200 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${item.glow} focus:outline-none focus:ring-4 ${item.ring}`}
            >
              {/* Decorative gradient blob */}
              <div
                className={`pointer-events-none absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${item.gradient} opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500`}
              />
              {/* Bottom gradient bar */}
              <div
                className={`pointer-events-none absolute left-0 right-0 bottom-0 h-1 bg-gradient-to-r ${item.gradient} opacity-70 group-hover:opacity-100 transition-opacity`}
              />

              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-md shadow-slate-900/10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                >
                  <Icon size={22} className="text-white" strokeWidth={2.2} />
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg ${item.accent}`}
                >
                  {item.count ?? 0}
                </span>
              </div>

              <p className="text-base font-bold text-slate-800 leading-tight">
                {item.label}
              </p>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>

              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-500 group-hover:text-slate-800 transition-colors">
                <span>Manage</span>
                <ArrowRight
                  size={13}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Hierarchy tree */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={14} /> Hierarchy View
          </h2>
          {debounced && (
            <p className="text-xs text-slate-500">
              Showing matches for{" "}
              <span className="font-semibold text-slate-700">
                “{debounced}”
              </span>{" "}
              ·{" "}
              <button
                onClick={clearSearch}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Clear
              </button>
            </p>
          )}
        </div>

        {!filteredTree.length ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Building2 size={36} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">
              {debounced ? "No matches in hierarchy" : "No data found"}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {debounced
                ? "Try a different search term"
                : "Add ICBs to get started"}
            </p>
          </div>
        ) : (
          filteredTree.map((icb) => (
            <ICBSection
              key={icb._id}
              icb={icb}
              navigate={navigate}
              query={debounced}
              defaultOpen={!!debounced || true}
            />
          ))
        )}
      </div>
    </div>
  );
}
