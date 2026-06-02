/** In-memory Pro entitlements, replace with Redis/Postgres in production. */
const proUsers = new Set<string>();

export function setUserPro(userId: string, isPro: boolean) {
  if (isPro) proUsers.add(userId);
  else proUsers.delete(userId);
}

export function isUserPro(userId: string): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return proUsers.has(userId);
}

export function seedDevProUsers(ids: string[]) {
  ids.forEach((id) => proUsers.add(id));
}
