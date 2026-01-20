import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CandidatePortal from "./pages/CandidatePortal";
import CenterAdminPortal from "./pages/CenterAdminPortal";
import SuperAdminPortal from "./pages/SuperAdminPortal";
import MinistryPortal from "./pages/MinistryPortal";
import CandidateAuth from "./pages/auth/CandidateAuth";
import CenterAdminAuth from "./pages/auth/CenterAdminAuth";
import SuperAdminAuth from "./pages/auth/SuperAdminAuth";
import MinistryAuth from "./pages/auth/MinistryAuth";
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
          {/* Auth Routes */}
          <Route path="/candidate/auth" element={<CandidateAuth />} />
          <Route path="/center/auth" element={<CenterAdminAuth />} />
          <Route path="/admin/auth" element={<SuperAdminAuth />} />
          <Route path="/ministry/auth" element={<MinistryAuth />} />
          {/* Portal Routes */}
          <Route path="/candidate" element={<CandidatePortal />} />
          <Route path="/center" element={<CenterAdminPortal />} />
          <Route path="/admin" element={<SuperAdminPortal />} />
          <Route path="/ministry" element={<MinistryPortal />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
