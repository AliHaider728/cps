import { createSlice } from "@reduxjs/toolkit";

const initialState = {
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
    setRotaViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setSelectedMonth: (state, action) => {
      state.selectedMonth = action.payload;
      state.filters.month = action.payload;
    },
    setSelectedYear: (state, action) => {
      state.selectedYear = action.payload;
      state.filters.year = action.payload;
    },
    setSelectedClinician: (state, action) => {
      state.selectedClinician = action.payload;
    },
    setGapFilter: (state, action) => {
      state.gapFilter = action.payload;
    },
    setRotaFilter: (state, action) => {
      const { key, value } = action.payload || {};
      if (key in state.filters) {
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
