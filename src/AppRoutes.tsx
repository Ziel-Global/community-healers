import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoadingSpinner } from "./components/LoadingSpinner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AppErrorBoundary } from "./errors/ErrorBoundary";

// Route-level code splitting: each portal's pages become their own chunk,
// fetched only when a visitor actually navigates into that portal, instead
// of every portal's code shipping in the first-load bundle for everyone.
const CandidatePortal = lazy(() => import("./pages/CandidatePortal"));
const RegistrationPage = lazy(() => import("./pages/candidate/RegistrationPage"));
const SchedulingPage = lazy(() => import("./pages/candidate/SchedulingPage"));
const TrainingPage = lazy(() => import("./pages/candidate/TrainingPage"));
const CertificatesPage = lazy(() => import("./pages/candidate/CertificatesPage"));
const NotificationsPage = lazy(() => import("./pages/candidate/NotificationsPage"));
const ComplaintsPage = lazy(() => import("./pages/candidate/ComplaintsPage"));
const ProfilePage = lazy(() => import("./pages/candidate/ProfilePage"));

const CenterAdminPortal = lazy(() => import("./pages/CenterAdminPortal"));
const CenterCertificatesPage = lazy(() => import("./pages/center/CertificatesPage"));
const CandidatesPage = lazy(() => import("./pages/center/CandidatesPage"));
const VerificationPage = lazy(() => import("./pages/center/VerificationPage"));
const MonitoringPage = lazy(() => import("./pages/center/MonitoringPage"));
const ResultsPage = lazy(() => import("./pages/center/ResultsPage"));
const ReportsPage = lazy(() => import("./pages/center/ReportsPage"));
const SettingsPage = lazy(() => import("./pages/center/SettingsPage"));

const SuperAdminPortal = lazy(() => import("./pages/SuperAdminPortal"));
const ConfigPage = lazy(() => import("./pages/admin/ConfigPage"));
const CentersPage = lazy(() => import("./pages/admin/CentersPage"));
const CenterApplicationsPage = lazy(() => import("./pages/admin/CenterApplicationsPage"));
const CenterApplicationDetailPage = lazy(() => import("./pages/admin/CenterApplicationDetailPage"));
const CommitteePage = lazy(() => import("./pages/admin/CommitteePage"));
const UsersPage = lazy(() => import("./pages/admin/UsersPage"));
const AdminComplaintsPage = lazy(() => import("./pages/admin/ComplaintsPage"));
const QuestionsPage = lazy(() => import("./pages/admin/QuestionsPage"));
const AcademyPage = lazy(() => import("./pages/admin/AcademyPage"));
const AuditPage = lazy(() => import("./pages/admin/AuditPage"));

const MinistryPortal = lazy(() => import("./pages/MinistryPortal"));
const ReviewPage = lazy(() => import("./pages/ministry/ReviewPage"));
const RegistryPage = lazy(() => import("./pages/ministry/RegistryPage"));
const DegreeReviewPage = lazy(() => import("./pages/ministry/DegreeReviewPage"));
const LogsPage = lazy(() => import("./pages/ministry/LogsPage"));
const CenterOversightPage = lazy(() => import("./pages/ministry/CentersPage"));

const CandidateAuth = lazy(() => import("./pages/auth/CandidateAuth"));
const CenterAdminAuth = lazy(() => import("./pages/auth/CenterAdminAuth"));
const CenterSetPasswordPage = lazy(() => import("./pages/auth/CenterSetPasswordPage"));
const SuperAdminAuth = lazy(() => import("./pages/auth/SuperAdminAuth"));
const MinistryAuth = lazy(() => import("./pages/auth/MinistryAuth"));
const ExamAuth = lazy(() => import("./pages/auth/ExamAuth"));
const CommitteeMemberAuth = lazy(() => import("./pages/auth/CommitteeMemberAuth"));
const DirectorOperationsAuth = lazy(() => import("./pages/auth/DirectorOperationsAuth"));
const ExamPortal = lazy(() => import("./pages/ExamPortal"));

