import React, { useEffect, useMemo, useState, ReactNode } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Database } from "lucide-react";
import { Spinner } from "./Spinner";

const DEFAULT_PAGE_SIZES = [10, 20, 50];

export interface ColumnDef<T = any> {
  id?: string;
  key?: string;
  header?: ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  hideOnMobile?: boolean;
  mobileLabel?: ReactNode;
  mobileCellClassName?: string;
  accessor?: (row: T, index: number) => ReactNode;
  render?: (row: T, index: number) => ReactNode;
  mobileRender?: (row: T, index: number) => ReactNode;
}

function resolveValue<T>(column: ColumnDef<T>, row: T, index: number, mode: "desktop" | "mobile" = "desktop") {
  if (mode === "mobile" && column.mobileRender) return column.mobileRender(row, index);
  if (column.render)                             return column.render(row, index);
  if (typeof column.accessor === "function")     return column.accessor(row, index);
  if (column.key)                                return (row as any)?.[column.key];
  return "";
}

interface MobileCardProps<T> {
  row: T;
  index: number;
  columns: ColumnDef<T>[];
  renderMobileRow?: (row: T, index: number) => ReactNode;
  getRowClassName?: (row: T, index: number) => string;
}

/* ── Mobile Card — auto shows ALL non-hidden columns ── */
function MobileCard<T>({ row, index, columns, renderMobileRow, getRowClassName }: MobileCardProps<T>) {
  if (renderMobileRow) return renderMobileRow(row, index);

  // First column = "hero" — shown prominently at top
  const [heroCol, ...restCols] = columns.filter((c) => !c.hideOnMobile);

  return (
    <div className={`
      relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white
      shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]
      transition-all duration-200 active:scale-[0.99]
      ${getRowClassName?.(row, index) || ""}
    `}>
      {/* Accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-blue-500 to-indigo-600 rounded-l-2xl" />

      {/* Hero row */}
      {heroCol && (
        <div className="px-4 pt-4 pb-3 pl-5 border-b border-slate-100">
          {resolveValue(heroCol, row, index, "mobile")}
        </div>
      )}

      {/* Rest of fields — 2 column grid */}
      <div className="px-4 pt-3 pb-4 pl-5 grid grid-cols-2 gap-x-4 gap-y-3">
        {restCols.map((col) => {
          const val = resolveValue(col, row, index, "mobile");
          if (val === "" || val === null || val === undefined) return null;
          return (
            <div key={col.id || col.key || (col.header as string)}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                {col.mobileLabel || col.header}
              </p>
              <div className={col.mobileCellClassName || "text-xs font-medium text-slate-700"}>
                {val}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data?: T[];
  rowKey?: string | ((row: T) => string | number);
  loading?: boolean;
  loadingText?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyState?: ReactNode;
  getRowClassName?: (row: T, index: number) => string;
  renderMobileRow?: (row: T, index: number) => ReactNode;
  className?: string;
  tableClassName?: string;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  pagination?: boolean;
  controlledPage?: number;
  onPageChange?: (page: number) => void;
  controlledPageSize?: number;
  onPageSizeChange?: (size: number) => void;
  totalItems?: number;
}

/* ══════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════ */
export default function DataTable<T>({
  columns,
  data = [],
  rowKey,
  loading = false,
  loadingText = "Loading...",
  emptyTitle = "No records found",
  emptyDescription = "",
  emptyState,
  getRowClassName,
  renderMobileRow,
  className = "",
  tableClassName = "min-w-full text-sm",
  initialPageSize = 10,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  pagination = true,
  controlledPage,
  onPageChange,
  controlledPageSize,
  onPageSizeChange,
  totalItems,
}: DataTableProps<T>) {
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const isControlledPage     = typeof controlledPage     === "number";
  const isControlledPageSize = typeof controlledPageSize === "number";

  const activePage     = isControlledPage     ? (controlledPage as number)    : page;
  const activePageSize = isControlledPageSize ? (controlledPageSize as number) : pageSize;
  const totalCount     = typeof totalItems === "number" ? totalItems : data.length;
  const pageCount      = pagination ? Math.max(1, Math.ceil(totalCount / activePageSize)) : 1;

  useEffect(() => {
    if (!pagination) return;
    if (activePage > pageCount) {
      if (isControlledPage) onPageChange?.(pageCount);
      else setPage(pageCount);
    }
  }, [activePage, isControlledPage, onPageChange, pageCount, pagination]);

  useEffect(() => {
    if (!pagination || isControlledPage) return;
    setPage(1);
  }, [data.length, isControlledPage, pagination]);

  const visibleRows = useMemo(() => {
    if (!pagination || typeof totalItems === "number") return data;
    const start = (activePage - 1) * activePageSize;
    return data.slice(start, start + activePageSize);
  }, [activePage, activePageSize, data, pagination, totalItems]);

  const startItem = totalCount === 0 ? 0 : (activePage - 1) * activePageSize + 1;
  const endItem   = Math.min(totalCount, activePage * activePageSize);

  const updatePage = (next: number) => {
    if (isControlledPage) onPageChange?.(next);
    else setPage(next);
  };

  const updatePageSize = (next: number | string) => {
    const n = Number(next);
    if (isControlledPageSize) onPageSizeChange?.(n);
    else setPageSize(n);
    if (isControlledPage) onPageChange?.(1);
    else setPage(1);
  };

  const pageNumbers = useMemo(() => {
    if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
    const delta = 2;
    const range: (number | string)[] = [];
    for (
      let i = Math.max(2, activePage - delta);
      i <= Math.min(pageCount - 1, activePage + delta);
      i++
    ) range.push(i);
    if (activePage - delta > 2)             range.unshift("...");
    if (activePage + delta < pageCount - 1) range.push("...");
    range.unshift(1);
    range.push(pageCount);
    return range;
  }, [activePage, pageCount]);



  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <div className={`w-full flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${className}`}>

      {/* ══ DESKTOP TABLE ════════════════════════════════════ */}
      <div className="hidden md:block w-full overflow-x-auto [scrollbar-width:thin] [scrollbar-color:#e2e8f0_transparent]">
        <style>{`
          .dt-wrap::-webkit-scrollbar { height: 4px; }
          .dt-wrap::-webkit-scrollbar-track { background: transparent; }
          .dt-wrap::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
          .dt-wrap::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        `}</style>

        <div className="dt-wrap w-full overflow-x-auto">
          <table className={`w-full border-collapse ${tableClassName}`}>

            {/* ── Header ── */}
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                {columns.map((col, i) => (
                  <th
                    key={col.id || col.key || (col.header as string) || i}
                    className={col.headerClassName || `
                      px-5 py-3.5 text-left text-[10.5px] font-bold uppercase
                      tracking-[0.08em] text-slate-400 whitespace-nowrap
                      ${i === 0 ? "pl-5" : ""}
                    `}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* ── Body ── */}
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Spinner className="h-8 w-8 text-blue-600" />
                      {loadingText && <p className="text-sm font-semibold text-slate-500">{loadingText}</p>}
                    </div>
                  </td>
                </tr>
              ) : visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-20 text-center">
                    {emptyState || (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                          <Database size={22} className="text-slate-300" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-500">{emptyTitle}</p>
                          {emptyDescription && (
                            <p className="mt-1 text-xs text-slate-400">{emptyDescription}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                visibleRows.map((row, index) => (
                  <tr
                    key={typeof rowKey === "function" ? rowKey(row) : (row as any)?.[rowKey as string] ?? index}
                    className={
                      getRowClassName?.(row, index) ||
                      "border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors duration-150"
                    }
                  >
                    {columns.map((col, ci) => (
                      <td
                        key={col.id || col.key || (col.header as string) || ci}
                        className={col.cellClassName || `
                          px-5 py-4 text-sm text-slate-700 align-middle
                          ${ci === 0 ? "pl-5" : ""}
                        `}
                      >
                        {resolveValue(col, row, index) ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ MOBILE CARDS ═════════════════════════════════════ */}
      <div className="md:hidden w-full bg-slate-50/60 p-3 space-y-2.5">
        {loading ? (
          <div className="py-14 text-center">
            <Spinner className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            {loadingText && <p className="text-sm font-semibold text-slate-500">{loadingText}</p>}
          </div>
        ) : visibleRows.length === 0 ? (
          emptyState || (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-14 text-center">
              <Database size={28} className="text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-500">{emptyTitle}</p>
              {emptyDescription && (
                <p className="mt-1 text-xs text-slate-400">{emptyDescription}</p>
              )}
            </div>
          )
        ) : (
          visibleRows.map((row, index) => (
            <MobileCard
              key={typeof rowKey === "function" ? rowKey(row) : (row as any)?.[rowKey as string] ?? index}
              row={row}
              index={index}
              columns={columns}
              renderMobileRow={renderMobileRow}
              getRowClassName={getRowClassName}
            />
          ))
        )}
      </div>

      {/* ══ PAGINATION ═══════════════════════════════════════ */}
      {pagination && totalCount > 0 && (
        <div className="border-t border-slate-100 bg-white px-5 py-3 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">

            {/* Left — count + rows per page */}
            <div className="flex items-center gap-4 flex-wrap">
              <p className="text-xs text-slate-400">
                Showing{" "}
                <span className="font-bold text-slate-600">{startItem}–{endItem}</span>
                {" "}of{" "}
                <span className="font-bold text-slate-600">{totalCount.toLocaleString()}</span>
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">Rows</span>
                <select
                  value={activePageSize}
                  onChange={(e) => updatePageSize(e.target.value)}
                  className="h-7 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-600 outline-none focus:border-blue-400 focus:bg-white cursor-pointer transition-all"
                >
                  {pageSizeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Right — navigation */}
            <div className="flex items-center gap-1">
              <NavBtn onClick={() => updatePage(1)} disabled={activePage <= 1} title="First page">
                <ChevronsLeft size={13} />
              </NavBtn>
              <NavBtn onClick={() => updatePage(activePage - 1)} disabled={activePage <= 1} title="Previous">
                <ChevronLeft size={13} />
              </NavBtn>

              <div className="flex items-center gap-0.5 mx-1">
                {pageNumbers.map((num, i) =>
                  num === "..." ? (
                    <span key={`e-${i}`} className="w-7 text-center text-xs text-slate-400">…</span>
                  ) : (
                    <button
                      key={num}
                      type="button"
                      onClick={() => updatePage(num as number)}
                      className={`h-8 min-w-[2rem] px-2.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                        num === activePage
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-200/60"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                      }`}
                    >
                      {num}
                    </button>
                  )
                )}
              </div>

              <NavBtn onClick={() => updatePage(activePage + 1)} disabled={activePage >= pageCount} title="Next">
                <ChevronRight size={13} />
              </NavBtn>
              <NavBtn onClick={() => updatePage(pageCount)} disabled={activePage >= pageCount} title="Last page">
                <ChevronsRight size={13} />
              </NavBtn>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

/* ── Nav Button atom ── */
interface NavBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function NavBtn({ onClick, disabled, children, title }: NavBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150"
    >
      {children}
    </button>
  );
}
