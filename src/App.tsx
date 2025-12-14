import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { Layout } from "./components/Layout";
import WelcomePage from "./pages/WelcomePage";
import Dashboard from "./pages/Dashboard";
import IdeaPage from "./pages/IdeaPage";
import RunAllPage from "./pages/RunAllPage";
import ResultsPage from "./pages/ResultsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Welcome page without layout */}
            <Route path="/" element={<WelcomePage />} />
            
            {/* Main app with layout */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<Dashboard />} />
              <Route path="/run-all" element={<RunAllPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/idea/:id" element={<IdeaPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
