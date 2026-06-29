import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PcnFilters {
  search: string;
  icb: string;
  contractType: string;
}

export interface PcnState {
  filters: PcnFilters;
  activeDetailTab: string;
}

const initialState: PcnState = {
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
    setPcnFilters(state, action: PayloadAction<Partial<PcnFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetPcnFilters(state) {
      state.filters = initialState.filters;
    },
    setActivePcnDetailTab(state, action: PayloadAction<string>) {
      state.activeDetailTab = action.payload;
    },
  },
});

export const { setPcnFilters, resetPcnFilters, setActivePcnDetailTab } = pcnSlice.actions;
export default pcnSlice.reducer;
