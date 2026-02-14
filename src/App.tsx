import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import Index from "./pages/Index";
import Results from "./pages/Results";
import VisualResults from "./pages/VisualResults";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const knownPaths = ["/", "/results", "/visual-results", "/history", "/settings", "/login", "/signup"];
const excludedPaths = ["/", "/login"];

function AppContent() {
  const location = useLocation();
  const isKnownPath = knownPaths.includes(location.pathname);
  const isExcluded = excludedPaths.includes(location.pathname);
  const showGrid = isKnownPath && !isExcluded;

  return (
    <>
      {showGrid && (
        <FlickeringGrid
          className="fixed inset-0 z-[-1] size-full"
          squareSize={4}
          gridGap={6}
          color="#6B7280"
          maxOpacity={0.5}
          flickerChance={0.1}
        />
      )}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/results" element={<Results />} />
        <Route path="/visual-results" element={<VisualResults />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
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
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
