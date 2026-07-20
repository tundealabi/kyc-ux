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

export type DraftStorage = {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
};

const memoryFallback = new Map<string, string>();

const defaultStorage: DraftStorage = {
  getItem(key) {
    try {
      if (typeof localStorage !== "undefined") {
        return localStorage.getItem(key);
      }
    } catch {
      // ignore
    }
    return memoryFallback.get(key) ?? null;
  },
  setItem(key, value) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, value);
        return;
      }
    } catch {
      // ignore
    }
    memoryFallback.set(key, value);
  },
  removeItem(key) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(key);
        return;
      }
    } catch {
      // ignore
    }
    memoryFallback.delete(key);
  },
};

let storage: DraftStorage = defaultStorage;

/** Call once at app startup (e.g. AsyncStorage on React Native). */
export function configureDraftStorage(next: DraftStorage): void {
  storage = next;
}

const PERSONAL_KEY = "kyc-draft-personal";
const CORPORATE_KEY = "kyc-draft-corporate";
const ACTIVE_KEY = "kyc-active-kind";

function draftKey(kind: DraftKind): string {
  return kind === "personal" ? PERSONAL_KEY : CORPORATE_KEY;
}

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await storage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await storage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode / quota — ignore
  }
}

async function removeKey(key: string): Promise<void> {
  try {
    await storage.removeItem(key);
  } catch {
    // ignore
  }
}

const draftStore = new Map<string, KycDraft>();

export async function saveDraft(
  _sessionId: string,
  draft: KycDraft,
): Promise<void> {
  await delay(50);
  const copy = structuredClone(draft);
  draftStore.set(draft.kind, copy);
  await writeJson(draftKey(draft.kind), copy);
  await writeJson(ACTIVE_KEY, draft.kind);
}

export async function loadDraft(_sessionId: string): Promise<KycDraft | null> {
  await delay(50);
  const active = await readJson<DraftKind>(ACTIVE_KEY);
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

  const stored = await readJson<KycDraft>(draftKey(kind));
  if (!stored || stored.kind !== kind) return null;

  draftStore.set(kind, stored);
  return structuredClone(stored);
}

export async function clearDraft(
  _sessionId: string,
  kind?: DraftKind,
): Promise<void> {
  const active = kind ?? (await readJson<DraftKind>(ACTIVE_KEY));
  if (!active) return;

  draftStore.delete(active);
  await removeKey(draftKey(active));

  const remainingActive = await readJson<DraftKind>(ACTIVE_KEY);
  if (remainingActive === active) {
    await removeKey(ACTIVE_KEY);
  }
}
