import { Prisma } from "@prisma/client";

export function isDbDownError(err: unknown) {
  // P1001 = can't reach DB, P1017 = server closed connection
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return err.code === "P1001" || err.code === "P1017";
  }

  // Sometimes Prisma throws different error types
  if (err instanceof Prisma.PrismaClientInitializationError) return true;
  if (err instanceof Prisma.PrismaClientRustPanicError) return true;

  return false;
}
