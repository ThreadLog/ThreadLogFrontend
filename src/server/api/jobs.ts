import { prisma } from "../../lib/prisma";
import type { HandlerContext } from "./helpers";
import { json, AppError, requireUser, restrictTo, parseId } from "./helpers";

export async function getAllJobs(ctx: HandlerContext) {
  const search = ctx.query.get("search") || undefined;
  const status = (ctx.query.get("status") as "ACTIVE" | "ARCHIVED") || "ACTIVE";
  const companyId = parseId(ctx.query.get("companyId") || undefined);
  const city = ctx.query.get("city") || undefined;
  const country = ctx.query.get("country") || undefined;
  const category = ctx.query.get("category") || undefined;
  const page = parseInt(ctx.query.get("page") || "1", 10);
  const limit = parseInt(ctx.query.get("limit") || "10", 10);

  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { company: { companyName: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (status) where.status = status;
  if (companyId) where.companyId = companyId;
  if (city) where.city = { equals: city, mode: "insensitive" };
  if (country) where.country = { equals: country, mode: "insensitive" };
  if (category) where.category = { equals: category, mode: "insensitive" };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where, skip: (page - 1) * limit, take: limit,
      select: { id: true, title: true, description: true, webpage_url: true, country: true, city: true, category: true, status: true, expiresAt: true, company: { select: { id: true, companyName: true, email: true, description: true, country: true, logoUrl: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.job.count({ where }),
  ]);

  return json({ jobs, meta: { totalJobs: total, currentPage: page, totalPages: Math.ceil(total / limit) } });
}

export async function getJobById(ctx: HandlerContext) {
  const id = parseId(ctx.params.id);
  if (!id) return json({ message: "Invalid job id" }, 400);

  const job = await prisma.job.findUnique({
    where: { id },
    select: { id: true, title: true, description: true, webpage_url: true, country: true, city: true, category: true, status: true, company: { select: { id: true, companyName: true, email: true, description: true, country: true, logoUrl: true } } },
  });
  if (!job) throw new AppError(`Job with id ${id} not found`, 404);
  return json(job);
}

export async function createJob(ctx: HandlerContext) {
  const user = requireUser(ctx);
  restrictTo(user, "COMPANY_RECRUITER", "ADMIN");
  const data = ctx.body;

  const job = await prisma.job.create({
    data: { companyId: user.id, title: data.title, description: data.description, expiresAt: new Date(data.expiresAt), webpage_url: data.webpage_url, country: data.country, city: data.city, category: data.category },
  });
  return json(job, 201);
}

export async function updateJobById(ctx: HandlerContext) {
  const id = parseId(ctx.params.id);
  if (!id) return json({ message: "Invalid job id" }, 400);
  const user = requireUser(ctx);
  restrictTo(user, "COMPANY_RECRUITER", "ADMIN");

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) throw new AppError("Job not found", 404);
  if (job.companyId !== user.id) throw new AppError("Forbidden", 403);

  const data = ctx.body;
  const updatePayload: any = { ...data };
  if (data.expiresAt) updatePayload.expiresAt = new Date(data.expiresAt);

  const updated = await prisma.job.update({ where: { id }, data: updatePayload });
  return json({ status: "success", data: updated });
}

export async function deleteJobById(ctx: HandlerContext) {
  const id = parseId(ctx.params.id);
  if (!id) return json({ message: "Invalid job id" }, 400);
  const user = requireUser(ctx);
  restrictTo(user, "COMPANY_RECRUITER", "ADMIN");

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) throw new AppError(`Job with id ${id} not found`, 404);
  if (job.companyId !== user.id) throw new AppError("You are not the owner of this job", 403);

  const deleted = await prisma.job.delete({ where: { id } });
  return json({ status: `Job with id ${id} deleted successfully`, deleteJob: deleted });
}

export async function changeJobStatus(ctx: HandlerContext) {
  const id = parseId(ctx.params.id);
  if (!id) return json({ message: "Invalid job id" }, 400);
  const user = requireUser(ctx);
  restrictTo(user, "COMPANY_RECRUITER", "ADMIN");
  const { status } = ctx.body;

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) throw new AppError(`Job with id ${id} not found`, 404);
  if (job.companyId !== user.id) throw new AppError(`Forbidden: You are not the owner of job ${id}`, 403);

  const updated = await prisma.job.update({ where: { id }, data: { status } });
  return json({ status: "success", message: "Job status updated successfully", data: updated });
}

export async function getJobBank(ctx: HandlerContext) {
  const status = ctx.query.get("status") || "ACTIVE";
  const search = ctx.query.get("search") || ctx.query.get("q") || "";
  const page = parseInt(ctx.query.get("page") || "1", 10);
  const limit = parseInt(ctx.query.get("limit") || "100", 10);
  const offset = (page - 1) * limit;

  const url = `https://jobsearch.api.jobtechdev.se/search?offset=${offset}&limit=${limit}&q=${encodeURIComponent(search as string)}${status ? `&status=${encodeURIComponent(status)}` : ""}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new AppError(`Failed to fetch job bank data: ${res.statusText}`, res.status);
    const data = await res.json();

    const mappedJobs = Array.isArray(data.hits) ? data.hits.map((hit: any) => ({
      id: hit.id, title: hit.headline, company: hit.employer?.name || hit.employer?.workplace || "Unknown",
      url: hit.webpage_url, applicationDeadline: hit.application_deadline,
      location: hit.workplace_address?.city || hit.workplace_address?.region || "",
      employmentType: hit.employment_type?.label || null, salaryType: hit.salary_type?.label || null,
      occupation: hit.occupation?.label || null, removed: hit.removed,
    })) : [];

    return json({ total: data.total, positions: data.positions, query_time_in_millis: data.query_time_in_millis, result_time_in_millis: data.result_time_in_millis, hits: mappedJobs });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new AppError(`Error fetching job bank data: ${message}`, 500);
  }
}
