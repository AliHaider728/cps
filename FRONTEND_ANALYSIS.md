# Frontend Codebase Analysis Report

## 1. Executive Summary

This document provides a deep, exhaustive analysis of the `frontend` directory in the CPS Intranet project (built with React, Vite, TypeScript, Redux Toolkit, React Query, and Tailwind CSS). It outlines a module-by-module breakdown of the system, identifying exactly what each module does and how they are wired. It concludes with a critical assessment highlighting bugs, duplicated code, dead code, and missing functionality that should be addressed before moving into production.

---

## 2. Module-by-Module Breakdown

The application is structured into domain-driven and technical modules. Routing is entirely managed by `react-router-dom` in `src/routes/AppRouter.tsx`. The global state is managed primarily via `Redux Toolkit` (auth, base references) and `@tanstack/react-query` (data fetching/mutations).

### 2.1 Core Infrastructure
- **Routing** (`src/routes/AppRouter.tsx`): 
  - Protects routes based on RBAC (Role-Based Access Control) using the `<ProtectedRoute>` and `<DashboardLayout>` wrappers. 
  - Roles check against matrices like `CM_ROLES`, `LEAVE_ADMIN_ROLES`, `TS_ROLES`.
- **API & Networking** (`src/services/api/` & `src/api/`):
  - Uses `axios` (`src/services/api/client.ts`) configured with `API_BASE_URL`.
  - Implements Request/Response interceptors to inject `Bearer` tokens from `localStorage` and handle `401 Unauthorized` logic safely.
- **State Management** (`src/store/index.ts` & `src/slices/`): 
  - Standard Redux setup with `authSlice`, `clientsSlice`, `clinicianSlice`, etc., providing reactive global scope where components subscribe to state using the `useAppSelector` typed hook.
- **Data Fetching Hooks** (`src/hooks/`): 
  - Employs TanStack React Query for complex asynchronous operations caching, e.g., `usePCN.ts`, `useICB.ts`, `usePractice.ts`. Includes standard CRUD hooks (`useCreate...`, `useUpdate...`, `useDelete...`).

### 2.2 Client Management Module (`src/pages/super-admin/client-managemnet/`)
- **What it does**: Handles hierarchical organization data (Integrated Care Boards (ICBs) -> Federations -> Primary Care Networks (PCNs) -> Practices). 
- **Where it happens**: `ClientsPage.tsx` acts as the hub. Granular list and detail pages are present for each tier (e.g., `ICBListPage.tsx`, `ICBDetailPage.tsx`, `PracticeListPage.tsx`).
- **How it connects**: Uses query hooks (`useICBs`, `usePCNs`, `usePractices`) to fetch lists. Forms are built directly within the pages as inline Modals (e.g., `ICBModal` inside `ICBListPage.tsx`). 

### 2.3 Clinician Management & Portal (`src/pages/super-admin/Clinician-Management/`, `src/pages/clinician/`)
- **What it does**: The Admin view manages clinician records, competencies, compliance documents, and super-visions. The Portal view lets clinicians view schedules (rotas), submit leave, and upload compliance certificates.
- **Where it happens**: 
  - **Admin**: `CliniciansListPage.tsx` and `CliniciansDetailPage.tsx` (using multiple tab panels from `src/pages/super-admin/Clinician-Management/panels/`).
  - **Clinician**: `ClinicianDashboard.tsx` is the primary interface for shifts and summary statistics.
- **How it connects**: Relies on hooks like `useClinician.ts`, `useClinicianCompliance.ts`. Timesheet queueing and leave requests interact with `rotaService.ts` and `timeEntryService.ts`.

### 2.4 Rota & Timesheet Management (`src/pages/super-admin/RotaManagement/`)
- **What it does**: Manages shift scheduling, gap finding, time entries, and timesheet approvals.
- **Where it happens**: `RotaPage.tsx` holds multiple calendar views (Monthly, Weekly, Clinician Diary, Gap Report). 
- **How it connects**: Timesheets go through approval flows (`TimesheetQueuePage.tsx` and `TimesheetDetailPage.tsx`). Relies on hooks `useRota.ts` and `useTimesheet.ts`.

---

## 3. Critical Code Assessment

