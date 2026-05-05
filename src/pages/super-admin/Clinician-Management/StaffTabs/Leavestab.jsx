import { useMemo } from "react";

const CONTRACTS = ["ARRS", "EA", "Direct"];
const pct = (used, total) => (total > 0 ? Math.min((used / total) * 100, 100) : 0);

const calcExpected = (contractedHours) => {
  const safeHours = Number(contractedHours) || 37.5;
  const fte = safeHours / 37.5;
  const annualHours = fte * 187.5;
  const monthlyAllowance = annualHours / 12;
  return { fte, annualHours, monthlyAllowance };
};

export default function LeavesTab({ staffData = {} }) {
  const contractedHours = staffData?.contractedHours || 37.5;
  const formula = useMemo(() => calcExpected(contractedHours), [contractedHours]);

  const balances = useMemo(() => {
    const map = { ARRS: { total: 0, used: 0 }, EA: { total: 0, used: 0 }, Direct: { total: 0, used: 0 } };
    const source = Array.isArray(staffData?.leaveBalances) ? staffData.leaveBalances : [];
    source.forEach((b) => {
      const key = CONTRACTS.includes(b.contract) ? b.contract : null;
      if (!key) return;
      map[key] = { total: Number(b.total) || 0, used: Number(b.used || b.taken) || 0 };
    });
    return map;
  }, [staffData]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Leave calculation formula</p>
        <p className="text-xs text-slate-600 mt-1">Annual Hours = FTE x 187.5 | FTE = contracted_hours / 37.5 | Monthly allowance = Annual Hours / 12</p>
        <p className="text-xs text-slate-500 mt-1">Current estimate: FTE {formula.fte.toFixed(2)}, Annual {formula.annualHours.toFixed(2)}h, Monthly {formula.monthlyAllowance.toFixed(2)}h</p>
      </div>

      {CONTRACTS.map((contract) => {
        const total = balances[contract].total;
        const used = balances[contract].used;
        const remaining = Math.max(total - used, 0);
        return (
          <div key={contract} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">{contract} Leave</p>
            <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
              <div><p className="text-slate-500">Total</p><p className="font-semibold">{total}</p></div>
              <div><p className="text-slate-500">Taken</p><p className="font-semibold">{used}</p></div>
              <div><p className="text-slate-500">Remaining</p><p className="font-semibold">{remaining}</p></div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${pct(used, total)}%` }} />
            </div>
          </div>
        );
      })}

      <div className="rounded-xl border border-slate-200 bg-amber-50 p-4 text-xs text-amber-800">
        Auto-approve rule: annual leave up to 2 weeks with no same-PCN clash can be auto-approved and practice notification is sent automatically.
      </div>
    </div>
  );
}