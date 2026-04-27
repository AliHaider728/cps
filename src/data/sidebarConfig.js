/**
 * sidebarConfig.js
 * 
 * UPDATED (Apr 2026):
 *   Dashboard at top
 *   All original sections (CLIENT MANAGEMENT, OPERATIONS, FINANCE, TRAINING, HR & COMPLIANCE, REPORTS)
 *   System Settings dropdown at the bottom with only: Roles & Permissions, Audit Trail
 *
 * BUG FIX:
 *   "Contact History" sidebar link removed from super_admin and ops_manager —
 *   ContactHistoryPanel is a tab inside PCN/Practice detail pages, not a standalone page.
 */

export const sidebarConfig = {

  // ════════════════════════════════════════════════════════════════
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
            { icon: "Building2",   label: "ICBs",                  path: "/dashboard/super-admin/clients/icb"        },
            { icon: "Layers",      label: "Federations / INT",      path: "/dashboard/super-admin/clients/federation" },
            { icon: "Network",     label: "Clients",                path: "/dashboard/super-admin/clients/pcn"        },
            { icon: "Stethoscope", label: "Practices / Surgeries",  path: "/dashboard/super-admin/clients/practice"   },
          ],
        },
        { icon: "FileText",       label: "Compliance Documents",  path: "/dashboard/super-admin/compliance/documents"   },
        { icon: "Layers",         label: "Compliance Groups",     path: "/dashboard/super-admin/compliance/groups"      },
      ],
    },
    {
      section: "OPERATIONS",
      items: [
        { icon: "UserCheck",      label: "Clinicians",        path: "/dashboard/clinicians" },
        { icon: "Calendar",       label: "Rota Management",   path: "/dashboard/rota"       },
        { icon: "FileSignature",  label: "Contracts",         path: "/dashboard/contracts"  },
      ],
    },
    {
      section: "FINANCE",
      items: [
        { icon: "BarChart3",  label: "Finance Dashboard", path: "/dashboard/finance"    },
        { icon: "Clock",      label: "Timesheets",         path: "/dashboard/timesheets" },
        { icon: "Receipt",    label: "Invoices",           path: "/dashboard/invoices"   },
        { icon: "Hash",       label: "Xero Codes",         path: "/dashboard/xero"       },
        { icon: "TrendingUp", label: "Headcount",          path: "/dashboard/headcount"  },
      ],
    },
    {
      section: "TRAINING",
      items: [
        { icon: "CalendarCheck", label: "Supervision",  path: "/dashboard/supervision" },
        { icon: "Award",         label: "Competency",   path: "/dashboard/competency"  },
        { icon: "GraduationCap", label: "CPPE Tracker", path: "/dashboard/cppe"        },
        { icon: "FolderOpen",    label: "Resources",    path: "/dashboard/resources"   },
        { icon: "AlertOctagon",  label: "MHRA Alerts",  path: "/dashboard/mhra"        },
      ],
    },
    {
      section: "HR & COMPLIANCE",
      items: [
        { icon: "ClipboardCheck", label: "Compliance",       path: "/dashboard/compliance"  },
        { icon: "CalendarOff",    label: "Leave Management", path: "/dashboard/leave"       },
        { icon: "UserPlus",       label: "Onboarding",       path: "/dashboard/onboarding"  },
        { icon: "Key",            label: "System Access",    path: "/dashboard/access"      },
        { icon: "AlertTriangle",  label: "Complaints",       path: "/dashboard/complaints"  },
      ],
    },
    {
      section: "REPORTS",
      items: [
        { icon: "PieChart", label: "Reports",       path: "/dashboard/reports"       },
        { icon: "Bell",     label: "Notifications", path: "/dashboard/notifications" },
      ],
    },
    {
      section: "SYSTEM SETTINGS",
      items: [
        {
          icon: "Settings",
          label: "System Settings",
          children: [
            { icon: "Shield",      label: "Roles & Permissions", path: "/dashboard/super-admin/users" },
            { icon: "ScrollText",  label: "Audit Trail",         path: "/dashboard/super-admin/audit" },
          ],
        },
      ],
    },
  ],

  // ════════════════════════════════════════════════════════════════
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
            { icon: "Network",     label: "PCNs",                 path: "/dashboard/super-admin/clients/pcn"      },
            { icon: "Stethoscope", label: "Practices / Surgeries",path: "/dashboard/super-admin/clients/practice" },
          ],
        },
        { icon: "GitBranch", label: "Hierarchy View", path: "/dashboard/super-admin/clients" },
      ],
    },
    {
      section: "VIEW ONLY",
      items: [
        { icon: "BarChart3",     label: "Finance Dashboard", path: "/dashboard/finance"       },
        { icon: "FileSignature", label: "Contracts",         path: "/dashboard/contracts"     },
        { icon: "AlertTriangle", label: "Complaints",        path: "/dashboard/complaints"    },
        { icon: "UserCheck",     label: "Clinicians",        path: "/dashboard/clinicians"    },
        { icon: "PieChart",      label: "Monthly Reports",   path: "/dashboard/reports"       },
        { icon: "Bell",          label: "Notifications",     path: "/dashboard/notifications" },
      ],
    },
    {
      section: "SYSTEM SETTINGS",
      items: [
        {
          icon: "Settings",
          label: "System Settings",
          children: [
            { icon: "Shield",      label: "Roles & Permissions", path: "/dashboard/super-admin/users" },
            { icon: "ScrollText",  label: "Audit Trail",         path: "/dashboard/super-admin/audit" },
          ],
        },
      ],
    },
  ],

  // ════════════════════════════════════════════════════════════════
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
            { icon: "Building2",   label: "ICBs",                  path: "/dashboard/super-admin/clients/icb"        },
            { icon: "Layers",      label: "Federations / INT",      path: "/dashboard/super-admin/clients"            },
            { icon: "Network",     label: "PCNs",                   path: "/dashboard/super-admin/clients/pcn"        },
            { icon: "Stethoscope", label: "Practices / Surgeries",  path: "/dashboard/super-admin/clients/practice"   },
          ],
        },
        { icon: "GitBranch",      label: "Hierarchy View",     path: "/dashboard/super-admin/clients"              },
        { icon: "Layers",         label: "Compliance Groups",  path: "/dashboard/super-admin/compliance/groups"    },
        { icon: "UserX",          label: "Restricted Clinicians", path: "/dashboard/super-admin/clients/restricted" },
      ],
    },
    {
      section: "WORKFORCE",
      items: [
        { icon: "UserCheck", label: "Clinician Profiles", path: "/dashboard/clinicians" },
        { icon: "Calendar",  label: "Rota Management",    path: "/dashboard/rota"       },
        { icon: "RefreshCw", label: "Cover & Gaps",       path: "/dashboard/cover"      },
      ],
    },
    {
      section: "CONTRACTS",
      items: [
        { icon: "FileSignature", label: "Active Contracts",      path: "/dashboard/contracts"    },
        { icon: "FileClock",     label: "Renewals",              path: "/dashboard/renewals"     },
        { icon: "GitBranch",     label: "Mid-Contract Changes",  path: "/dashboard/mid-contract" },
      ],
    },
    {
      section: "ONBOARDING",
      items: [
        { icon: "UserPlus", label: "New Starter Handover", path: "/dashboard/onboarding"    },
        { icon: "Package",  label: "Welcome Packs",        path: "/dashboard/welcome-packs" },
        { icon: "Key",      label: "System Access",        path: "/dashboard/access"        },
      ],
    },
    {
      section: "OTHER",
      items: [
        { icon: "AlertTriangle",  label: "Complaints",        path: "/dashboard/complaints"    },
        { icon: "ClipboardCheck", label: "Compliance",        path: "/dashboard/compliance"    },
        { icon: "CalendarOff",    label: "Leave Management",  path: "/dashboard/leave"         },
        { icon: "PieChart",       label: "Monthly Reports",   path: "/dashboard/reports"       },
        { icon: "Bell",           label: "Notifications",     path: "/dashboard/notifications" },
      ],
    },
    {
      section: "SYSTEM SETTINGS",
      items: [
        {
          icon: "Settings",
          label: "System Settings",
          children: [
            { icon: "Shield",      label: "Roles & Permissions", path: "/dashboard/super-admin/users" },
            { icon: "ScrollText",  label: "Audit Trail",         path: "/dashboard/super-admin/audit" },
          ],
        },
      ],
    },
  ],

  // ════════════════════════════════════════════════════════════════
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
        { icon: "Clock",      label: "Approve Timesheets",      path: "/dashboard/timesheets"    },
        { icon: "GitCompare", label: "Variance Analysis",       path: "/dashboard/variance"      },
        { icon: "RefreshCw",  label: "Cover Hours",             path: "/dashboard/cover-hours"   },
        { icon: "Activity",   label: "Working Hour Patterns",   path: "/dashboard/hour-patterns" },
      ],
    },
    {
      section: "INVOICES",
      items: [
        { icon: "Receipt",  label: "Contractor Invoices", path: "/dashboard/contractor-invoices" },
        { icon: "FileText", label: "Client Invoices",     path: "/dashboard/client-invoices"     },
      ],
    },
    {
      section: "CODES & REPORTS",
      items: [
        { icon: "Hash",        label: "Staff Xero Codes",   path: "/dashboard/staff-xero"    },
        { icon: "Hash",        label: "Client Xero Codes",  path: "/dashboard/client-xero"   },
        { icon: "Users",       label: "Headcount Analysis", path: "/dashboard/headcount"     },
        { icon: "DollarSign",  label: "Expenses",           path: "/dashboard/expenses"      },
        { icon: "Bell",        label: "Notifications",      path: "/dashboard/notifications" },
      ],
    },
    {
      section: "SYSTEM SETTINGS",
      items: [
        {
          icon: "Settings",
          label: "System Settings",
          children: [
            { icon: "Shield",      label: "Roles & Permissions", path: "/dashboard/super-admin/users" },
            { icon: "ScrollText",  label: "Audit Trail",         path: "/dashboard/super-admin/audit" },
          ],
        },
      ],
    },
  ],

  // ════════════════════════════════════════════════════════════════
  training: [
    {
      section: "MAIN",
      items: [
        { icon: "LayoutDashboard", label: "Dashboard", path: "/dashboard/training" },
      ],
    },
    {
      section: "SUPERVISION",
      items: [
        {
          icon: "CalendarCheck",
          label: "Supervision",
          children: [
            { icon: "CalendarCheck", label: "Supervision Tracker",  path: "/dashboard/supervision"              },
            { icon: "FileText",      label: "Supervision Forms",    path: "/dashboard/supervision-forms"        },
            { icon: "XCircle",       label: "Cancellations",        path: "/dashboard/supervision-cancellations"},
            { icon: "Monitor",       label: "Remote Supervision",   path: "/dashboard/remote-supervision"       },
          ],
        },
      ],
    },
    {
      section: "COMPETENCY",
      items: [
        {
          icon: "Award",
          label: "Competency",
          children: [
            { icon: "Award",      label: "New Starter Competency", path: "/dashboard/competency-new"    },
            { icon: "TrendingUp", label: "Ongoing Competency",     path: "/dashboard/competency-ongoing"},
            { icon: "Clipboard",  label: "Reflection / Incidents", path: "/dashboard/reflection"        },
          ],
        },
      ],
    },
    {
      section: "CPPE & TRAINING",
      items: [
        { icon: "GraduationCap", label: "CPPE Tracker",   path: "/dashboard/cppe"         },
        { icon: "BookMarked",    label: "Study Leave Log", path: "/dashboard/study-leave"  },
        { icon: "Compass",       label: "Scope of Practice", path: "/dashboard/scope"     },
      ],
    },
    {
      section: "RESOURCES",
      items: [
        { icon: "FolderOpen",    label: "SOPs & Guides",       path: "/dashboard/resources"          },
        { icon: "Upload",        label: "Training Materials",  path: "/dashboard/training-materials" },
        { icon: "AlertOctagon",  label: "MHRA Alerts",         path: "/dashboard/mhra"               },
        { icon: "CalendarOff",   label: "Absences (View)",     path: "/dashboard/absences"           },
        { icon: "Users",         label: "Clinician Directory", path: "/dashboard/directory"          },
        { icon: "Bell",          label: "Notifications",       path: "/dashboard/notifications"      },
      ],
    },
    {
      section: "SYSTEM SETTINGS",
      items: [
        {
          icon: "Settings",
          label: "System Settings",
          children: [
            { icon: "Shield",      label: "Roles & Permissions", path: "/dashboard/super-admin/users" },
            { icon: "ScrollText",  label: "Audit Trail",         path: "/dashboard/super-admin/audit" },
          ],
        },
      ],
    },
  ],

  // ════════════════════════════════════════════════════════════════
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
        { icon: "UserCheck", label: "Clinician Profiles",  path: "/dashboard/clinicians" },
        { icon: "Compass",   label: "Scope of Practice",   path: "/dashboard/scope"      },
        { icon: "Phone",     label: "Staff Contacts",      path: "/dashboard/contacts"   },
      ],
    },
    {
      section: "ROTA & COVER",
      items: [
        { icon: "Calendar",      label: "Monthly Rota",    path: "/dashboard/rota"       },
        { icon: "RefreshCw",     label: "Cover Requests",  path: "/dashboard/cover"      },
        { icon: "AlertCircle",   label: "Rota Gaps",       path: "/dashboard/rota-gaps"  },
      ],
    },
    {
      section: "HR & COMPLIANCE",
      items: [
        { icon: "Key",            label: "System Access",        path: "/dashboard/access"        },
        { icon: "ClipboardCheck", label: "Compliance Chasing",   path: "/dashboard/compliance"    },
        { icon: "CalendarOff",    label: "Leave Requests",       path: "/dashboard/leave"         },
        { icon: "UserPlus",       label: "Onboarding",           path: "/dashboard/onboarding"    },
        { icon: "Bell",           label: "Notifications",        path: "/dashboard/notifications" },
      ],
    },
    {
      section: "SYSTEM SETTINGS",
      items: [
        {
          icon: "Settings",
          label: "System Settings",
          children: [
            { icon: "Shield",      label: "Roles & Permissions", path: "/dashboard/super-admin/users" },
            { icon: "ScrollText",  label: "Audit Trail",         path: "/dashboard/super-admin/audit" },
          ],
        },
      ],
    },
  ],

  // ════════════════════════════════════════════════════════════════
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
        { icon: "Clock",      label: "My Timesheet",    path: "/portal/clinician/timesheet"     },
        { icon: "CalendarOff",label: "Apply for Leave", path: "/portal/clinician/leave"         },
        { icon: "Scale",      label: "My Leave Balance",path: "/portal/clinician/leave-balance" },
      ],
    },
    {
      section: "MY TRAINING",
      items: [
        { icon: "CalendarCheck", label: "My Supervision",      path: "/portal/clinician/supervision"        },
        { icon: "Monitor",       label: "Remote Supervision",  path: "/portal/clinician/remote-supervision" },
        { icon: "GraduationCap", label: "My CPPE Progress",    path: "/portal/clinician/cppe"               },
      ],
    },
    {
      section: "MY COMPLIANCE",
      items: [
        { icon: "ClipboardCheck", label: "Mandatory Training",  path: "/portal/clinician/mandatory"      },
        { icon: "Upload",         label: "Upload Certificates", path: "/portal/clinician/certificates"   },
        { icon: "FolderOpen",     label: "Resources",           path: "/portal/clinician/resources"      },
        { icon: "Bell",           label: "My Notifications",    path: "/portal/clinician/notifications"  },
      ],
    },
    {
      section: "SYSTEM SETTINGS",
      items: [
        {
          icon: "Settings",
          label: "System Settings",
          children: [
            { icon: "User",        label: "My Profile",         path: "/portal/clinician/profile"       },
            { icon: "Shield",      label: "Roles & Permissions", path: "/dashboard/super-admin/users"   },
            { icon: "ScrollText",  label: "Audit Trail",         path: "/dashboard/super-admin/audit"   },
          ],
        },
      ],
    },
  ],
};