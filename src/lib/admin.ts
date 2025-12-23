// ovibase/src/lib/admin.ts
import type { UserRole } from "@prisma/client";

export function isAdminRole(role: UserRole | null | undefined) {
  return role === "OWNER" || role === "ADMIN";
}
