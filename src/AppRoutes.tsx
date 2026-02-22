import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
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

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Index />} />
            {/* Auth Routes (public) */}
            <Route path="/candidate/auth" element={<CandidateAuth />} />
            <Route path="/center/auth" element={<CenterAdminAuth />} />
            <Route path="/admin/auth" element={<SuperAdminAuth />} />
            <Route path="/ministry/auth" element={<MinistryAuth />} />
            <Route path="/training/auth" element={<ExamAuth />} />



            {/* Training Portal (protected) */}
            <Route path="/training/start" element={<ProtectedRoute portalType="exam"><ExamPortal /></ProtectedRoute>} />




            {/* Candidate Portal Routes (protected) */}
            <Route path="/candidate" element={<ProtectedRoute portalType="candidate"><CandidatePortal /></ProtectedRoute>} />
            <Route path="/candidate/registration" element={<ProtectedRoute portalType="candidate"><RegistrationPage /></ProtectedRoute>} />
            <Route path="/candidate/schedule" element={<ProtectedRoute portalType="candidate"><SchedulingPage /></ProtectedRoute>} />
            <Route path="/candidate/training" element={<ProtectedRoute portalType="candidate"><TrainingPage /></ProtectedRoute>} />
            <Route path="/candidate/certificates" element={<ProtectedRoute portalType="candidate"><CertificatesPage /></ProtectedRoute>} />
            <Route path="/candidate/notifications" element={<ProtectedRoute portalType="candidate"><NotificationsPage /></ProtectedRoute>} />
            <Route path="/candidate/profile" element={<ProtectedRoute portalType="candidate"><ProfilePage /></ProtectedRoute>} />




            {/* Center Admin Portal Routes (protected) */}
            <Route path="/center" element={<ProtectedRoute portalType="center"><CenterAdminPortal /></ProtectedRoute>} />
            <Route path="/center/candidates" element={<ProtectedRoute portalType="center"><CandidatesPage /></ProtectedRoute>} />
            <Route path="/center/verification" element={<ProtectedRoute portalType="center"><VerificationPage /></ProtectedRoute>} />
            <Route path="/center/monitoring" element={<ProtectedRoute portalType="center"><MonitoringPage /></ProtectedRoute>} />
            <Route path="/center/results" element={<ProtectedRoute portalType="center"><ResultsPage /></ProtectedRoute>} />
            <Route path="/center/reports" element={<ProtectedRoute portalType="center"><ReportsPage /></ProtectedRoute>} />



            {/* Super Admin Portal Routes (protected) */}
            <Route path="/admin" element={<ProtectedRoute portalType="admin"><SuperAdminPortal /></ProtectedRoute>} />
            <Route path="/admin/config" element={<ProtectedRoute portalType="admin"><ConfigPage /></ProtectedRoute>} />
            <Route path="/admin/centers" element={<ProtectedRoute portalType="admin"><CentersPage /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute portalType="admin"><UsersPage /></ProtectedRoute>} />
            <Route path="/admin/questions" element={<ProtectedRoute portalType="admin"><QuestionsPage /></ProtectedRoute>} />
            <Route path="/admin/content" element={<ProtectedRoute portalType="admin"><AcademyPage /></ProtectedRoute>} />
            <Route path="/admin/audit" element={<ProtectedRoute portalType="admin"><AuditPage /></ProtectedRoute>} />





            {/* Ministry Portal Routes (protected) */}
            <Route path="/ministry" element={<ProtectedRoute portalType="ministry"><MinistryPortal /></ProtectedRoute>} />
            <Route path="/ministry/review" element={<ProtectedRoute portalType="ministry"><ReviewPage /></ProtectedRoute>} />
            <Route path="/ministry/registry" element={<ProtectedRoute portalType="ministry"><RegistryPage /></ProtectedRoute>} />
            <Route path="/ministry/logs" element={<ProtectedRoute portalType="ministry"><LogsPage /></ProtectedRoute>} />
            <Route path="/ministry/centers" element={<ProtectedRoute portalType="ministry"><CenterOversightPage /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
