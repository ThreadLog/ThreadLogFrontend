import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import type { HandlerContext } from "./helpers";
import { json, AppError, requireUser, requireOwnershipOrAdmin, parseId } from "./helpers";

export async function getCompanyRecruiters(ctx: HandlerContext) {
  const search = ctx.query.get("search") || undefined;
  const city = ctx.query.get("city") || undefined;
  const country = ctx.query.get("country") || undefined;
  const industry = ctx.query.get("industry") || undefined;
  const page = parseInt(ctx.query.get("page") || "1", 10);
  const limit = parseInt(ctx.query.get("limit") || "10", 10);

  const where: any = {};
  if (search) {
    where.OR = [
      { companyName: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (city) where.city = { equals: city, mode: "insensitive" };
  if (country) where.country = { equals: country, mode: "insensitive" };
  if (industry) where.industry = { equals: industry, mode: "insensitive" };

  const [records, total] = await Promise.all([
    prisma.companyRecruiter.findMany({
      where, skip: (page - 1) * limit, take: limit,
      select: { id: true, companyName: true, email: true, phoneNumber: true, description: true, country: true, city: true, industry: true, logoUrl: true, _count: { select: { jobs: { where: { status: "ACTIVE" } } } } },
    }),
    prisma.companyRecruiter.count({ where }),
  ]);

  return json({ status: "success", data: { companyRecruiters: records, meta: { totalCompanyRecruiters: total, currentPage: page, totalPages: Math.ceil(total / limit) } } });
}

export async function getCompanyRecruiterById(ctx: HandlerContext) {
  const id = parseId(ctx.params.id);
  if (!id) return json({ message: "Invalid company recruiter id" }, 400);

  const record = await prisma.companyRecruiter.findUnique({
    where: { id },
    select: { id: true, companyName: true, email: true, phoneNumber: true, description: true, organizationNumber: true, logoUrl: true, city: true, country: true, industry: true, adminAccessCode: true, _count: { select: { jobs: { where: { status: "ACTIVE" } } } } },
  });
  if (!record) throw new AppError(`Company recruiter with id ${id} not found`, 404);

  return json({ status: "success", data: record });
}

export async function updateCompanyRecruiterById(ctx: HandlerContext) {
  const id = parseId(ctx.params.id);
  if (!id) return json({ message: "Invalid company recruiter id" }, 400);
  const user = requireUser(ctx);
  requireOwnershipOrAdmin(user, id);

  const data = ctx.body;
  const hashed = data.password ? await bcrypt.hash(data.password, 12) : undefined;

  const updated = await prisma.companyRecruiter.update({
    where: { id },
    data: { companyName: data.companyName, email: data.email, phoneNumber: data.phoneNumber, password: hashed, description: data.description, organizationNumber: data.organizationNumber, logoUrl: data.logoUrl, city: data.city, country: data.country, industry: data.industry },
    select: { id: true, companyName: true, email: true, phoneNumber: true, description: true, organizationNumber: true, logoUrl: true, city: true, country: true, industry: true },
  });

  return json({ status: "success", data: updated });
}

export async function deleteCompanyRecruiterById(ctx: HandlerContext) {
  const id = parseId(ctx.params.id);
  if (!id) return json({ message: "Invalid company recruiter id" }, 400);
  const user = requireUser(ctx);
  requireOwnershipOrAdmin(user, id);

  const existing = await prisma.companyRecruiter.findUnique({ where: { id } });
  if (!existing) return json({ message: `Company recruiter with id ${id} not found` }, 404);

  const deleted = await prisma.companyRecruiter.delete({ where: { id }, select: { id: true, companyName: true, email: true, phoneNumber: true, description: true, organizationNumber: true, logoUrl: true, city: true, country: true, industry: true } });
  return json({ status: "success", data: deleted });
}
