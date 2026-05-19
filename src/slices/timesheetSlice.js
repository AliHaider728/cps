import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { timesheetService } from "../services/api/timesheetService";

const initialState = {
  myTimesheet: null,
  entries: [],
  pending: [],
  detail: null,
  history: [],
  loading: false,
  error: null,
};

export const fetchMyTimesheet = createAsyncThunk("timesheet/fetchMy", ({ month, year }) =>
  timesheetService.getMyTimesheet(month, year)
);
export const saveTimesheetEntry = createAsyncThunk("timesheet/saveEntry", ({ entryId, data }) =>
  timesheetService.updateEntry(entryId, data)
);
export const submitMyTimesheet = createAsyncThunk("timesheet/submit", (timesheetId) =>
  timesheetService.submitTimesheet(timesheetId)
);
export const fetchPendingTimesheets = createAsyncThunk("timesheet/fetchPending", () =>
  timesheetService.getPendingTimesheets()
);
export const fetchTimesheetDetail = createAsyncThunk("timesheet/fetchDetail", (id) =>
  timesheetService.getTimesheetDetail(id)
);
export const fetchTimesheetHistory = createAsyncThunk("timesheet/fetchHistory", (filters) =>
  timesheetService.getTimesheetHistory(filters)
);

const timesheetSlice = createSlice({
  name: "timesheet",
  initialState,
  reducers: {
    setMyTimesheet: (state, action) => {
      state.myTimesheet = action.payload?.timesheet || action.payload;
      state.entries = action.payload?.entries || [];
    },
    updateEntry: (state, action) => {
      const entry = action.payload?.entry || action.payload;
      const index = state.entries.findIndex((item) => item.id === entry.id);
      if (index >= 0) state.entries[index] = { ...state.entries[index], ...entry };
    },
    setPending: (state, action) => {
      state.pending = action.payload || [];
    },
    setDetail: (state, action) => {
      state.detail = action.payload;
    },
    setHistory: (state, action) => {
      state.history = action.payload?.items || action.payload || [];
    },
  },
  extraReducers: (builder) => {
    // ✅ FIX: addCase PEHLE, addMatcher BAAD MEIN
    builder
      // ── fetchMyTimesheet ──────────────────────────────
      .addCase(fetchMyTimesheet.fulfilled, (state, action) => {
        state.loading = false;
        state.myTimesheet = action.payload?.timesheet || null;
        state.entries = action.payload?.entries || [];
      })

      // ── saveTimesheetEntry ────────────────────────────
      .addCase(saveTimesheetEntry.fulfilled, (state, action) => {
        state.loading = false;
        const entry = action.payload?.entry;
        const index = state.entries.findIndex((item) => item.id === entry?.id);
        if (index >= 0) state.entries[index] = { ...state.entries[index], ...entry };
      })

      // ── submitMyTimesheet ─────────────────────────────
      .addCase(submitMyTimesheet.fulfilled, (state, action) => {
        state.loading = false;
        if (state.myTimesheet) {
          state.myTimesheet.status = action.payload?.status || "submitted";
        }
      })

      // ── fetchPendingTimesheets ────────────────────────
      .addCase(fetchPendingTimesheets.fulfilled, (state, action) => {
        state.loading = false;
        state.pending = action.payload || [];
      })

      // ── fetchTimesheetDetail ──────────────────────────
      .addCase(fetchTimesheetDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.detail = action.payload;
      })

      // ── fetchTimesheetHistory ─────────────────────────
      .addCase(fetchTimesheetHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload?.items || [];
      })

      // ✅ addMatcher SAB KE BAAD — loading/error globally handle karo
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
        (state, action) => {
          state.loading = false;
          state.error = action.error?.message || "Request failed";
        }
      );
  },
});

export const { setMyTimesheet, updateEntry, setPending, setDetail, setHistory } =
  timesheetSlice.actions;
export default timesheetSlice.reducer;