export interface HandlerContext {
  body: any;
  query: URLSearchParams;
  params: Record<string, string>;
  user: { id: number; role: string; companyId: number | null } | null;
}

export function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export function parseId(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function requireUser(ctx: HandlerContext): { id: number; role: string; companyId: number | null } {
  if (!ctx.user) throw new AppError("Unauthorized", 401);
  return ctx.user;
}

export function restrictTo(user: { role: string } | null, ...roles: string[]): void {
  if (!user || !roles.includes(user.role)) {
    throw new AppError("Forbidden, you do not have the required permissions", 403);
  }
}

export function requireCompany(user: { companyId: number | null } | null): number {
  if (!user?.companyId) throw new AppError("You must belong to a company to use workspace features", 403);
  return user.companyId;
}

export function requireOwnershipOrAdmin(user: { id: number; role: string } | null, targetId: number): void {
  if (!user) throw new AppError("Unauthorized", 401);
  if (user.id !== targetId && user.role !== "ADMIN") {
    throw new AppError("Forbidden: You can only access your own data", 403);
  }
}

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
  }
}
