import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DotPattern } from "@/components/ui/dot-pattern";
import Index from "./pages/Index";
import Results from "./pages/Results";
import VisualResults from "./pages/VisualResults";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function PatternLayout() {
  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DotPattern className="opacity-60" />
      </div>
      <Outlet />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="prospect-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route element={<PatternLayout />}>
              <Route path="/results" element={<Results />} />
              <Route path="/visual-results" element={<VisualResults />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/signup" element={<Signup />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
