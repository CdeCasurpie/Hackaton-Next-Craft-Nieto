export const PENDING_PROFILE_KEY = "tnc_pending_profile";

export type PendingProfile = {
  fullName: string;
  role: "student" | "mentor";
};

export function readPendingProfile(): PendingProfile | null {
  try {
    const raw = localStorage.getItem(PENDING_PROFILE_KEY);
    return raw ? (JSON.parse(raw) as PendingProfile) : null;
  } catch {
    return null;
  }
}

export function clearPendingProfile() {
  localStorage.removeItem(PENDING_PROFILE_KEY);
}
