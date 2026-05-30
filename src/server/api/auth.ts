import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { getPrisma } from "../../lib/prisma";
import { signToken } from "../../lib/jwt";
import type { HandlerContext } from "./helpers";
import { json, AppError } from "./helpers";

function generateAdminAccessCode() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

export async function registerJobSeeker(ctx: HandlerContext) {
  const data = ctx.body;
  const existing = await getPrisma().jobSeeker.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError("Job seeker with that email already exists", 409);

  let companyId: number | undefined;
  if (data.adminAccessCode) {
    const company = await getPrisma().companyRecruiter.findFirst({
      where: { adminAccessCode: data.adminAccessCode },
    });
    if (!company) throw new AppError("Invalid company access code", 400);
    companyId = company.id;
  }

  const hashed = await bcrypt.hash(data.password, 12);
  const created = await getPrisma().jobSeeker.create({
    data: { firstName: data.firstName, lastName: data.lastName, email: data.email, password: hashed, companyId },
    select: { id: true, firstName: true, lastName: true, email: true, companyId: true },
  });
  return json({ status: "Job seeker created successfully", jobseeker: created }, 201);
}

export async function loginJobSeeker(ctx: HandlerContext) {
  const data = ctx.body;
  const jobSeeker = await getPrisma().jobSeeker.findUnique({ where: { email: data.email } });
  if (!jobSeeker || !(await bcrypt.compare(data.password, jobSeeker.password))) {
    throw new AppError("Invalid email or password", 401);
  }

  if (jobSeeker.companyId) {
    const company = await getPrisma().companyRecruiter.findUnique({ where: { id: jobSeeker.companyId } });
    if (!company || company.adminAccessCode !== data.adminAccessCode) {
      throw new AppError("Invalid company invite code", 401);
    }
  }

  const token = signToken({ id: jobSeeker.id, email: jobSeeker.email, role: jobSeeker.role, companyId: jobSeeker.companyId });
  const { password, ...rest } = jobSeeker;
  return json({ status: "Job seeker logged in successfully", jobseeker: { ...rest, token } });
}

export async function registerCompanyRecruiter(ctx: HandlerContext) {
  const data = ctx.body;
  const existing = await getPrisma().companyRecruiter.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError("Company recruiter with that email already exists", 409);

  const hashed = await bcrypt.hash(data.password, 12);
  const created = await getPrisma().companyRecruiter.create({
    data: { email: data.email, companyName: data.companyName, password: hashed, organizationNumber: data.organizationNumber, phoneNumber: data.phoneNumber },
    select: { id: true, email: true, companyName: true, organizationNumber: true, phoneNumber: true },
  });
  return json({ status: "Company recruiter created successfully", companyRecruiter: created }, 201);
}

export async function loginCompanyRecruiter(ctx: HandlerContext) {
  const data = ctx.body;
  const recruiter = await getPrisma().companyRecruiter.findUnique({ where: { email: data.email } });
  if (!recruiter || !(await bcrypt.compare(data.password, recruiter.password))) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({ id: recruiter.id, email: recruiter.email, role: recruiter.role, companyId: recruiter.id });
  const { password, ...rest } = recruiter;
  return json({ status: "Company recruiter logged in successfully", companyRecruiter: { ...rest, token } });
}

export async function registerAdmin(ctx: HandlerContext) {
  const data = ctx.body;
  const adminAccessCode = data.adminAccessCode ?? generateAdminAccessCode();
  const existing = await getPrisma().companyRecruiter.findUnique({ where: { email: data.companyEmail } });
  if (existing) throw new AppError("Admin with that email already exists", 409);

  const hashed = await bcrypt.hash(data.password, 12);
  const created = await getPrisma().companyRecruiter.create({
    data: {
      email: data.companyEmail, companyName: data.companyName, password: hashed,
      organizationNumber: data.organizationNumber, phoneNumber: data.companyPhone,
      description: data.description, role: "ADMIN", adminAccessCode,
    },
    select: { id: true, email: true, companyName: true, organizationNumber: true, phoneNumber: true, role: true, adminAccessCode: true },
  });
  return json({ status: "Admin created successfully", admin: created }, 201);
}

export async function loginAdmin(ctx: HandlerContext) {
  const data = ctx.body;
  const admin = await getPrisma().companyRecruiter.findUnique({ where: { email: data.email } });
  if (!admin || admin.role !== "ADMIN" || !(await bcrypt.compare(data.password, admin.password))) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({ id: admin.id, email: admin.email, role: admin.role, companyId: admin.id });
  const { password, ...rest } = admin;
  return json({ status: "Admin logged in successfully", admin: { ...rest, token } });
}

export async function loginAdminByCode(ctx: HandlerContext) {
  const data = ctx.body;
  const admin = await getPrisma().companyRecruiter.findUnique({ where: { email: data.email } });
  if (!admin || admin.role !== "ADMIN" || !admin.adminAccessCode || admin.adminAccessCode !== data.adminAccessCode) {
    throw new AppError("Invalid email or access code", 401);
  }

  const token = signToken({ id: admin.id, email: admin.email, role: admin.role, companyId: admin.id });
  const { password, ...rest } = admin;
  return json({ status: "Admin code accepted successfully", admin: { ...rest, token } });
}

export async function downloadAdminAccessCode(ctx: HandlerContext) {
  const adminId = ctx.user?.id;
  if (!adminId) throw new AppError("Unauthorized", 401);

  const admin = await getPrisma().companyRecruiter.findUnique({
    where: { id: adminId },
    select: { id: true, email: true, companyName: true, role: true, adminAccessCode: true },
  });
  if (!admin || admin.role !== "ADMIN" || !admin.adminAccessCode) {
    throw new AppError("Admin access code not found", 404);
  }

  const content = [
    "Admin Access Code",
    `Company: ${admin.companyName}`,
    `Email: ${admin.email}`,
    `Code: ${admin.adminAccessCode}`,
  ].join("\n");

  return new Response(content, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "content-disposition": `attachment; filename="admin-access-code-${admin.id}.txt"`,
    },
  });
}
