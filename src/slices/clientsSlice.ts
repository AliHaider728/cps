import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ClientsState {
  hierarchySearch: string;
}

const initialState: ClientsState = {
  hierarchySearch: "",
};

const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    setHierarchySearch(state, action: PayloadAction<string>) {
      state.hierarchySearch = action.payload;
    },
    resetHierarchySearch(state) {
      state.hierarchySearch = "";
    },
  },
});

export const { setHierarchySearch, resetHierarchySearch } = clientsSlice.actions;
export default clientsSlice.reducer;
