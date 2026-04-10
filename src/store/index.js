import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import clientsReducer from "../slices/clientsSlice";
import pcnReducer from "../slices/pcnSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientsReducer,
    pcn: pcnReducer,
  },
  devTools: import.meta.env.DEV,
});

export default store;
