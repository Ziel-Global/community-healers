/** Pakistani CNIC: last digit odd = male, even = female (NADRA). */
export function genderFromCnic(cnic?: string | null): "male" | "female" | null {
  const digits = (cnic || "").replace(/\D/g, "");
  if (!digits) return null;
  const last = Number(digits[digits.length - 1]);
  if (Number.isNaN(last)) return null;
  return last % 2 === 1 ? "male" : "female";
}

const FEMALE_TOPS = [
  "bigHair",
  "bob",
  "bun",
  "curly",
  "curvy",
  "dreads",
  "frida",
  "fro",
  "hijab",
  "longButNotTooLong",
  "miaWallace",
  "shaggy",
  "shaggyMullet",
  "straightAndStrand",
  "straight01",
  "straight02",
];

const MALE_TOPS = [
  "shortCurly",
  "shortFlat",
  "shortRound",
  "shortWaved",
  "sides",
  "theCaesar",
  "theCaesarAndSidePart",
  "dreads01",
  "dreads02",
  "frizzle",
  "turban",
];

const API_URL = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

function resolveUploadedPhotoUrl(url?: string | null): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  if (/^(https?:|data:)/i.test(trimmed)) {
    return trimmed;
  }

  if (!API_URL) return trimmed;
  return `${API_URL}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

function buildDiceBearUrl(seed: string, cnic?: string | null): string {
  const params = new URLSearchParams();
  params.set("seed", seed);

  const gender = genderFromCnic(cnic);
  const tops =
    gender === "female" ? FEMALE_TOPS : gender === "male" ? MALE_TOPS : null;

  if (gender === "female") {
    params.set("facialHairProbability", "0");
  } else if (gender === "male") {
    params.set("facialHairProbability", "35");
  }

  tops?.forEach((top) => params.append("top[]", top));

  return `https://api.dicebear.com/7.x/avataaars/svg?${params.toString()}`;
}

/**
 * Prefer uploaded candidate photo; otherwise DiceBear avatar matched to CNIC gender.
 */
export function getCandidateAvatarUrl(options: {
  seed?: string | null;
  cnic?: string | null;
  photoUrl?: string | null;
  documents?: Array<{ type?: string; fileUrl?: string | null }> | null;
}): string {
  const uploadedPhoto =
    resolveUploadedPhotoUrl(options.photoUrl) ||
    resolveUploadedPhotoUrl(
      options.documents?.find((d) => d.type === "photo" && d.fileUrl)?.fileUrl,
    );

  if (uploadedPhoto) return uploadedPhoto;

  const seed = (options.seed?.trim() || "candidate").slice(0, 64);
  return buildDiceBearUrl(seed, options.cnic);
}
