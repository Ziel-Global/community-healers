import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/roles";

vi.mock("@/context/AuthContext", () => ({
    useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

function renderPortal(
    portalType: "candidate" | "center" | "admin" | "ministry" | "exam",
    initialPath: string,
) {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
                <Route
                    path={initialPath}
                    element={
                        <ProtectedRoute portalType={portalType}>
                            <div>PROTECTED_CONTENT</div>
                        </ProtectedRoute>
                    }
                />
                <Route path="/candidate/auth" element={<div>CANDIDATE_AUTH</div>} />
                <Route path="/center/auth" element={<div>CENTER_AUTH</div>} />
                <Route path="/admin/auth" element={<div>ADMIN_AUTH</div>} />
                <Route path="/ministry/auth" element={<div>MINISTRY_AUTH</div>} />
                <Route path="/training/auth" element={<div>EXAM_AUTH</div>} />
                <Route path="/candidate" element={<div>CANDIDATE_HOME</div>} />
                <Route path="/center" element={<div>CENTER_HOME</div>} />
                <Route path="/admin" element={<div>ADMIN_HOME</div>} />
                <Route path="/ministry" element={<div>MINISTRY_HOME</div>} />
            </Routes>
        </MemoryRouter>,
    );
}

function mockAuth(role: UserRole | null) {
    mockedUseAuth.mockReturnValue({
        isAuthenticated: role !== null,
        isLoading: false,
        user: role ? { id: "u1", email: "a@b.com", firstName: "A", lastName: "B", phoneNumber: "", role } : null,
        token: role ? "fake-token" : null,
        error: null,
        loginCandidate: vi.fn(),
        loginCenterAdmin: vi.fn(),
        loginMinistry: vi.fn(),
        loginSuperAdmin: vi.fn(),
        signup: vi.fn(),
        verifyCandidate: vi.fn(),
        logout: vi.fn(),
        examScheduleInfo: null,
        checkExamSchedule: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe("ProtectedRoute — unauthenticated", () => {
    it("redirects to the portal's own auth page for each portal", () => {
        mockAuth(null);
        const cases: Array<[Parameters<typeof renderPortal>[0], string, string]> = [
            ["candidate", "/candidate", "CANDIDATE_AUTH"],
            ["center", "/center", "CENTER_AUTH"],
            ["admin", "/admin", "ADMIN_AUTH"],
            ["ministry", "/ministry", "MINISTRY_AUTH"],
            ["exam", "/training/start", "EXAM_AUTH"],
        ];
        for (const [portalType, path, expectedText] of cases) {
            const { unmount } = renderPortal(portalType, path);
            expect(screen.getByText(expectedText)).toBeInTheDocument();
            expect(screen.queryByText("PROTECTED_CONTENT")).not.toBeInTheDocument();
            unmount();
        }
    });
});

describe("ProtectedRoute — wrong role is blocked, not just unauthenticated", () => {
    it("CANDIDATE cannot open the center portal — bounced to their own home, not shown center UI", () => {
        mockAuth("CANDIDATE");
        renderPortal("center", "/center");
        expect(screen.queryByText("PROTECTED_CONTENT")).not.toBeInTheDocument();
        expect(screen.getByText("CANDIDATE_HOME")).toBeInTheDocument();
    });

    it("CANDIDATE cannot open the admin portal", () => {
        mockAuth("CANDIDATE");
        renderPortal("admin", "/admin");
        expect(screen.queryByText("PROTECTED_CONTENT")).not.toBeInTheDocument();
        expect(screen.getByText("CANDIDATE_HOME")).toBeInTheDocument();
    });

    it("CANDIDATE cannot open the ministry portal", () => {
        mockAuth("CANDIDATE");
        renderPortal("ministry", "/ministry");
        expect(screen.queryByText("PROTECTED_CONTENT")).not.toBeInTheDocument();
        expect(screen.getByText("CANDIDATE_HOME")).toBeInTheDocument();
    });

    it("CENTER_ADMIN cannot open the admin portal — bounced to /center", () => {
        mockAuth("CENTER_ADMIN");
        renderPortal("admin", "/admin");
        expect(screen.queryByText("PROTECTED_CONTENT")).not.toBeInTheDocument();
        expect(screen.getByText("CENTER_HOME")).toBeInTheDocument();
    });

    it("CENTER_ADMIN cannot open the ministry portal", () => {
        mockAuth("CENTER_ADMIN");
        renderPortal("ministry", "/ministry");
        expect(screen.queryByText("PROTECTED_CONTENT")).not.toBeInTheDocument();
        expect(screen.getByText("CENTER_HOME")).toBeInTheDocument();
    });

    it("MINISTRY cannot open the candidate portal — bounced to /ministry", () => {
        mockAuth("MINISTRY");
        renderPortal("candidate", "/candidate");
        expect(screen.queryByText("PROTECTED_CONTENT")).not.toBeInTheDocument();
        expect(screen.getByText("MINISTRY_HOME")).toBeInTheDocument();
    });

    it("MINISTRY cannot open the center portal", () => {
        mockAuth("MINISTRY");
        renderPortal("center", "/center");
        expect(screen.queryByText("PROTECTED_CONTENT")).not.toBeInTheDocument();
        expect(screen.getByText("MINISTRY_HOME")).toBeInTheDocument();
    });
});

describe("ProtectedRoute — correct role is allowed", () => {
    it("CANDIDATE can open the candidate portal", () => {
        mockAuth("CANDIDATE");
        renderPortal("candidate", "/candidate");
        expect(screen.getByText("PROTECTED_CONTENT")).toBeInTheDocument();
    });

    it("CANDIDATE can open the exam portal", () => {
        mockAuth("CANDIDATE");
        renderPortal("exam", "/training/start");
        expect(screen.getByText("PROTECTED_CONTENT")).toBeInTheDocument();
    });

    it("CENTER_ADMIN can open the center portal", () => {
        mockAuth("CENTER_ADMIN");
        renderPortal("center", "/center");
        expect(screen.getByText("PROTECTED_CONTENT")).toBeInTheDocument();
    });

    it("MINISTRY can open the ministry portal", () => {
        mockAuth("MINISTRY");
        renderPortal("ministry", "/ministry");
        expect(screen.getByText("PROTECTED_CONTENT")).toBeInTheDocument();
    });
});

describe("ProtectedRoute — SUPER_ADMIN is allowed into every portal", () => {
    it.each<["candidate" | "center" | "admin" | "ministry" | "exam", string]>([
        ["candidate", "/candidate"],
        ["center", "/center"],
        ["admin", "/admin"],
        ["ministry", "/ministry"],
        ["exam", "/training/start"],
    ])("SUPER_ADMIN can open the %s portal", (portalType, path) => {
        mockAuth("SUPER_ADMIN");
        renderPortal(portalType, path);
        expect(screen.getByText("PROTECTED_CONTENT")).toBeInTheDocument();
    });
});
