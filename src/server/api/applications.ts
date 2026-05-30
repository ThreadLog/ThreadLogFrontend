import { prisma } from "../../lib/prisma";
import type { HandlerContext } from "./helpers";
import { json, AppError, requireUser, restrictTo, parseId } from "./helpers";

export async function applyForJob(ctx: HandlerContext) {
  const user = requireUser(ctx);
  restrictTo(user, "JOB_SEEKER");
  const jobId = parseId(ctx.params.jobId);
  if (!jobId) return json({ message: "Invalid job id" }, 400);

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new AppError("Job not found", 404);

  const existing = await prisma.application.findUnique({ where: { jobSeekerId_jobId: { jobSeekerId: user.id, jobId } } });
  if (existing) throw new AppError("You have already applied for this job", 400);

  const application = await prisma.application.create({ data: { jobSeekerId: user.id, jobId, status: "PENDING" } });
  return json({ status: "success", data: application }, 201);
}

export async function getJobApplications(ctx: HandlerContext) {
  const user = requireUser(ctx);
  restrictTo(user, "COMPANY_RECRUITER", "ADMIN");
  const jobId = parseId(ctx.params.jobId);
  if (!jobId) return json({ message: "Invalid job id" }, 400);

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new AppError("Job not found", 404);
  if (job.companyId !== user.id) throw new AppError("Forbidden: You can only view applications for your own jobs", 403);

  const applications = await prisma.application.findMany({
    where: { jobId },
    include: { jobSeeker: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } } },
  });
  return json({ status: "success", data: applications });
}

export async function updateApplicationStatus(ctx: HandlerContext) {
  const user = requireUser(ctx);
  restrictTo(user, "COMPANY_RECRUITER", "ADMIN");
  const applicationId = parseId(ctx.params.id);
  if (!applicationId) return json({ message: "Invalid application id" }, 400);

  const application = await prisma.application.findUnique({ where: { id: applicationId }, include: { job: true } });
  if (!application) throw new AppError("Application not found", 404);
  if (application.job.companyId !== user.id) throw new AppError("Forbidden", 403);

  const updated = await prisma.application.update({ where: { id: applicationId }, data: { status: ctx.body.status } });
  return json({ status: "success", data: updated });
}
