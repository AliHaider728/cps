import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";

// Assuming we don't have RootState and AppDispatch defined, we'll use generic types or unknown if not available.
// A typical pattern:
export type RootState = Record<string, unknown>; // Placeholder
export type AppDispatch = ReturnType<typeof useDispatch>; // Placeholder

export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

