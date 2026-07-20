import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearDraft,
  loadDraft,
  loadDraftByKind,
  saveDraft,
  type CorporateDraft,
  type KycDraft,
  type PersonalDraft,
} from "@kyc/api-client";
import type { AddressInput, CacRegistrationType } from "@kyc/validation";

const SESSION_KEY = "kyc-session-id";

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `sess_${crypto.randomUUID()}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

type KycContextValue = {
  sessionId: string;
  draft: KycDraft | null;
  ready: boolean;
  startPersonal: () => Promise<void>;
  startCorporate: () => Promise<void>;
  updatePersonal: (patch: Partial<PersonalDraft>) => Promise<void>;
  updateCorporate: (patch: Partial<CorporateDraft>) => Promise<void>;
  reset: () => Promise<void>;
  summary: {
    accountLabel: string;
    lines: { label: string; value: string }[];
  };
};

const KycContext = createContext<KycContextValue | null>(null);

function maskId(value?: string): string {
  if (!value || value.length < 4) return "—";
  return `${"•".repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
}

export function KycProvider({ children }: { children: ReactNode }) {
  const sessionId = useMemo(() => getSessionId(), []);
  const [draft, setDraft] = useState<KycDraft | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const existing = await loadDraft(sessionId);
      if (!cancelled) {
        setDraft(existing);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const persist = useCallback(
    async (next: KycDraft) => {
      setDraft(next);
      await saveDraft(sessionId, next);
    },
    [sessionId],
  );

  const startPersonal = useCallback(async () => {
    const existing = await loadDraftByKind("personal");
    const next: PersonalDraft = existing ?? {
      kind: "personal",
      step: "overview",
    };
    await persist(next);
  }, [persist]);

  const startCorporate = useCallback(async () => {
    const existing = await loadDraftByKind("corporate");
    const next: CorporateDraft = existing ?? {
      kind: "corporate",
      step: "overview",
    };
    await persist(next);
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
    const kind = draft?.kind;
    await clearDraft(sessionId, kind);
    setDraft(null);
  }, [draft?.kind, sessionId]);

  const summary = useMemo(() => {
    if (!draft) {
      return { accountLabel: "Not started", lines: [] };
    }

    if (draft.kind === "personal") {
      const lines: { label: string; value: string }[] = [];
      if (draft.bvn) lines.push({ label: "BVN", value: maskId(draft.bvn) });
      if (draft.dateOfBirth)
        lines.push({ label: "Date of birth", value: draft.dateOfBirth });
      if (draft.nin) lines.push({ label: "NIN", value: maskId(draft.nin) });
      if (draft.address) {
        lines.push({
          label: "Address",
          value: `${draft.address.street}, ${draft.address.city}`,
        });
      }
      if (draft.faceVerified) lines.push({ label: "Face", value: "Verified" });
      return { accountLabel: "Personal account", lines };
    }

    const lines: { label: string; value: string }[] = [];
    if (draft.cacNumber) {
      const prefix = draft.registrationType === "business_name" ? "BN" : "RC";
      lines.push({
        label: "CAC",
        value: `${prefix} ${draft.cacNumber}`,
      });
    }
    if (draft.bvn)
      lines.push({ label: "Principal BVN", value: maskId(draft.bvn) });
    if (draft.address) {
      lines.push({
        label: "Business address",
        value: `${draft.address.street}, ${draft.address.city}`,
      });
    }
    if (draft.faceVerified) lines.push({ label: "Face", value: "Verified" });
    return { accountLabel: "Corporate account", lines };
  }, [draft]);

  const value: KycContextValue = {
    sessionId,
    draft,
    ready,
    startPersonal,
    startCorporate,
    updatePersonal,
    updateCorporate,
    reset,
    summary,
  };

  return <KycContext.Provider value={value}>{children}</KycContext.Provider>;
}

export function useKyc() {
  const ctx = useContext(KycContext);
  if (!ctx) throw new Error("useKyc must be used within KycProvider");
  return ctx;
}

export type { AddressInput, CacRegistrationType };
