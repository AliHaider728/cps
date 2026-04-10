import { createSlice } from "@reduxjs/toolkit";
import { storage } from "../services/api";

const initialState = {
  user: storage.getUser(),
  token: storage.getToken(),
  initialized: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(state, action) {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.initialized = true;
    },
    updateUser(state, action) {
      state.user = action.payload;
    },
    clearSession(state) {
      state.token = null;
      state.user = null;
      state.initialized = true;
    },
  },
});

export const { setSession, updateUser, clearSession } = authSlice.actions;
export default authSlice.reducer;
