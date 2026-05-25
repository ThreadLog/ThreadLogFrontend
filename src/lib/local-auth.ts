// Temporary localStorage-backed auth so the UI is testable without a real backend.
// Swap this for real server calls later — the API surface is intentionally small.

export type EmployeeUser = {
  role: "employee";
  companyName: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  companyCode: string;
  createdAt: string;
};

export type AdminUser = {
  role: "admin";
  companyName: string;
  organizationNumber: string;
  description: string;
  companyPhone: string;
  companyEmail: string;
  email: string; // mirror of companyEmail for login lookup
  password: string;
  createdAt: string;
};

export type StoredUser = EmployeeUser | AdminUser;

const USERS_KEY = "threadlog:users";
const SESSION_KEY = "threadlog:session";

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readUsers(): StoredUser[] {
  const s = safeStorage();
  if (!s) return [];
  try {
    const raw = s.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  const s = safeStorage();
  if (!s) return;
  s.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const target = email.trim().toLowerCase();
  return readUsers().find((u) => u.email.toLowerCase() === target);
}

export function registerEmployeeLocal(input: Omit<EmployeeUser, "createdAt" | "role">): { ok: true } {
  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("An account with this email already exists.");
  }
  users.push({ role: "employee", ...input, createdAt: new Date().toISOString() });
  writeUsers(users);
  setSession({ email: input.email, role: "employee", name: input.fullName });
  return { ok: true };
}

export function registerAdminLocal(input: Omit<AdminUser, "createdAt" | "role" | "email">): { ok: true } {
  const users = readUsers();
  const email = input.companyEmail;
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("An account with this company email already exists.");
  }
  users.push({ role: "admin", email, ...input, createdAt: new Date().toISOString() });
  writeUsers(users);
  setSession({ email, role: "admin", name: input.companyName });
  return { ok: true };
}

export function loginLocal(email: string, password: string): { ok: true; role: "employee" | "admin" } {
  const user = findUserByEmail(email);
  if (!user) throw new Error("No account found with that email.");
  if (user.password !== password) throw new Error("Incorrect password.");
  setSession({
    email: user.email,
    role: user.role,
    name: user.role === "employee" ? user.fullName : user.companyName,
  });
  return { ok: true, role: user.role };
}

export type Session = { email: string; role: "employee" | "admin"; name: string };

export function setSession(session: Session) {
  const s = safeStorage();
  if (!s) return;
  s.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): Session | null {
  const s = safeStorage();
  if (!s) return null;
  try {
    const raw = s.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  const s = safeStorage();
  if (!s) return;
  s.removeItem(SESSION_KEY);
}
