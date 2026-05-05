import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import clientsReducer from "../slices/clientsSlice";
import pcnReducer from "../slices/pcnSlice";
import clinicianReducer from "../slices/clinicianSlice";
import rotaReducer from "../slices/rotaSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientsReducer,
    pcn: pcnReducer,
    clinician: clinicianReducer,
    rota: rotaReducer,
  },
  devTools: import.meta.env.DEV,
});

export default store;
