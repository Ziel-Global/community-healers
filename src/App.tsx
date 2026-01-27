import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CandidatePortal from "./pages/CandidatePortal";
import RegistrationPage from "./pages/candidate/RegistrationPage";
import SchedulingPage from "./pages/candidate/SchedulingPage";
import TrainingPage from "./pages/candidate/TrainingPage";
import CertificatesPage from "./pages/candidate/CertificatesPage";
import NotificationsPage from "./pages/candidate/NotificationsPage";
import ProfilePage from "./pages/candidate/ProfilePage";
import CenterAdminPortal from "./pages/CenterAdminPortal";
import CandidatesPage from "./pages/center/CandidatesPage";
import VerificationPage from "./pages/center/VerificationPage";
import MonitoringPage from "./pages/center/MonitoringPage";
import ResultsPage from "./pages/center/ResultsPage";
import ReportsPage from "./pages/center/ReportsPage";
import SuperAdminPortal from "./pages/SuperAdminPortal";
import ConfigPage from "./pages/admin/ConfigPage";
import CentersPage from "./pages/admin/CentersPage";
import UsersPage from "./pages/admin/UsersPage";
import QuestionsPage from "./pages/admin/QuestionsPage";
import AcademyPage from "./pages/admin/AcademyPage";
import AuditPage from "./pages/admin/AuditPage";
import MinistryPortal from "./pages/MinistryPortal";
import ReviewPage from "./pages/ministry/ReviewPage";
import RegistryPage from "./pages/ministry/RegistryPage";
import LogsPage from "./pages/ministry/LogsPage";
import CenterOversightPage from "./pages/ministry/CentersPage";
import CandidateAuth from "./pages/auth/CandidateAuth";
import CenterAdminAuth from "./pages/auth/CenterAdminAuth";
import SuperAdminAuth from "./pages/auth/SuperAdminAuth";
import MinistryAuth from "./pages/auth/MinistryAuth";
import ExamAuth from "./pages/auth/ExamAuth";
import ExamPortal from "./pages/ExamPortal";
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
          <Route path="/exam/auth" element={<ExamAuth />} />
          {/* Examination Portal */}
          <Route path="/exam/start" element={<ExamPortal />} />
          {/* Portal Routes */}
          <Route path="/candidate" element={<CandidatePortal />} />
          <Route path="/candidate/registration" element={<RegistrationPage />} />
          <Route path="/candidate/schedule" element={<SchedulingPage />} />
          <Route path="/candidate/training" element={<TrainingPage />} />
          <Route path="/candidate/certificates" element={<CertificatesPage />} />
          <Route path="/candidate/notifications" element={<NotificationsPage />} />
          <Route path="/candidate/profile" element={<ProfilePage />} />
          <Route path="/center" element={<CenterAdminPortal />} />
          <Route path="/center/candidates" element={<CandidatesPage />} />
          <Route path="/center/verification" element={<VerificationPage />} />
          <Route path="/center/monitoring" element={<MonitoringPage />} />
          <Route path="/center/results" element={<ResultsPage />} />
          <Route path="/center/reports" element={<ReportsPage />} />
          <Route path="/admin" element={<SuperAdminPortal />} />
          <Route path="/admin/config" element={<ConfigPage />} />
          <Route path="/admin/centers" element={<CentersPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/questions" element={<QuestionsPage />} />
          <Route path="/admin/content" element={<AcademyPage />} />
          <Route path="/admin/audit" element={<AuditPage />} />
          <Route path="/ministry" element={<MinistryPortal />} />
          <Route path="/ministry/review" element={<ReviewPage />} />
          <Route path="/ministry/registry" element={<RegistryPage />} />
          <Route path="/ministry/logs" element={<LogsPage />} />
          <Route path="/ministry/centers" element={<CenterOversightPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
