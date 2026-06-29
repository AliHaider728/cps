import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface RotaFilters {
  month: number | null;
  year: number | null;
  pcnId: string;
  practiceId: string;
  clinicianType: string;
  status: string;
  opsLead: string;
  [key: string]: any;
}

export interface RotaState {
  selectedMonth: number;
  selectedYear: number;
  selectedClinician: string | null;
  viewMode: string;
  gapFilter: string;
  filters: RotaFilters;
}

const initialState: RotaState = {
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  selectedClinician: null,
  viewMode: "monthly",
  gapFilter: "all",
  filters: {
    month: null,
    year: null,
    pcnId: "",
    practiceId: "",
    clinicianType: "",
    status: "",
    opsLead: "",
  },
};

const rotaSlice = createSlice({
  name: "rota",
  initialState,
  reducers: {
    setRotaViewMode: (state, action: PayloadAction<string>) => {
      state.viewMode = action.payload;
    },
    setSelectedMonth: (state, action: PayloadAction<number>) => {
      state.selectedMonth = action.payload;
      state.filters.month = action.payload;
    },
    setSelectedYear: (state, action: PayloadAction<number>) => {
      state.selectedYear = action.payload;
      state.filters.year = action.payload;
    },
    setSelectedClinician: (state, action: PayloadAction<string | null>) => {
      state.selectedClinician = action.payload;
    },
    setGapFilter: (state, action: PayloadAction<string>) => {
      state.gapFilter = action.payload;
    },
    setRotaFilter: (state, action: PayloadAction<{ key: string; value: any }>) => {
      const { key, value } = action.payload || {};
      if (key && key in state.filters) {
        state.filters[key] = value;
      }
    },
    resetRotaFilters: (state) => {
      state.filters = { ...initialState.filters };
    },
  },
});

export const {
  setRotaViewMode,
  setSelectedMonth,
  setSelectedYear,
  setSelectedClinician,
  setGapFilter,
  setRotaFilter,
  resetRotaFilters,
} = rotaSlice.actions;

export default rotaSlice.reducer;
