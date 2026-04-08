import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const DEFAULT_PAGE_SIZES = [10, 20, 50];

function resolveValue(column, row, index, mode = "desktop") {
  if (mode === "mobile" && column.mobileRender) {
    return column.mobileRender(row, index);
  }
  if (column.render) {
    return column.render(row, index);
  }
  if (typeof column.accessor === "function") {
    return column.accessor(row, index);
  }
  if (column.key) {
    return row?.[column.key];
  }
  return "";
}

function MobileCard({ row, index, columns, renderMobileRow, getRowClassName }) {
  if (renderMobileRow) {
    return renderMobileRow(row, index);
  }

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${
        getRowClassName?.(row, index) || ""
      }`}
    >
      <div className="space-y-3">
        {columns
          .filter((column) => !column.hideOnMobile)
          .map((column) => (
            <div key={column.id || column.key || column.header} className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {column.mobileLabel || column.header}
              </p>
              <div className={column.mobileCellClassName || "text-sm text-slate-700"}>
                {resolveValue(column, row, index, "mobile") ?? "—"}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default function DataTable({
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
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const isControlledPage = typeof controlledPage === "number";
  const isControlledPageSize = typeof controlledPageSize === "number";

  const activePage = isControlledPage ? controlledPage : page;
  const activePageSize = isControlledPageSize ? controlledPageSize : pageSize;
  const totalCount = typeof totalItems === "number" ? totalItems : data.length;
  const pageCount = pagination ? Math.max(1, Math.ceil(totalCount / activePageSize)) : 1;

  useEffect(() => {
    if (!pagination) return;
    if (activePage > pageCount) {
      if (isControlledPage) onPageChange?.(pageCount);
      else setPage(pageCount);
    }
  }, [activePage, isControlledPage, onPageChange, pageCount, pagination]);

  useEffect(() => {
    if (!pagination) return;
    if (!isControlledPage) setPage(1);
  }, [data.length, isControlledPage, pagination]);

  const visibleRows = useMemo(() => {
    if (!pagination || typeof totalItems === "number") return data;
    const start = (activePage - 1) * activePageSize;
    return data.slice(start, start + activePageSize);
  }, [activePage, activePageSize, data, pagination, totalItems]);

  const startItem = totalCount === 0 ? 0 : (activePage - 1) * activePageSize + 1;
  const endItem = Math.min(totalCount, activePage * activePageSize);

  const updatePage = (nextPage) => {
    if (isControlledPage) onPageChange?.(nextPage);
    else setPage(nextPage);
  };

  const updatePageSize = (nextPageSize) => {
    const numericSize = Number(nextPageSize);
    if (isControlledPageSize) onPageSizeChange?.(numericSize);
    else setPageSize(numericSize);
    if (isControlledPage) onPageChange?.(1);
    else setPage(1);
  };

  // Build page number buttons (show max 5 pages around current)
  const pageNumbers = useMemo(() => {
    if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(2, activePage - delta);
      i <= Math.min(pageCount - 1, activePage + delta);
      i++
    ) {
      range.push(i);
    }
    if (activePage - delta > 2) range.unshift("...");
    if (activePage + delta < pageCount - 1) range.push("...");
    range.unshift(1);
    range.push(pageCount);
    return range;
  }, [activePage, pageCount]);

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {/* ── Desktop Table ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className={tableClassName}>
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id || column.key || column.header}
                  className={
                    column.headerClassName ||
                    "px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap"
                  }
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-16 text-center text-sm text-slate-400"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
                    {loadingText}
                  </div>
                </td>
              </tr>
            ) : visibleRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16">
                  {emptyState || (
                    <div className="text-center">
                      <p className="font-semibold text-slate-500">{emptyTitle}</p>
                      {emptyDescription ? (
                        <p className="mt-1 text-sm text-slate-400">{emptyDescription}</p>
                      ) : null}
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              visibleRows.map((row, index) => (
                <tr
                  key={typeof rowKey === "function" ? rowKey(row) : row[rowKey]}
                  className={
                    getRowClassName?.(row, index) ||
                    "hover:bg-slate-50 transition-colors"
                  }
                >
                  {columns.map((column) => (
                    <td
                      key={column.id || column.key || column.header}
                      className={
                        column.cellClassName ||
                        "px-4 py-3 text-sm text-slate-600 align-top"
                      }
                    >
                      {resolveValue(column, row, index) ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Cards ── */}
      <div className="md:hidden p-3 bg-slate-50/70">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
            <div className="mb-2 flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
            </div>
            {loadingText}
          </div>
        ) : visibleRows.length === 0 ? (
          emptyState || (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center">
              <p className="font-semibold text-slate-500">{emptyTitle}</p>
              {emptyDescription ? (
                <p className="mt-1 text-sm text-slate-400">{emptyDescription}</p>
              ) : null}
            </div>
          )
        ) : (
          <div className="space-y-3">
            {visibleRows.map((row, index) => (
              <MobileCard
                key={typeof rowKey === "function" ? rowKey(row) : row[rowKey]}
                row={row}
                index={index}
                columns={columns}
                renderMobileRow={renderMobileRow}
                getRowClassName={getRowClassName}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination Footer ── */}
      {pagination && totalCount > 0 && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
          {/* Top row: count info + page size */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-700">{startItem}</span>–
              <span className="font-bold text-slate-700">{endItem}</span> of{" "}
              <span className="font-bold text-slate-700">{totalCount}</span> results
            </p>
            <label className="flex items-center gap-2 text-xs text-slate-500">
              Rows per page
              <select
                value={activePageSize}
                onChange={(e) => updatePageSize(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Bottom row: page number buttons */}
          <div className="flex items-center justify-center gap-1 flex-wrap">
            {/* First page */}
            <button
              type="button"
              onClick={() => updatePage(1)}
              disabled={activePage <= 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              title="First page"
            >
              <ChevronsLeft size={14} />
            </button>
            {/* Prev page */}
            <button
              type="button"
              onClick={() => updatePage(Math.max(1, activePage - 1))}
              disabled={activePage <= 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              title="Previous page"
            >
              <ChevronLeft size={14} />
            </button>

            {/* Page number pills */}
            {pageNumbers.map((num, i) =>
              num === "..." ? (
                <span
                  key={`ellipsis-${i}`}
                  className="inline-flex h-8 w-8 items-center justify-center text-xs text-slate-400"
                >
                  …
                </span>
              ) : (
                <button
                  key={num}
                  type="button"
                  onClick={() => updatePage(num)}
                  className={`inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg border px-2 text-xs font-semibold transition-all ${
                    num === activePage
                      ? "border-blue-500 bg-blue-500 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {num}
                </button>
              )
            )}

            {/* Next page */}
            <button
              type="button"
              onClick={() => updatePage(Math.min(pageCount, activePage + 1))}
              disabled={activePage >= pageCount}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              title="Next page"
            >
              <ChevronRight size={14} />
            </button>
            {/* Last page */}
            <button
              type="button"
              onClick={() => updatePage(pageCount)}
              disabled={activePage >= pageCount}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              title="Last page"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}