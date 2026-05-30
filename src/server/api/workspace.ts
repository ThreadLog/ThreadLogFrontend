import { prisma } from "../../lib/prisma";
import type { HandlerContext } from "./helpers";
import { json, requireUser, requireCompany } from "./helpers";

export async function getAnnouncements(ctx: HandlerContext) {
  const user = requireUser(ctx);
  const companyId = requireCompany(user);
  const items = await prisma.announcement.findMany({ where: { companyId }, orderBy: { createdAt: "desc" } });
  return json({ announcements: items });
}

export async function createAnnouncement(ctx: HandlerContext) {
  const user = requireUser(ctx);
  const companyId = requireCompany(user);
  const item = await prisma.announcement.create({ data: { ...ctx.body, companyId } });
  return json({ announcement: item }, 201);
}

export async function getLogs(ctx: HandlerContext) {
  const user = requireUser(ctx);
  const companyId = requireCompany(user);
  const items = await prisma.workspaceLog.findMany({ where: { companyId }, orderBy: { createdAt: "desc" } });
  return json({ logs: items });
}

export async function createLog(ctx: HandlerContext) {
  const user = requireUser(ctx);
  const companyId = requireCompany(user);
  const item = await prisma.workspaceLog.create({ data: { ...ctx.body, companyId } });
  return json({ log: item }, 201);
}

export async function getProjects(ctx: HandlerContext) {
  const user = requireUser(ctx);
  const companyId = requireCompany(user);
  const items = await prisma.workspaceProject.findMany({ where: { companyId }, orderBy: { createdAt: "desc" } });
  return json({ projects: items });
}

export async function createProject(ctx: HandlerContext) {
  const user = requireUser(ctx);
  const companyId = requireCompany(user);
  const item = await prisma.workspaceProject.create({ data: { ...ctx.body, companyId } });
  return json({ project: item }, 201);
}

export async function getTasks(ctx: HandlerContext) {
  const user = requireUser(ctx);
  const companyId = requireCompany(user);
  const items = await prisma.workspaceTask.findMany({ where: { companyId }, orderBy: { createdAt: "desc" } });
  return json({ tasks: items });
}

export async function createTask(ctx: HandlerContext) {
  const user = requireUser(ctx);
  const companyId = requireCompany(user);
  const item = await prisma.workspaceTask.create({ data: { ...ctx.body, companyId } });
  return json({ task: item }, 201);
}
