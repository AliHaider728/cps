/**
 * sidebarConfig.js — navigation links only for routes that exist in AppRouter.jsx
 */

const SETTINGS_SUPER_ADMIN = {
  icon: "Settings",
  label: "System Settings",
  children: [
    { icon: "Shield",     label: "Roles & Permissions", path: "/dashboard/super-admin/users" },
    { icon: "ScrollText", label: "Audit Trail",          path: "/dashboard/super-admin/audit" },
  ],
};

export const sidebarConfig = {

  super_admin: [
    {
      section: "MAIN",
      items: [
        { icon: "LayoutDashboard", label: "Dashboard", path: "/dashboard/super-admin" },
      ],
    },
    {
      section: "CLIENT MANAGEMENT",
      items: [
        { icon: "GitBranch", label: "Hierarchy View", path: "/dashboard/super-admin/clients" },
        {
          icon: "Building2",
          label: "Client Hierarchy",
          children: [
            { icon: "Building2",   label: "ICBs",                 path: "/dashboard/super-admin/clients/icb"        },
            { icon: "Layers",      label: "Federations / INT",     path: "/dashboard/super-admin/clients/federation" },
            { icon: "Network",     label: "Clients",               path: "/dashboard/super-admin/clients/pcn"        },
            { icon: "Stethoscope", label: "Practices / Surgeries", path: "/dashboard/super-admin/clients/practice"   },
          ],
        },
        { icon: "FileText", label: "Compliance Documents", path: "/dashboard/super-admin/compliance/documents" },
        { icon: "Layers",   label: "Compliance Groups",    path: "/dashboard/super-admin/compliance/groups"    },
      ],
    },
    {
      section: "OPERATIONS",
      items: [
        { icon: "UserCheck", label: "Clinician Management", path: "/dashboard/clinicians" },
        { icon: "Calendar",  label: "Rota Management",      path: "/dashboard/rota"       },
        { icon: "AlertCircle", label: "Rota Gaps",          path: "/dashboard/rota-gaps"  },
        { icon: "CalendarOff", label: "Leave Management",   path: "/dashboard/leave"      },
      ],
    },
    {
      section: "FINANCE",
      items: [
        { icon: "Clock", label: "Timesheet Approval", path: "/dashboard/super-admin/timesheets" },
      ],
    },
    {
      section: "SYSTEM SETTINGS",
      items: [SETTINGS_SUPER_ADMIN],
    },
  ],

  director: [
    {
      section: "MAIN",
      items: [
        { icon: "LayoutDashboard", label: "Dashboard", path: "/dashboard/director" },
      ],
    },
    {
      section: "CLIENT MANAGEMENT",
      items: [
        {
          icon: "Building2",
          label: "Client Hierarchy",
          children: [
            { icon: "Network",     label: "PCNs",                  path: "/dashboard/super-admin/clients/pcn"      },
            { icon: "Stethoscope", label: "Practices / Surgeries", path: "/dashboard/super-admin/clients/practice" },
          ],
        },
        { icon: "GitBranch", label: "Hierarchy View", path: "/dashboard/super-admin/clients" },
      ],
    },
    {
      section: "VIEW ONLY",
      items: [
        { icon: "UserCheck", label: "Clinician Management", path: "/dashboard/clinicians" },
        { icon: "Calendar",  label: "Rota Management",      path: "/dashboard/rota"       },
        { icon: "Clock",     label: "Timesheet Approval",   path: "/dashboard/super-admin/timesheets" },
        { icon: "CalendarOff", label: "Leave Management",   path: "/dashboard/leave"      },
      ],
    },
  ],

  ops_manager: [
    {
      section: "MAIN",
      items: [
        { icon: "LayoutDashboard", label: "Dashboard", path: "/dashboard/ops-manager" },
      ],
    },
    {
      section: "CLIENT MANAGEMENT",
      items: [
        {
          icon: "Building2",
          label: "Client Hierarchy",
          children: [
            { icon: "Building2",   label: "ICBs",                 path: "/dashboard/super-admin/clients/icb"      },
            { icon: "Layers",      label: "Federations / INT",     path: "/dashboard/super-admin/clients/federation" },
            { icon: "Network",     label: "PCNs",                  path: "/dashboard/super-admin/clients/pcn"      },
            { icon: "Stethoscope", label: "Practices / Surgeries", path: "/dashboard/super-admin/clients/practice" },
          ],
        },
        { icon: "GitBranch", label: "Hierarchy View",    path: "/dashboard/super-admin/clients"           },
        { icon: "Layers",    label: "Compliance Groups", path: "/dashboard/super-admin/compliance/groups" },
      ],
    },
    {
      section: "WORKFORCE",
      items: [
        { icon: "UserCheck",   label: "Clinician Management", path: "/dashboard/clinicians" },
        { icon: "Calendar",    label: "Rota Management",      path: "/dashboard/rota"       },
        { icon: "AlertCircle", label: "Rota Gaps",            path: "/dashboard/rota-gaps"  },
        { icon: "CalendarOff", label: "Leave Management",     path: "/dashboard/leave"      },
        { icon: "Clock",       label: "Timesheet Approval",   path: "/dashboard/super-admin/timesheets" },
      ],
    },
    {
      section: "SYSTEM SETTINGS",
      items: [SETTINGS_SUPER_ADMIN],
    },
  ],

  finance: [
    {
      section: "MAIN",
      items: [
        { icon: "LayoutDashboard", label: "Dashboard", path: "/dashboard/finance" },
      ],
    },
    {
      section: "TIMESHEETS",
      items: [
        { icon: "Clock",       label: "Approve Timesheets", path: "/dashboard/super-admin/timesheets" },
        { icon: "CalendarOff", label: "Leave Management",   path: "/dashboard/leave" },
        { icon: "UserCheck",   label: "Clinician Management", path: "/dashboard/clinicians" },
      ],
    },
  ],

  training: [
    {
      section: "MAIN",
      items: [
        { icon: "LayoutDashboard", label: "Dashboard", path: "/dashboard/training" },
      ],
    },
    {
      section: "CLINICIANS",
      items: [
        { icon: "UserCheck", label: "Clinician Management", path: "/dashboard/clinicians" },
        { icon: "CalendarOff", label: "Leave Management", path: "/dashboard/leave" },
      ],
    },
  ],

  workforce: [
    {
      section: "MAIN",
      items: [
        { icon: "LayoutDashboard", label: "Dashboard", path: "/dashboard/workforce" },
      ],
    },
    {
      section: "CLINICIANS",
      items: [
        { icon: "UserCheck", label: "Clinician Management", path: "/dashboard/clinicians" },
      ],
    },
    {
      section: "ROTA & COVER",
      items: [
        { icon: "Calendar",    label: "Monthly Rota", path: "/dashboard/rota"      },
        { icon: "AlertCircle", label: "Rota Gaps",    path: "/dashboard/rota-gaps" },
        { icon: "CalendarOff", label: "Leave Requests", path: "/dashboard/leave" },
      ],
    },
  ],

  clinician: [
    {
      section: "MAIN",
      items: [
        { icon: "Home", label: "Dashboard", path: "/portal/clinician" },
      ],
    },
    {
      section: "MY WORK",
      items: [
        { icon: "Clock",         label: "My Timesheet",     path: "/portal/clinician/my-timesheet" },
        { icon: "CalendarOff",   label: "Apply for Leave",  path: "/portal/clinician/apply-leave"  },
        { icon: "CalendarCheck", label: "My Leave Balance", path: "/portal/clinician/leave-balance" },
      ],
    },
    {
      section: "MY TRAINING",
      items: [
        { icon: "CalendarCheck", label: "My Supervision",     path: "/portal/clinician/supervision"        },
        { icon: "Monitor",       label: "Remote Supervision", path: "/portal/clinician/remote-supervision" },
        { icon: "GraduationCap", label: "My CPPE Progress",   path: "/portal/clinician/cppe"               },
      ],
    },
    {
      section: "MY COMPLIANCE",
      items: [
        { icon: "ClipboardCheck", label: "My Compliance", path: "/portal/clinician/compliance" },
      ],
    },
  ],
};
