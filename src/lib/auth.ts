import { apiPost } from "./api";

const SESSION_KEY = "threadlog:session";

export type Session = {
  token: string;
  email: string;
  role: "employee" | "admin" | "recruiter";
  name: string;
  id: number;
  companyId: number | null;
};

/* ---------- Response shapes ---------- */

type LoginEmployeeRes = {
  status: string;
  jobseeker: { id: number; email: string; firstName: string; lastName: string; role: string; token: string; companyId: number | null };
};

type LoginAdminRes = {
  status: string;
  admin: { id: number; email: string; companyName: string; role: string; token: string };
};

type LoginCompanyRecruiterRes = {
  status: string;
  companyRecruiter: { id: number; email: string; companyName: string; role: string; token: string };
};

type RegisterEmployeeRes = {
  status: string;
  jobseeker: { id: number; firstName: string; lastName: string; email: string; companyId: number | null };
};

type RegisterAdminRes = {
  status: string;
  admin: { id: number; email: string; companyName: string; role: string; adminAccessCode?: string };
};

/* ---------- Session helpers ---------- */

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function setSession(session: Session) {
  const s = safeStorage();
  if (s) s.setItem(SESSION_KEY, JSON.stringify(session));
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
  if (s) s.removeItem(SESSION_KEY);
}

/* ---------- Auth API calls ---------- */

export async function registerEmployee(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  adminAccessCode?: string;
}) {
  return apiPost<RegisterEmployeeRes>("/auth/registeremployee", input);
}

export async function registerAdmin(input: {
  companyName: string;
  organizationNumber: string;
  description: string;
  companyPhone: string;
  companyEmail: string;
  password: string;
}) {
  return apiPost<RegisterAdminRes>("/auth/registeradmin", {
    companyName: input.companyName,
    organizationNumber: input.organizationNumber,
    description: input.description,
    companyPhone: input.companyPhone,
    companyEmail: input.companyEmail,
    password: input.password,
  });
}

export async function loginEmployee(email: string, password: string, adminAccessCode?: string): Promise<Session> {
  const data = await apiPost<LoginEmployeeRes>("/auth/loginemployee", { email, password, adminAccessCode });
  const j = data.jobseeker;
  const session: Session = {
    token: j.token,
    email: j.email,
    role: "employee",
    name: `${j.firstName} ${j.lastName}`,
    id: j.id,
    companyId: j.companyId ?? null,
  };
  setSession(session);
  return session;
}

export async function loginAdmin(email: string, password: string): Promise<Session> {
  const data = await apiPost<LoginAdminRes>("/auth/loginadmin", { email, password });
  const a = data.admin;
  const session: Session = {
    token: a.token,
    email: a.email,
    role: "admin",
    name: a.companyName,
    id: a.id,
    companyId: a.id,
  };
  setSession(session);
  return session;
}

export async function loginCompanyRecruiter(email: string, password: string): Promise<Session> {
  const data = await apiPost<LoginCompanyRecruiterRes>("/auth/logincompanyrecruiter", { email, password });
  const c = data.companyRecruiter;
  const session: Session = {
    token: c.token,
    email: c.email,
    role: "recruiter",
    name: c.companyName,
    id: c.id,
    companyId: c.id,
  };
  setSession(session);
  return session;
}

export async function login(email: string, password: string, adminAccessCode?: string): Promise<Session> {
  const errors: string[] = [];
  for (const attempt of [loginEmployee, loginAdmin, loginCompanyRecruiter]) {
    try {
      return await attempt(email, password, adminAccessCode);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Unknown error");
    }
  }
  throw new Error(errors[0] || "Could not log in. Check your credentials.");
}