This section represents a brutally honest evaluation of the codebase, detailing glaring flaws, duplicated logic, dead code, and unresolved typing bugs.

### 3.1 BUGS (TypeScript & Logic Errors)
Several TypeScript mismatches and potential runtime faults reside in the codebase:
- **`src/context/AuthContext.tsx`**: 
  - **Error (`L77`)**: The `login` function returns an object signature mismatching the `AuthContextType` interface. Specifically, returning `redirectTo: unknown; mustChangePassword: {}` instead of `string | undefined` and `boolean | undefined`. This indicates a loosely typed API response `data.user` that hasn't been properly cast.
- **`src/components/ui/alert-dialog.tsx` (`L162`)**: 
  - The variant `"default"` is being passed to an element that expects `"primary"`, `"danger"`, etc., indicating a mismatch between the base UI definitions and Radical/Shadcn configurations.
- **`src/hooks/useCompliance.ts` (`L166-225`)**:
  - Contains extensive type signature clashes where `string | null` is being passed into parameters strictly requiring `string | number`. This will result in runtime errors if null checks aren't validated prior to invoking query actions.
- **`src/hooks/useClinicianDashboardStats.ts` (`L100`)**:
  - Attempting to use an ES6 `Map<string, string>` where a standard object record `Record<string, string>` is expected by the component prop.

### 3.2 DUPLICATED CODE
The codebase severely violates the DRY (Don't Repeat Yourself) principle, primarily in the UI layer of the Super Admin module:
- **CRUD List Pages (`ICBListPage.tsx`, `FederationListPage.tsx`, `PCNListPage.tsx`, `PracticeListPage.tsx`)**:
  - These pages are fundamentally carbon copies of one another. They all include a massive local Modal component (`ICBModal`, `PracticeModal`) defined inside the same file (e.g., `PracticeListPage.tsx` is ~528 lines long). 
  - **The Filter Bar**: The UI structure, toggle state logic (`showFilters`), Search Inputs, and state normalizations are physically copied and pasted across these pages instead of being abstracted into a shared `<AdvancedDataFilter>` or `<CrudPageTemplate>` component.
- **Data Hook Boilerplate (`useICB.ts`, `usePCN.ts`, `usePractice.ts`)**:
  - Complete duplication of `react-query` boilerplate for standard REST methods. A generic factory pattern like `createCrudHooks('icb', icbAPI)` would eliminate hundreds of lines of identical mutation invalidation logic.

### 3.3 DEAD CODE & MISSING PIECES
Crucial application features have been stubbed or abandoned midway through implementation:
- **Empty / Stubbed Dashboards**:
  - Files such as `src/pages/ops/OpsDashboard.tsx`, `src/pages/director/DirectorDashboard.tsx`, `src/pages/finance/FinanceDashboard.tsx`, `src/pages/training/TrainingDashboard.tsx`, and `src/pages/workforce/WorkforceDashboard.tsx` are entirely **dead endpoints**. 
  - They contain strictly hard-coded mock values (e.g., `value: "£2.4M"`) and do absolutely zero data fetching, despite being linked in the main router (`AppRouter.tsx`).
- **Missing Hook Usages**:
  - `src/hooks/useEmail.ts`: Provides a `useSendMassEmail` hook, but extensive scans show lack of proper linkage to meaningful client-side UI queues except for one standalone `MassEmailModal.tsx` which has incomplete state wiring.
- **Unused Files & Slices**:
  - Slices like `clientsSlice.ts` contain purely boilerplate Redux setup (`setHierarchySearch`) but are seldom used globally in favor of React Query cache state, making them virtually dead code padding the bundle.

### 3.4 Summary Recommendations
1. **Refactor Client List Pages**: Extract the inline Modals to their own files (e.g., `PracticeFormModal.tsx`). Abstract the duplicated Filter logic into a `ReusableListLayout` component.
2. **Fix Type Definitions**: Address the `AuthContext` and `useCompliance` type errors. The backend API interfaces must be strongly typed to avoid dangerous `unknown` casts.
3. **Build the Role Dashboards**: Replace the mocked variables in Ops, Director, and Finance dashboards with actual `react-query` data fetchers connecting to respective KPI endpoints.
