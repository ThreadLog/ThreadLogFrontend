import { getPrisma } from "../../lib/prisma";
import type { HandlerContext } from "./helpers";
import { json, AppError, requireUser, restrictTo, parseId } from "./helpers";

export async function getSavedJobs(ctx: HandlerContext) {
  const user = requireUser(ctx);
  restrictTo(user, "JOB_SEEKER");
  const saved = await getPrisma().savedJob.findMany({
    where: { jobSeekerId: user.id },
    include: { job: { include: { company: { select: { companyName: true, logoUrl: true } } } } },
    orderBy: { savedAt: "desc" },
  });
  return json({ status: "success", data: saved });
}

export async function saveJob(ctx: HandlerContext) {
  const user = requireUser(ctx);
  restrictTo(user, "JOB_SEEKER");
  const jobId = parseId(ctx.params.jobId);
  if (!jobId) return json({ message: "Invalid job id" }, 400);

  const job = await getPrisma().job.findUnique({ where: { id: jobId } });
  if (!job) throw new AppError("Job not found", 404);

  const existing = await getPrisma().savedJob.findUnique({ where: { jobSeekerId_jobId: { jobSeekerId: user.id, jobId } } });
  if (existing) throw new AppError("You have already saved this job", 400);

  await getPrisma().savedJob.create({ data: { jobSeekerId: user.id, jobId } });
  return json({ status: "success", message: "Job saved successfully" }, 201);
}

export async function unsaveJob(ctx: HandlerContext) {
  const user = requireUser(ctx);
  restrictTo(user, "JOB_SEEKER");
  const jobId = parseId(ctx.params.jobId);
  if (!jobId) return json({ message: "Invalid job id" }, 400);

  const existing = await getPrisma().savedJob.findUnique({ where: { jobSeekerId_jobId: { jobSeekerId: user.id, jobId } } });
  if (!existing) throw new AppError("This job is not saved", 404);

  await getPrisma().savedJob.delete({ where: { jobSeekerId_jobId: { jobSeekerId: user.id, jobId } } });
  return json({ status: "success", message: "Job removed from saved" });
}

export async function getSavedCompanies(ctx: HandlerContext) {
  const user = requireUser(ctx);
  restrictTo(user, "JOB_SEEKER");
  const saved = await getPrisma().savedCompany.findMany({
    where: { jobSeekerId: user.id },
    include: { company: { select: { id: true, companyName: true, description: true, logoUrl: true } } },
    orderBy: { savedAt: "desc" },
  });
  return json({ status: "success", data: saved });
}

export async function saveCompany(ctx: HandlerContext) {
  const user = requireUser(ctx);
  restrictTo(user, "JOB_SEEKER");
  const companyId = parseId(ctx.params.companyId);
  if (!companyId) return json({ message: "Invalid company id" }, 400);

  const company = await getPrisma().companyRecruiter.findUnique({ where: { id: companyId } });
  if (!company) throw new AppError("Company not found", 404);

  const existing = await getPrisma().savedCompany.findUnique({ where: { jobSeekerId_companyId: { jobSeekerId: user.id, companyId } } });
  if (existing) throw new AppError("You have already saved this company", 400);

  await getPrisma().savedCompany.create({ data: { jobSeekerId: user.id, companyId } });
  return json({ status: "success", message: "Company saved successfully" }, 201);
}

export async function unsaveCompany(ctx: HandlerContext) {
  const user = requireUser(ctx);
  restrictTo(user, "JOB_SEEKER");
  const companyId = parseId(ctx.params.companyId);
  if (!companyId) return json({ message: "Invalid company id" }, 400);

  const existing = await getPrisma().savedCompany.findUnique({ where: { jobSeekerId_companyId: { jobSeekerId: user.id, companyId } } });
  if (!existing) throw new AppError("This company is not saved", 404);

  await getPrisma().savedCompany.delete({ where: { jobSeekerId_companyId: { jobSeekerId: user.id, companyId } } });
  return json({ status: "success", message: "Company removed from saved" });
}
