/**
 * tabs/OverviewTab.jsx
 */
import { MapPin, DollarSign, FileText, Building2, Network, Calendar, Hash, Tag, Briefcase } from "lucide-react";

export default function OverviewTab({ data: d, isPCN }) {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      {isPCN ? <PCNOverview d={d} /> : <PracticeOverview d={d} />}
    </div>
  );
}

function PCNOverview({ d }) {
  return (
    <>
      <Section title="PCN Details">
        <Grid>
          <InfoCard icon={Building2}  label="ICB"           value={d.icb?.name}                                                      color="blue"    />
          <InfoCard icon={Network}    label="Federation"    value={d.federation?.name || d.federationName}                           color="indigo"  />
          <InfoCard icon={DollarSign} label="Annual Spend"  value={d.annualSpend ? `£${Number(d.annualSpend).toLocaleString()}` : null} color="emerald" />
          <InfoCard icon={Tag}        label="Contract Type" value={d.contractType}                                                   color="orange"  />
          <InfoCard icon={Hash}       label="Xero Code"     value={d.xeroCode ? `${d.xeroCode} (${d.xeroCategory})` : null}          color="slate"   />
          <InfoCard icon={Building2}  label="Practices"     value={d.practices?.length != null ? `${d.practices.length} linked` : null} color="purple" />
        </Grid>
      </Section>

      {(d.contractRenewalDate || d.contractExpiryDate) && (
        <Section title="Contract Dates">
          <Grid>
            {d.contractRenewalDate && (
              <InfoCard icon={Calendar} label="Renewal Date" value={fmtDate(d.contractRenewalDate)} color="amber" />
            )}
            {d.contractExpiryDate && (
              <InfoCard icon={Calendar} label="Expiry Date"  value={fmtDate(d.contractExpiryDate)}  color="red"   />
            )}
          </Grid>
        </Section>
      )}

      <Section title="Compliance Flags">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { key: "ndaSigned",       label: "NDA Signed"   },
            { key: "dsaSigned",       label: "DSA Signed"   },
            { key: "mouReceived",     label: "MOU Received" },
            { key: "welcomePackSent", label: "Welcome Pack" },
          ].map(({ key, label }) => (
            <CompliancePill key={key} label={label} done={!!d[key]} />
          ))}
        </div>
      </Section>

      {d.requiredSystems && (
        <Section title="Required Systems">
          <div className="flex flex-wrap gap-2">
            {Object.entries(d.requiredSystems)
              .filter(([k, v]) => k !== "other" && v)
              .map(([k]) => (
                <span key={k} className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-100 text-cyan-700">
                  {k.replace(/([A-Z])/g, " $1").trim()}
                </span>
              ))}
            {d.requiredSystems.other && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                {d.requiredSystems.other}
              </span>
            )}
          </div>
        </Section>
      )}

      {d.notes && (
        <Section title="Notes">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">{d.notes}</p>
          </div>
        </Section>
      )}
    </>
  );
}

function PracticeOverview({ d }) {
  const compKeys = [
    "ndaSigned", "dsaSigned", "mouReceived", "welcomePackSent",
    "mobilisationPlanSent", "confidentialityFormSigned", "prescribingPoliciesShared",
    "remoteAccessSetup", "templateInstalled", "reportsImported",
  ];
  const done  = compKeys.filter(k => d[k]).length;
  const pct   = Math.round((done / compKeys.length) * 100);
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <>
      <Section title="Practice Details">
        <Grid>
          <InfoCard icon={Network}   label="PCN"          value={d.pcn?.name}    color="purple"  />
          <InfoCard icon={FileText}  label="ODS Code"     value={d.odsCode}      color="blue"    />
          <InfoCard icon={Tag}       label="Contract Type"value={d.contractType} color="orange"  />
          <InfoCard icon={Briefcase} label="FTE"          value={d.fte}          color="emerald" />
          <InfoCard icon={Hash}      label="Xero Code"    value={d.xeroCode ? `${d.xeroCode} (${d.xeroCategory})` : null} color="slate" />
          <InfoCard icon={Building2} label="Patient List" value={d.patientListSize ? Number(d.patientListSize).toLocaleString() : null} color="indigo" />
        </Grid>
      </Section>

      {(d.address || d.city || d.postcode) && (
        <Section title="Address">
          <div className="flex items-start gap-2.5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-700">
              {[d.address, d.city, d.postcode].filter(Boolean).join(", ")}
            </p>
          </div>
        </Section>
      )}

      <Section title="Onboarding Checklist">
        {/* Progress bar */}
        <div className="mb-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">Overall Progress</span>
            <span className="text-xs font-bold text-slate-700">{done}/{compKeys.length} — {pct}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full transition-all duration-500`}
              style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { key: "ndaSigned",                 label: "NDA Signed"           },
            { key: "dsaSigned",                 label: "DSA Signed"           },
            { key: "mouReceived",               label: "MOU Received"         },
            { key: "welcomePackSent",           label: "Welcome Pack"         },
            { key: "mobilisationPlanSent",      label: "Mobilisation Plan"    },
            { key: "confidentialityFormSigned", label: "Confidentiality Form" },
            { key: "prescribingPoliciesShared", label: "Prescribing Policies" },
            { key: "remoteAccessSetup",         label: "Remote Access"        },
            { key: "templateInstalled",         label: "Template Installed"   },
            { key: "reportsImported",           label: "Reports Imported"     },
          ].map(({ key, label }) => (
            <CompliancePill key={key} label={label} done={!!d[key]} />
          ))}
        </div>
      </Section>

      {d.notes && (
        <Section title="Notes">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">{d.notes}</p>
          </div>
        </Section>
      )}
    </>
  );
}

/* ── Shared primitives ── */
function Section({ title, children }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{title}</p>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

const COLOR_MAP = {
  blue:    { bg: "bg-blue-50",    icon: "text-blue-500",    border: "border-blue-100"    },
  indigo:  { bg: "bg-indigo-50",  icon: "text-indigo-500",  border: "border-indigo-100"  },
  purple:  { bg: "bg-purple-50",  icon: "text-purple-500",  border: "border-purple-100"  },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-500", border: "border-emerald-100" },
  orange:  { bg: "bg-orange-50",  icon: "text-orange-500",  border: "border-orange-100"  },
  amber:   { bg: "bg-amber-50",   icon: "text-amber-500",   border: "border-amber-100"   },
  red:     { bg: "bg-red-50",     icon: "text-red-500",     border: "border-red-100"     },
  slate:   { bg: "bg-slate-50",   icon: "text-slate-400",   border: "border-slate-200"   },
};

function InfoCard({ icon: Icon, label, value, color = "slate" }) {
  const { bg, icon: ic, border } = COLOR_MAP[color] || COLOR_MAP.slate;
  return (
    <div className={`${bg} border ${border} rounded-xl p-3.5 hover:shadow-sm transition-shadow`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} className={ic} />
        <p className={`text-[10px] font-bold uppercase tracking-wider ${ic}`}>{label}</p>
      </div>
      <p className="text-sm font-semibold text-slate-700 leading-snug">
        {value || <span className="text-slate-400 font-normal">—</span>}
      </p>
    </div>
  );
}

function CompliancePill({ label, done }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold
      transition-all
      ${done
        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
        : "bg-slate-50 border-slate-200 text-slate-500"
      }`}>
      <span className={`w-2 h-2 rounded-full shrink-0
        ${done ? "bg-emerald-500" : "bg-slate-300"}`} />
      {label}
    </div>
  );
}

function fmtDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}