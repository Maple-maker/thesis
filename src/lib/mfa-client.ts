export async function getMfaStatus(userId: string): Promise<{ enrolled: boolean }> {
  return { enrolled: false };
}
