const fs = require('fs');

const file = 'd:\\hp Laptop Data\\cps-intranet\\cps-intranet\\cps-intranet\\frontend\\src\\pages\\clinician\\EnterMyHoursPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove global date vars
content = content.replace(/const now = new Date\(\);\nconst defaultMonth = now\.getMonth\(\) \+ 1;\nconst defaultYear  = now\.getFullYear\(\);\n/g, "");

// 2. Add Badge import if missing, remove StatusPill definition
if (!content.includes('import { Badge }')) {
  content = content.replace('import { toast } from "sonner";', 'import { toast } from "sonner";\nimport { Badge } from "../../components/ui/Badge";');
}

// 3. Remove STATUS_STYLES and StatusPill component
content = content.replace(/const STATUS_STYLES: Record<string, string> = {[\s\S]*?};\n\ninterface StatusPillProps {[\s\S]*?const StatusPill: React\.FC<StatusPillProps> = \(\{ value \}\) => \{[\s\S]*?\};\n/g, "");

// 4. Update component state initialization
content = content.replace(
  '  const [month, setMonth] = useState(defaultMonth);\n  const [year,  setYear]  = useState(defaultYear);',
  '  const today = new Date();\n  const [month, setMonth] = useState(today.getMonth() + 1);\n  const [year,  setYear]  = useState(today.getFullYear());'
);

// 5. Update defaultYear fallback in Year input onChange
content = content.replace(/Number\(e\.target\.value \|\| defaultYear\)/g, "Number(e.target.value || today.getFullYear())");

// 6. Replace <StatusPill value={...} /> with <Badge color={statusColor[val] || "draft"}>{val}</Badge>
// We need a statusColor mapping inside or outside. Let's add it outside.
const statusColorMap = `
const statusColor: Record<string, string> = {
  draft:     "draft",
  submitted: "submitted",
  approved:  "approved",
  rejected:  "rejected",
};
`;
if (!content.includes('const statusColor: Record<string, string>')) {
  content = content.replace('const MONTH_NAMES =', statusColorMap + '\nconst MONTH_NAMES =');
}

// 7. Add 'This Month' button near Month/Year dropdowns
const filtersHtml = `        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setMonth(today.getMonth() + 1);
              setYear(today.getFullYear());
            }}
            className="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
          >
            This Month
          </button>`;
content = content.replace(/        <div className="ml-auto flex items-center gap-3">/, filtersHtml);

// 8. Replace StatusPill usages in Mobile cards
content = content.replace(/<StatusPill value=\{existing\?\.submissionStatus \|\| "draft"\} \/>/g, 
  `<Badge color={statusColor[existing?.submissionStatus || "draft"] || "draft"}>{existing?.submissionStatus || "draft"}</Badge>`);

content = content.replace(/<StatusPill value=\{existing\?\.managerApprovalStatus \|\| "pending"\} \/>/g, 
  `{(existing?.submissionStatus === "submitted" || existing?.submissionStatus === "approved" || existing?.submissionStatus === "rejected") && (
                  <Badge color={statusColor[existing?.managerApprovalStatus || "pending"] || "draft"}>{existing?.managerApprovalStatus || "pending"}</Badge>
                )}`);

// 9. Change Save button text
content = content.replace(/<Save size=\{12\} \/> Save<\/>/g, '<Save size={12} /> Save Draft</>');

// 10. Update Desktop table min-width
content = content.replace(/<table className="min-w-full table-pro">/g, '<table className="w-full min-w-[1000px] text-sm table-pro">');

// 11. Update Desktop table StatusPill usages
// The previous replace covered both mobile and desktop! Because I used global flag.

fs.writeFileSync(file, content);
console.log("EnterMyHoursPage.tsx rewritten.");
