import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { candidateService } from "@/services/candidateService";
import { ProfileView } from "./ProfileView";

vi.mock("@/services/candidateService", () => ({
  candidateService: { getMe: vi.fn() },
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ examScheduleInfo: null }),
}));

const candidate = {
  user: {
    id: "candidate-1",
    firstName: "Test",
    lastName: "Candidate",
    email: "candidate@example.com",
    phoneNumber: "03001234567",
    role: "CANDIDATE",
    status: "ACTIVE",
  },
  userId: "candidate-1",
  cnic: "",
  fatherName: "",
  dob: "",
  city: null,
  address: "",
  has16YearsEducation: false,
  certificateIssued: false,
  createdAt: "",
  updatedAt: "",
  documents: [],
};

describe("ProfileView language changes", () => {
  beforeEach(async () => {
    vi.mocked(candidateService.getMe).mockResolvedValue(candidate);
    await i18n.changeLanguage("en");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("translates document labels without refetching authenticated data", async () => {
    render(<ProfileView />);

    expect(await screen.findByText("Candidate Photo")).toBeInTheDocument();
    await waitFor(() => expect(candidateService.getMe).toHaveBeenCalledTimes(1));

    await act(async () => {
      await i18n.changeLanguage("ur");
    });
    expect(await screen.findByText("امیدوار کی تصویر")).toBeInTheDocument();

    await act(async () => {
      await i18n.changeLanguage("en");
    });
    expect(await screen.findByText("Candidate Photo")).toBeInTheDocument();
    expect(candidateService.getMe).toHaveBeenCalledTimes(1);
  });
});
