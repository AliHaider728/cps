import { BrowserRouter } from "react-router-dom";
import { AuthProvider }  from "./context/AuthContext.jsx";
import AppRouter         from "./routes/AppRouter.jsx";

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}