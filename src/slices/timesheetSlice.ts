import { createAsyncThunk, createSlice, PayloadAction, SerializedError } from "@reduxjs/toolkit";
import { timesheetService } from "../services/api/timesheetService";

export interface TimesheetEntry {
  id: string;
  [key: string]: any;
}

export interface TimesheetDetail {
  status?: string;
  [key: string]: any;
}

export interface TimesheetState {
  myTimesheet: TimesheetDetail | null;
  entries: TimesheetEntry[];
  pending: any[];
  detail: any | null;
  history: any[];
  loading: boolean;
  error: string | null;
}

const initialState: TimesheetState = {
  myTimesheet: null,
  entries: [],
  pending: [],
  detail: null,
  history: [],
  loading: false,
  error: null,
};

export const fetchMyTimesheet = createAsyncThunk("timesheet/fetchMy", ({ month, year }: { month: number; year: number }) =>
  timesheetService.getMyTimesheet(month, year)
);
export const saveTimesheetEntry = createAsyncThunk("timesheet/saveEntry", ({ entryId, data }: { entryId: string; data: any }) =>
  timesheetService.updateEntry(entryId, data)
);
export const submitMyTimesheet = createAsyncThunk("timesheet/submit", (timesheetId: string) =>
  timesheetService.submitTimesheet(timesheetId)
);
export const fetchPendingTimesheets = createAsyncThunk("timesheet/fetchPending", () =>
  timesheetService.getPendingTimesheets()
);
export const fetchTimesheetDetail = createAsyncThunk("timesheet/fetchDetail", (id: string) =>
  timesheetService.getTimesheetDetail(id)
);
export const fetchTimesheetHistory = createAsyncThunk("timesheet/fetchHistory", (filters: any) =>
  timesheetService.getTimesheetHistory(filters)
);

const timesheetSlice = createSlice({
  name: "timesheet",
  initialState,
  reducers: {
    setMyTimesheet: (state, action: PayloadAction<any>) => {
      state.myTimesheet = action.payload?.timesheet || action.payload;
      state.entries = action.payload?.entries || [];
    },
    updateEntry: (state, action: PayloadAction<any>) => {
      const entry = action.payload?.entry || action.payload;
      const index = state.entries.findIndex((item) => item.id === entry.id);
      if (index >= 0) state.entries[index] = { ...state.entries[index], ...entry };
    },
    setPending: (state, action: PayloadAction<any[]>) => {
      state.pending = action.payload || [];
    },
    setDetail: (state, action: PayloadAction<any>) => {
      state.detail = action.payload;
    },
    setHistory: (state, action: PayloadAction<any>) => {
      state.history = action.payload?.items || action.payload || [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTimesheet.fulfilled, (state, action) => {
        state.loading = false;
        state.myTimesheet = action.payload?.timesheet || null;
        state.entries = action.payload?.entries || [];
      })
      .addCase(saveTimesheetEntry.fulfilled, (state, action) => {
        state.loading = false;
        const entry = action.payload?.entry;
        const index = state.entries.findIndex((item) => item.id === entry?.id);
        if (index >= 0) state.entries[index] = { ...state.entries[index], ...entry };
      })
      .addCase(submitMyTimesheet.fulfilled, (state, action) => {
        state.loading = false;
        if (state.myTimesheet) {
          state.myTimesheet.status = action.payload?.status || "submitted";
        }
      })
      .addCase(fetchPendingTimesheets.fulfilled, (state, action) => {
        state.loading = false;
        state.pending = action.payload || [];
      })
      .addCase(fetchTimesheetDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.detail = action.payload;
      })
      .addCase(fetchTimesheetHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload?.items || [];
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("timesheet/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => 
          action.type.startsWith("timesheet/") && action.type.endsWith("/rejected"),
        (state, action: any) => {
          state.loading = false;
          state.error = action.error?.message || "Request failed";
        }
      );
  },
});

export const { setMyTimesheet, updateEntry, setPending, setDetail, setHistory } =
  timesheetSlice.actions;
export default timesheetSlice.reducer;
