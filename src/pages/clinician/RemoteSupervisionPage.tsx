import React from "react";
import ClinicianSupervisionPage from "./ClinicianSupervisionPage";

/** Remote supervision uses same data; filter shown in dedicated view later. */
export default function RemoteSupervisionPage() {
  return (
    <div>
      <p className="text-sm text-slate-500 mb-4">Remote supervision sessions and reflection deadlines.</p>
      <ClinicianSupervisionPage />
    </div>
  );
}
