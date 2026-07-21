/** Pakistani CNIC: last digit odd = male, even = female (NADRA). */
export function genderFromCnic(cnic?: string | null): "male" | "female" | null {
  const digits = (cnic || "").replace(/\D/g, "");
  if (!digits) return null;
  const last = Number(digits[digits.length - 1]);
  if (Number.isNaN(last)) return null;
  return last % 2 === 1 ? "male" : "female";
}

const FEMALE_TOP =
  "bigHair,bob,bun,curly,curvy,dreads,frida,fro,hijab,longButNotTooLong,miaWallace,shaggy,shaggyMullet,straightAndStrand,straight01,straight02";

const MALE_TOP =
  "shortCurly,shortFlat,shortRound,shortWaved,sides,theCaesar,theCaesarAndSidePart,dreads01,dreads02,frizzle,eyepatch,turban";

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
    options.photoUrl ||
    options.documents?.find((d) => d.type === "photo" && d.fileUrl)?.fileUrl;

  if (uploadedPhoto) return uploadedPhoto;

  const seed = encodeURIComponent(options.seed?.trim() || "candidate");
  const gender = genderFromCnic(options.cnic);
  const base = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

  if (gender === "female") {
    return `${base}&facialHairProbability=0&top=${FEMALE_TOP}`;
  }
  if (gender === "male") {
    return `${base}&facialHairProbability=35&top=${MALE_TOP}`;
  }
  return base;
}
