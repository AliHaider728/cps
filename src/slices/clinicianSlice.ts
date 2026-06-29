import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const DETAIL_TABS = [
  "basic",
  "skills",
  "compliance",
  "history",
  "calendar",
  "projects",
  "supervision",
  "cppe",
  "onboarding",
  "scope",
];

export interface ListFilters {
  search: string;
  type: string;
  contract: string;
  restricted: string;
  active: string;
  opsLead: string;
  supervisor: string;
  [key: string]: string;
}

export interface RestrictedFilters {
  entityType: string;
  entityId: string;
  search: string;
  [key: string]: string;
}

export interface ClinicianState {
  activeDetailTab: string;
  listFilters: ListFilters;
  restrictedFilters: RestrictedFilters;
  activeComplianceFilter: string;
  activeLeaveType: string;
  cppViewMode: string;
  activeOnboardingSection: string;
}

const initialState: ClinicianState = {
  activeDetailTab: "basic",
  listFilters: {
    search:     "",
    type:       "",
    contract:   "",
    restricted: "",
    active:     "true",
    opsLead:    "",
    supervisor: "",
  },
  restrictedFilters: {
    entityType: "",
    entityId:   "",
    search:     "",
  },
  activeComplianceFilter: "all",
  activeLeaveType: "annual",
  cppViewMode: "overview",
  activeOnboardingSection: "checklist",
};

const clinicianSlice = createSlice({
  name: "clinician",
  initialState,
  reducers: {
    setActiveClinicianDetailTab: (state, action: PayloadAction<string>) => {
      if (DETAIL_TABS.includes(action.payload)) {
        state.activeDetailTab = action.payload;
      }
    },
    resetDetailTab: (state) => {
      state.activeDetailTab = "basic";
    },
    setListFilter: (state, action: PayloadAction<{ key: string; value: string }>) => {
      const { key, value } = action.payload;
      if (key in state.listFilters) {
        state.listFilters[key] = value;
      }
    },
    resetListFilters: (state) => {
      state.listFilters = { ...initialState.listFilters };
    },
    setRestrictedFilter: (state, action: PayloadAction<{ key: string; value: string }>) => {
      const { key, value } = action.payload;
      if (key in state.restrictedFilters) {
        state.restrictedFilters[key] = value;
      }
    },
    resetRestrictedFilters: (state) => {
      state.restrictedFilters = { ...initialState.restrictedFilters };
    },
    setActiveComplianceFilter: (state, action: PayloadAction<string>) => {
      state.activeComplianceFilter = action.payload;
    },
    setActiveLeaveType: (state, action: PayloadAction<string>) => {
      state.activeLeaveType = action.payload;
    },
    setCPPEViewMode: (state, action: PayloadAction<string>) => {
      state.cppViewMode = action.payload;
    },
    setActiveOnboardingSection: (state, action: PayloadAction<string>) => {
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
