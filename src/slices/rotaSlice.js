import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  viewMode: "monthly",
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

export const { setRotaViewMode, setRotaFilter, resetRotaFilters } = rotaSlice.actions;

export default rotaSlice.reducer;
