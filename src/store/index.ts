import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import clientsReducer from "../slices/clientsSlice";
import pcnReducer from "../slices/pcnSlice";
import clinicianReducer from "../slices/clinicianSlice";
import rotaReducer from "../slices/rotaSlice";
import timesheetReducer from "../slices/timesheetSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientsReducer,
    pcn: pcnReducer,
    clinician: clinicianReducer,
    rota: rotaReducer,
    timesheet: timesheetReducer,
  },
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
