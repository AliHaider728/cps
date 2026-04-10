import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  filters: {
    search: "",
    icb: "",
    contractType: "",
  },
  activeDetailTab: "overview",
};

const pcnSlice = createSlice({
  name: "pcn",
  initialState,
  reducers: {
    setPcnFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetPcnFilters(state) {
      state.filters = initialState.filters;
    },
    setActivePcnDetailTab(state, action) {
      state.activeDetailTab = action.payload;
    },
  },
});

export const { setPcnFilters, resetPcnFilters, setActivePcnDetailTab } = pcnSlice.actions;
export default pcnSlice.reducer;