const CommitteeMemberPortal = lazy(() => import("./pages/CommitteeMemberPortal"));
const CommitteeApplicationDetailPage = lazy(() => import("./pages/committee/ApplicationDetailPage"));
const CommitteeInspectionHistoryPage = lazy(() => import("./pages/committee/InspectionHistoryPage"));

const DirectorOperationsPortal = lazy(() => import("./pages/DirectorOperationsPortal"));
const DoCenterApplicationsPage = lazy(() => import("./pages/director-operations/CenterApplicationsPage"));
const DoCenterApplicationDetailPage = lazy(() => import("./pages/director-operations/CenterApplicationDetailPage"));

const CenterOnboardingWizard = lazy(() => import("./pages/center-onboarding/CenterOnboardingWizard"));

export function AppRoutes() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <Routes>
                <Route path="/" element={<Index />} />
                {/* Auth Routes (public) */}
                <Route path="/candidate/auth" element={<CandidateAuth />} />
                <Route path="/center/auth" element={<CenterAdminAuth />} />
                <Route path="/center/set-password" element={<CenterSetPasswordPage />} />
                <Route path="/admin/auth" element={<SuperAdminAuth />} />
                <Route path="/ministry/auth" element={<MinistryAuth />} />
                <Route path="/training/auth" element={<ExamAuth />} />
                <Route path="/committee/auth" element={<CommitteeMemberAuth />} />
                <Route path="/director-operations/auth" element={<DirectorOperationsAuth />} />

                {/* Center Onboarding — public, no login (applicant has no account until approved).
                    Deliberately NOT "/center-onboarding": that path is also the API proxy
                    prefix for this feature's backend routes, and a hard navigation here
                    (the whole point of this being a public link) would otherwise be
                    swallowed by the proxy instead of reaching this page. */}
                <Route path="/apply-center" element={<CenterOnboardingWizard />} />



                {/* Training Portal (protected) */}
                <Route path="/training/start" element={
                    <ProtectedRoute portalType="exam">
                        <AppErrorBoundary
                            fallbackTitle="Something Went Wrong"
                            fallbackDescription="Don't worry — your answers are autosaved as you go. Try again to pick up where you left off."
                        >
                            <ExamPortal />
                        </AppErrorBoundary>
                    </ProtectedRoute>
                } />




                {/* Candidate Portal Routes (protected) */}
                <Route path="/candidate" element={<ProtectedRoute portalType="candidate"><CandidatePortal /></ProtectedRoute>} />
                <Route path="/candidate/registration" element={<ProtectedRoute portalType="candidate"><RegistrationPage /></ProtectedRoute>} />
                <Route path="/candidate/schedule" element={<ProtectedRoute portalType="candidate"><SchedulingPage /></ProtectedRoute>} />
                <Route path="/candidate/training" element={<ProtectedRoute portalType="candidate"><TrainingPage /></ProtectedRoute>} />
                <Route path="/candidate/certificates" element={<ProtectedRoute portalType="candidate"><CertificatesPage /></ProtectedRoute>} />
                <Route path="/candidate/notifications" element={<ProtectedRoute portalType="candidate"><NotificationsPage /></ProtectedRoute>} />
                <Route path="/candidate/complaints" element={<ProtectedRoute portalType="candidate"><ComplaintsPage /></ProtectedRoute>} />
                <Route path="/candidate/profile" element={<ProtectedRoute portalType="candidate"><ProfilePage /></ProtectedRoute>} />




                {/* Center Admin Portal Routes (protected) */}
                <Route path="/center" element={<ProtectedRoute portalType="center"><CenterAdminPortal /></ProtectedRoute>} />
                <Route path="/center/candidates" element={<ProtectedRoute portalType="center"><CandidatesPage /></ProtectedRoute>} />
                <Route path="/center/verification" element={<ProtectedRoute portalType="center"><VerificationPage /></ProtectedRoute>} />
                <Route path="/center/monitoring" element={<ProtectedRoute portalType="center"><MonitoringPage /></ProtectedRoute>} />
                <Route path="/center/results" element={<ProtectedRoute portalType="center"><ResultsPage /></ProtectedRoute>} />
                <Route path="/center/certificates" element={<ProtectedRoute portalType="center"><CenterCertificatesPage /></ProtectedRoute>} />
                <Route path="/center/reports" element={<ProtectedRoute portalType="center"><ReportsPage /></ProtectedRoute>} />
                <Route path="/center/settings" element={<ProtectedRoute portalType="center"><SettingsPage /></ProtectedRoute>} />



                {/* Super Admin Portal Routes (protected) */}
                <Route path="/admin" element={<ProtectedRoute portalType="admin"><SuperAdminPortal /></ProtectedRoute>} />
                <Route path="/admin/config" element={<ProtectedRoute portalType="admin"><ConfigPage /></ProtectedRoute>} />
                <Route path="/admin/centers" element={<ProtectedRoute portalType="admin"><CentersPage /></ProtectedRoute>} />
                <Route path="/admin/applications" element={<ProtectedRoute portalType="admin"><CenterApplicationsPage /></ProtectedRoute>} />
                <Route path="/admin/applications/:applicationId" element={<ProtectedRoute portalType="admin"><CenterApplicationDetailPage /></ProtectedRoute>} />
                <Route path="/admin/committee" element={<ProtectedRoute portalType="admin"><CommitteePage /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute portalType="admin"><UsersPage /></ProtectedRoute>} />
                <Route path="/admin/complaints" element={<ProtectedRoute portalType="admin"><AdminComplaintsPage /></ProtectedRoute>} />
                <Route path="/admin/questions" element={<ProtectedRoute portalType="admin"><QuestionsPage /></ProtectedRoute>} />
                <Route path="/admin/content" element={<ProtectedRoute portalType="admin"><AcademyPage /></ProtectedRoute>} />
                <Route path="/admin/audit" element={<ProtectedRoute portalType="admin"><AuditPage /></ProtectedRoute>} />





                {/* Ministry Portal Routes (protected) */}
                <Route path="/ministry" element={<ProtectedRoute portalType="ministry"><MinistryPortal /></ProtectedRoute>} />
                <Route path="/ministry/review" element={<ProtectedRoute portalType="ministry"><ReviewPage /></ProtectedRoute>} />
                <Route path="/ministry/registry" element={<ProtectedRoute portalType="ministry"><RegistryPage /></ProtectedRoute>} />
                <Route path="/ministry/degree-review" element={<ProtectedRoute portalType="ministry"><DegreeReviewPage /></ProtectedRoute>} />
                <Route path="/ministry/logs" element={<ProtectedRoute portalType="ministry"><LogsPage /></ProtectedRoute>} />
                <Route path="/ministry/centers" element={<ProtectedRoute portalType="ministry"><CenterOversightPage /></ProtectedRoute>} />

                {/* Approval Committee Portal Routes (protected) */}
                <Route path="/committee" element={<ProtectedRoute portalType="committee"><CommitteeMemberPortal /></ProtectedRoute>} />
                <Route path="/committee/applications/:applicationId" element={<ProtectedRoute portalType="committee"><CommitteeApplicationDetailPage /></ProtectedRoute>} />
                <Route path="/committee/history" element={<ProtectedRoute portalType="committee"><CommitteeInspectionHistoryPage /></ProtectedRoute>} />

                {/* Director of Operations Portal Routes (protected) */}
                <Route path="/director-operations" element={<ProtectedRoute portalType="director-operations"><DirectorOperationsPortal /></ProtectedRoute>} />
                <Route path="/director-operations/applications" element={<ProtectedRoute portalType="director-operations"><DoCenterApplicationsPage /></ProtectedRoute>} />
                <Route path="/director-operations/applications/:applicationId" element={<ProtectedRoute portalType="director-operations"><DoCenterApplicationDetailPage /></ProtectedRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
}
