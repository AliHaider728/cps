import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import ScrollToTop from "./components/layout/ScrollToTop";

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ScrollToTop />
      <AppRouter />
    </BrowserRouter>
  );
}
