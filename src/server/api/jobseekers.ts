import bcrypt from "bcrypt";
import { getPrisma } from "../../lib/prisma";
import type { HandlerContext } from "./helpers";
import { json, AppError, requireUser, requireOwnershipOrAdmin, parseId } from "./helpers";

export async function getJobSeekers(ctx: HandlerContext) {
  const search = ctx.query.get("search") || undefined;
  const city = ctx.query.get("city") || undefined;
  const skills = ctx.query.get("skills") || undefined;
  const page = parseInt(ctx.query.get("page") || "1", 10);
  const limit = parseInt(ctx.query.get("limit") || "10", 10);

  const where: any = {};
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { bio: { contains: search, mode: "insensitive" } },
    ];
  }
  if (city) where.city = { equals: city, mode: "insensitive" };
  if (skills) where.skills = { has: skills };

  const [jobSeekers, total] = await Promise.all([
    getPrisma().jobSeeker.findMany({
      where,
      skip: (page - 1) * limit, take: limit,
      select: { id: true, firstName: true, lastName: true, profilePicture: true, city: true, languages: true, skills: true, bio: true, portfolioLink: true },
    }),
    getPrisma().jobSeeker.count({ where }),
  ]);

  return json({ jobSeekers, meta: { totalJobSeekers: total, currentPage: page, totalPages: Math.ceil(total / limit) } });
}

export async function getJobSeekerById(ctx: HandlerContext) {
  const id = parseId(ctx.params.id);
  if (!id) return json({ message: "Invalid job seeker id" }, 400);

  const js = await getPrisma().jobSeeker.findUnique({
    where: { id },
    select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true, city: true, country: true, languages: true, skills: true, bio: true, portfolioLink: true, personalStatement: true, profilePicture: true, cv: true, company: { select: { adminAccessCode: true, companyName: true } } },
  });
  if (!js) throw new AppError(`Job seeker with id ${id} not found`, 404);

  let cvBase64: string | null = null;
  if (js.cv) cvBase64 = `data:application/pdf;base64,${Buffer.from(js.cv).toString("base64")}`;
  return json({ ...js, cv: cvBase64 });
}

export async function updateJobSeekerById(ctx: HandlerContext) {
  const id = parseId(ctx.params.id);
  if (!id) return json({ message: "Invalid job seeker id" }, 400);
  const user = requireUser(ctx);
  requireOwnershipOrAdmin(user, id);

  const data = ctx.body;
  const cvBuffer = data.cv ? Buffer.from(data.cv.split(",")[1] || data.cv, "base64") : undefined;
  const hashed = data.password ? await bcrypt.hash(data.password, 12) : undefined;

  const updated = await getPrisma().jobSeeker.update({
    where: { id },
    data: {
      firstName: data.firstName, lastName: data.lastName, email: data.email,
      password: hashed, cv: cvBuffer, personalStatement: data.personalStatement,
      phoneNumber: data.phoneNumber, city: data.city, country: data.country,
      bio: data.bio, portfolioLink: data.portfolioLink,
      languages: data.languages, skills: data.skills,
      profilePicture: data.profilePicture ? Buffer.from(data.profilePicture.split(",")[1] || data.profilePicture, "base64") : undefined,
    },
  });

  return json({ status: `Job seeker with id ${id} updated successfully`, jobseeker: updated });
}

export async function deleteJobSeekerById(ctx: HandlerContext) {
  const id = parseId(ctx.params.id);
  if (!id) return json({ message: "Invalid job seeker id" }, 400);
  const user = requireUser(ctx);
  requireOwnershipOrAdmin(user, id);

  const deleted = await getPrisma().jobSeeker.delete({ where: { id }, select: { id: true, firstName: true, lastName: true, email: true } });
  return json({ status: `Job seeker with id ${id} deleted successfully`, jobseeker: deleted });
}

export async function getJobSeekerDashboard(ctx: HandlerContext) {
  const id = parseId(ctx.params.id);
  if (!id) return json({ message: "Invalid job seeker id" }, 400);
  const user = requireUser(ctx);
  requireOwnershipOrAdmin(user, id);

  const js = await getPrisma().jobSeeker.findUnique({
    where: { id },
    select: { id: true, firstName: true, lastName: true, email: true, accountCompletionRate: true, _count: { select: { applications: true, savedJobs: true } } },
  });
  if (!js) throw new AppError(`Job seeker with id ${id} not found`, 404);

  return json({
    status: "Dashboard data retrieved successfully",
    data: {
      jobseekerId: js.id, firstName: js.firstName, lastName: js.lastName, email: js.email,
      profileStatus: { completionRate: js.accountCompletionRate, isProfileComplete: js.accountCompletionRate === 100 },
      statistics: { applicationsCount: js._count.applications, savedJobsCount: js._count.savedJobs },
    },
  });
}
