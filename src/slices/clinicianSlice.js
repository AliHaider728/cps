/**
 * slices/clinicianSlice.js — Module 3  (COMPLETE — replace existing)
 *
 * Redux slice for Clinician Management UI state.
 *   - Active tab on the detail page
 *   - List page filters + pagination
 *   - Restricted clinicians page filters
 */

import { createSlice } from "@reduxjs/toolkit";

const DETAIL_TABS = [
  "basic",
  "skills",
  "compliance",
  "history",
  "calendar",
  "supervision",
  "cppe",
  "onboarding",
  "scope",
];

const initialState = {
  /* Detail page */
  activeDetailTab: "basic",

  /* List page filters */
  listFilters: {
    search:     "",
    type:       "",       // Pharmacist | Technician | IP
    contract:   "",       // ARRS | EA | Direct | Mixed
    restricted: "",       // "true" | "false" | ""
    active:     "true",
    opsLead:    "",
    supervisor: "",
  },

  /* Restricted clinicians page filters */
  restrictedFilters: {
    entityType: "",       // practice | pcn | surgery
    entityId:   "",
    search:     "",
  },

  /* Compliance sub-tab within Tab 3 */
  activeComplianceFilter: "all",  // all | outstanding | expiring | approved

  /* Leave sub-tab within Tab 5 */
  activeLeaveType: "annual",      // annual | sick | cppe | other

  /* CPPE progress view mode */
  cppViewMode: "overview",        // overview | modules

  /* Onboarding sub-section */
  activeOnboardingSection: "checklist",  // checklist | documents | it-setup
};

const clinicianSlice = createSlice({
  name: "clinician",
  initialState,
  reducers: {
    /* ── Detail page tab ──────────────────────────────── */
    setActiveClinicianDetailTab: (state, action) => {
      if (DETAIL_TABS.includes(action.payload)) {
        state.activeDetailTab = action.payload;
      }
    },
    resetDetailTab: (state) => {
      state.activeDetailTab = "basic";
    },

    /* ── List filters ─────────────────────────────────── */
    setListFilter: (state, action) => {
      const { key, value } = action.payload;
      if (key in state.listFilters) {
        state.listFilters[key] = value;
      }
    },
    resetListFilters: (state) => {
      state.listFilters = { ...initialState.listFilters };
    },

    /* ── Restricted page filters ──────────────────────── */
    setRestrictedFilter: (state, action) => {
      const { key, value } = action.payload;
      if (key in state.restrictedFilters) {
        state.restrictedFilters[key] = value;
      }
    },
    resetRestrictedFilters: (state) => {
      state.restrictedFilters = { ...initialState.restrictedFilters };
    },

    /* ── Compliance sub-tab ───────────────────────────── */
    setActiveComplianceFilter: (state, action) => {
      state.activeComplianceFilter = action.payload;
    },

    /* ── Leave sub-tab ────────────────────────────────── */
    setActiveLeaveType: (state, action) => {
      state.activeLeaveType = action.payload;
    },

    /* ── CPPE view mode ───────────────────────────────── */
    setCPPEViewMode: (state, action) => {
      state.cppViewMode = action.payload;
    },

    /* ── Onboarding section ───────────────────────────── */
    setActiveOnboardingSection: (state, action) => {
      state.activeOnboardingSection = action.payload;
    },
  },
});

export const {
  setActiveClinicianDetailTab,
  resetDetailTab,
  setListFilter,
  resetListFilters,
  setRestrictedFilter,
  resetRestrictedFilters,
  setActiveComplianceFilter,
  setActiveLeaveType,
  setCPPEViewMode,
  setActiveOnboardingSection,
} = clinicianSlice.actions;

export default clinicianSlice.reducer;