import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// Assuming storage is from api
import { storage } from "../services/api/index";

export interface AuthState {
  user: any; 
  token: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: storage.getUser(),
  token: storage.getToken(),
  initialized: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<{ token: string | null; user: any }>) {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.initialized = true;
    },
    updateUser(state, action: PayloadAction<any>) {
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
