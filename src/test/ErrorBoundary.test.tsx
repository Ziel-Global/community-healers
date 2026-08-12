import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Link } from "react-router-dom";
import { AppErrorBoundary } from "@/errors/ErrorBoundary";
import { RouteErrorBoundary } from "@/errors/RouteErrorBoundary";

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
    if (shouldThrow) {
        throw new Error("boom");
    }
    return <div>SAFE_CONTENT</div>;
}

// Lets the recovery test flip whether the child throws, to prove "Try Again"
// actually re-renders the children rather than just checking the button exists.
let throwFlag = true;
function ControllableBomb() {
    if (throwFlag) {
        throw new Error("boom");
    }
    return <div>SAFE_CONTENT</div>;
}

beforeEach(() => {
    throwFlag = true;
    // React (and our own onError logger) intentionally log to console.error
    // when a boundary catches — silence it so test output stays readable.
    vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe("AppErrorBoundary", () => {
    it("renders children normally when nothing throws", () => {
        render(
            <AppErrorBoundary>
                <div>SAFE_CONTENT</div>
            </AppErrorBoundary>,
        );
        expect(screen.getByText("SAFE_CONTENT")).toBeInTheDocument();
    });

    it("catches a render crash and shows the fallback instead of blanking the app", () => {
        render(
            <AppErrorBoundary>
                <Bomb shouldThrow />
            </AppErrorBoundary>,
        );
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
        expect(screen.queryByText("SAFE_CONTENT")).not.toBeInTheDocument();
    });

    it("uses the custom fallback title/description when provided", () => {
        render(
            <AppErrorBoundary
                fallbackTitle="Exam-specific title"
                fallbackDescription="Your answers are autosaved."
            >
                <Bomb shouldThrow />
            </AppErrorBoundary>,
        );
        expect(screen.getByText("Exam-specific title")).toBeInTheDocument();
        expect(screen.getByText("Your answers are autosaved.")).toBeInTheDocument();
    });

    it("recovers and renders children again after 'Try Again' once the underlying problem is gone", () => {
        render(
            <AppErrorBoundary>
                <ControllableBomb />
            </AppErrorBoundary>,
        );
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();

        // Simulate the crash condition clearing (e.g. bad state fixed elsewhere),
        // then click "Try Again" to ask the boundary to re-render.
        throwFlag = false;
        fireEvent.click(screen.getByText("Try Again"));

        expect(screen.getByText("SAFE_CONTENT")).toBeInTheDocument();
        expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
    });
});

describe("RouteErrorBoundary", () => {
    it("resets automatically on navigation instead of staying stuck on the fallback", () => {
        render(
            <MemoryRouter initialEntries={["/crash"]}>
                <RouteErrorBoundary>
                    <Routes>
                        <Route path="/crash" element={<Bomb shouldThrow />} />
                        <Route path="/safe" element={<div>SAFE_ROUTE</div>} />
                    </Routes>
                </RouteErrorBoundary>
                <Link to="/safe">go safe</Link>
            </MemoryRouter>,
        );

        expect(screen.getByText("Something went wrong")).toBeInTheDocument();

        fireEvent.click(screen.getByText("go safe"));

        expect(screen.getByText("SAFE_ROUTE")).toBeInTheDocument();
        expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
    });
});
