import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  clearDraft,
  configureDraftStorage,
  loadDraft,
  loadDraftByKind,
  saveDraft,
  type CorporateDraft,
  type KycDraft,
  type PersonalDraft,
} from "@kyc/api-client";
import type { AddressInput, CacRegistrationType } from "@kyc/validation";

const SESSION_KEY = "kyc-session-id";

configureDraftStorage({
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
});

async function getSessionId(): Promise<string> {
  let id = await AsyncStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `sess_${Date.now().toString(36)}`;
    await AsyncStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

type SummaryLine = { label: string; value: string; step: string };

type KycContextValue = {
  sessionId: string;
  draft: KycDraft | null;
  ready: boolean;
  startPersonal: () => Promise<void>;
  startCorporate: () => Promise<void>;
  updatePersonal: (patch: Partial<PersonalDraft>) => Promise<void>;
  updateCorporate: (patch: Partial<CorporateDraft>) => Promise<void>;
  reset: () => Promise<void>;
  summary: { accountLabel: string; lines: SummaryLine[] };
};

const KycContext = createContext<KycContextValue | null>(null);

function maskId(value?: string): string {
  if (!value || value.length < 4) return "—";
  return `${"•".repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
}

export function KycProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState("");
  const [draft, setDraft] = useState<KycDraft | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const id = await getSessionId();
      const existing = await loadDraft(id);
      if (!cancelled) {
        setSessionId(id);
        setDraft(existing);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(
    async (next: KycDraft) => {
      setDraft(next);
      await saveDraft(sessionId || "mobile", next);
    },
    [sessionId],
  );

  const startPersonal = useCallback(async () => {
    const existing = await loadDraftByKind("personal");
    await persist(existing ?? { kind: "personal", step: "overview" });
  }, [persist]);

  const startCorporate = useCallback(async () => {
    const existing = await loadDraftByKind("corporate");
    await persist(existing ?? { kind: "corporate", step: "overview" });
  }, [persist]);

  const updatePersonal = useCallback(
    async (patch: Partial<PersonalDraft>) => {
      const existing: PersonalDraft =
        draft?.kind === "personal"
          ? draft
          : ((await loadDraftByKind("personal")) ?? {
              kind: "personal",
              step: "overview",
            });
      await persist({ ...existing, ...patch, kind: "personal" });
    },
    [draft, persist],
  );

  const updateCorporate = useCallback(
    async (patch: Partial<CorporateDraft>) => {
      const existing: CorporateDraft =
        draft?.kind === "corporate"
          ? draft
          : ((await loadDraftByKind("corporate")) ?? {
              kind: "corporate",
              step: "overview",
            });
      await persist({ ...existing, ...patch, kind: "corporate" });
    },
    [draft, persist],
  );

  const reset = useCallback(async () => {
    await clearDraft(sessionId || "mobile", draft?.kind);
    setDraft(null);
  }, [draft?.kind, sessionId]);

  const summary = useMemo(() => {
    if (!draft) {
      return { accountLabel: "Not started", lines: [] as SummaryLine[] };
    }

    if (draft.kind === "personal") {
      const lines: SummaryLine[] = [];
      if (draft.bvn)
        lines.push({ label: "BVN", value: maskId(draft.bvn), step: "bvn" });
      if (draft.dateOfBirth)
        lines.push({
          label: "Date of birth",
          value: draft.dateOfBirth,
          step: "bvn",
        });
      if (draft.nin)
        lines.push({ label: "NIN", value: maskId(draft.nin), step: "nin" });
      if (draft.address) {
        lines.push({
          label: "Address",
          value: `${draft.address.street}, ${draft.address.city}`,
          step: "address",
        });
      }
      if (draft.faceVerified)
        lines.push({ label: "Face", value: "Verified", step: "face-prime" });
      return { accountLabel: "Personal account", lines };
    }

    const lines: SummaryLine[] = [];
    if (draft.cacNumber) {
      const prefix = draft.registrationType === "business_name" ? "BN" : "RC";
      lines.push({
        label: "CAC",
        value: `${prefix} ${draft.cacNumber}`,
        step: "cac",
      });
    }
    if (draft.bvn)
      lines.push({
        label: "Principal BVN",
        value: maskId(draft.bvn),
        step: "principal-bvn",
      });
    if (draft.address) {
      lines.push({
        label: "Business address",
        value: `${draft.address.street}, ${draft.address.city}`,
        step: "address",
      });
    }
    if (draft.faceVerified)
      lines.push({ label: "Face", value: "Verified", step: "face-prime" });
    return { accountLabel: "Corporate account", lines };
  }, [draft]);

  const value = useMemo(
    () => ({
      sessionId,
      draft,
      ready,
      startPersonal,
      startCorporate,
      updatePersonal,
      updateCorporate,
      reset,
      summary,
    }),
    [
      sessionId,
      draft,
      ready,
      startPersonal,
      startCorporate,
      updatePersonal,
      updateCorporate,
      reset,
      summary,
    ],
  );

  return <KycContext.Provider value={value}>{children}</KycContext.Provider>;
}

export function useKyc() {
  const ctx = useContext(KycContext);
  if (!ctx) throw new Error("useKyc must be used within KycProvider");
  return ctx;
}

export type { AddressInput, CacRegistrationType };
