import type { AddressInput, CacRegistrationType } from "@kyc/validation";

export type VerifyResult =
  | { ok: true; reference: string }
  | { ok: false; code: string; message: string };

function delay(ms = 700): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function reference(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}`;
}

/** Stub: replace with Smile ID / Dojah / VerifyMe later */
export async function verifyFace(_photo: Blob | string): Promise<VerifyResult> {
  await delay();
  // Simulate occasional failure for retry UX in demos
  if (Math.random() < 0.15) {
    return {
      ok: false,
      code: "FACE_MATCH_FAILED",
      message: "We couldn't verify your face — try again with better lighting",
    };
  }
  return { ok: true, reference: reference("face") };
}

export async function verifyBvn(input: {
  bvn: string;
  dateOfBirth: string;
}): Promise<VerifyResult> {
  await delay();
  if (!/^\d{11}$/.test(input.bvn)) {
    return {
      ok: false,
      code: "INVALID_BVN",
      message: "BVN could not be verified",
    };
  }
  return { ok: true, reference: reference("bvn") };
}

export async function verifyNin(input: {
  nin: string;
  bvn: string;
}): Promise<VerifyResult> {
  await delay();
  if (!/^\d{11}$/.test(input.nin)) {
    return {
      ok: false,
      code: "INVALID_NIN",
      message: "NIN could not be verified",
    };
  }
  // Stub: always "matches" BVN when both are 11 digits
  return { ok: true, reference: reference("nin") };
}

export async function verifyCac(input: {
  registrationType: CacRegistrationType;
  cacNumber: string;
}): Promise<VerifyResult> {
  await delay();
  if (!input.cacNumber.trim()) {
    return {
      ok: false,
      code: "INVALID_CAC",
      message: "CAC registration could not be verified",
    };
  }
  return { ok: true, reference: reference("cac") };
}

export async function saveAddress(
  address: AddressInput,
): Promise<VerifyResult> {
  await delay(400);
  if (!address.street || !address.city || !address.state) {
    return {
      ok: false,
      code: "INVALID_ADDRESS",
      message: "Address is incomplete",
    };
  }
  return { ok: true, reference: reference("addr") };
}

export type DraftKind = "personal" | "corporate";

export type PersonalDraft = {
  kind: "personal";
  step: "overview" | "bvn" | "nin" | "address" | "face-prime" | "face" | "done";
  bvn?: string;
  dateOfBirth?: string;
  nin?: string;
  address?: AddressInput;
  faceVerified?: boolean;
};

export type CorporateDraft = {
  kind: "corporate";
  step:
    | "overview"
    | "cac"
    | "principal-bvn"
    | "address"
    | "face-prime"
    | "face"
    | "done";
  registrationType?: CacRegistrationType;
  cacNumber?: string;
  bvn?: string;
  dateOfBirth?: string;
  address?: AddressInput;
  faceVerified?: boolean;
};

export type KycDraft = PersonalDraft | CorporateDraft;

const PERSONAL_KEY = "kyc-draft-personal";
const CORPORATE_KEY = "kyc-draft-corporate";
const ACTIVE_KEY = "kyc-active-kind";

function draftKey(kind: DraftKind): string {
  return kind === "personal" ? PERSONAL_KEY : CORPORATE_KEY;
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode / quota — ignore
  }
}

function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/** In-memory cache + localStorage so drafts survive refresh */
const draftStore = new Map<string, KycDraft>();

export async function saveDraft(
  _sessionId: string,
  draft: KycDraft,
): Promise<void> {
  await delay(50);
  const copy = structuredClone(draft);
  draftStore.set(draft.kind, copy);
  writeJson(draftKey(draft.kind), copy);
  writeJson(ACTIVE_KEY, draft.kind);
}

export async function loadDraft(_sessionId: string): Promise<KycDraft | null> {
  await delay(50);
  const active = readJson<DraftKind>(ACTIVE_KEY);
  if (!active) return null;
  if (active === "personal") return loadDraftByKind("personal");
  return loadDraftByKind("corporate");
}

export async function loadDraftByKind(
  kind: "personal",
): Promise<PersonalDraft | null>;
export async function loadDraftByKind(
  kind: "corporate",
): Promise<CorporateDraft | null>;
export async function loadDraftByKind(
  kind: DraftKind,
): Promise<KycDraft | null> {
  const cached = draftStore.get(kind);
  if (cached && cached.kind === kind) return structuredClone(cached);

  const stored = readJson<KycDraft>(draftKey(kind));
  if (!stored || stored.kind !== kind) return null;

  draftStore.set(kind, stored);
  return structuredClone(stored);
}

export async function clearDraft(
  _sessionId: string,
  kind?: DraftKind,
): Promise<void> {
  const active = kind ?? readJson<DraftKind>(ACTIVE_KEY);
  if (!active) return;

  draftStore.delete(active);
  removeKey(draftKey(active));

  const remainingActive = readJson<DraftKind>(ACTIVE_KEY);
  if (remainingActive === active) {
    removeKey(ACTIVE_KEY);
  }
}
