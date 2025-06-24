import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import FundDetail from "./pages/FundDetail";
import SavedFunds from "./pages/SavedFunds";
import Dashboard from "./pages/Dashboard";
import ExpertGuidance from "./pages/ExpertGuidance";
import SecurityPage from "./pages/Security";
import Guidance from "./pages/Guidance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<Search />} />
          <Route path="/fund/:schemeCode" element={<FundDetail />} />
          <Route path="/saved" element={<SavedFunds />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/guidance" element={<ExpertGuidance />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/guidance/new" element={<Guidance />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
