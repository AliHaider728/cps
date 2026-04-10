import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  hierarchySearch: "",
};

const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    setHierarchySearch(state, action) {
      state.hierarchySearch = action.payload;
    },
    resetHierarchySearch(state) {
      state.hierarchySearch = "";
    },
  },
});

export const { setHierarchySearch, resetHierarchySearch } = clientsSlice.actions;
export default clientsSlice.reducer;
