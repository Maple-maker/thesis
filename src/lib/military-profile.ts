import type { CfoProfile } from "@/types/cfo-profile";

export type MilitaryStatus = "active" | "veteran" | "reserve";

export function militaryStatusFromProfile(
  profile: CfoProfile
): MilitaryStatus | "none" | undefined {
  const raw = profile.extended?.identity?.militaryStatus;
  if (!raw || raw === "none") return "none";
  return raw;
}

export function hasMilitaryAffiliation(profile: CfoProfile): boolean {
  const s = militaryStatusFromProfile(profile);
  return s === "active" || s === "veteran" || s === "reserve";
}

export function militaryStatusLabel(status: MilitaryStatus): string {
  switch (status) {
    case "active":
      return "Active duty";
    case "veteran":
      return "Veteran";
    case "reserve":
      return "Reserve / Guard";
  }
}
