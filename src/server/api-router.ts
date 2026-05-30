import { json, AppError, HandlerContext } from "./api/helpers";
import { verifyToken } from "../lib/jwt";

import * as auth from "./api/auth";
import * as jobseekers from "./api/jobseekers";
import * as companyrecruiters from "./api/companyrecruiters";
import * as jobs from "./api/jobs";
import * as applications from "./api/applications";
import * as messages from "./api/messages";
import * as saved from "./api/saved";
import * as support from "./api/support";
import * as workspace from "./api/workspace";

type HandlerFn = (ctx: HandlerContext) => Promise<Response>;

interface Route {
  method: string;
  pattern: string;
  handler: HandlerFn;
}

const routes: Route[] = [
  // Auth
  {
    method: "POST",
    pattern: "/api/auth/registeremployee",
    handler: auth.registerJobSeeker,
  },
  {
    method: "POST",
    pattern: "/api/auth/loginemployee",
    handler: auth.loginJobSeeker,
  },
  {
    method: "POST",
    pattern: "/api/auth/registercompanyrecruiter",
    handler: auth.registerCompanyRecruiter,
  },
  {
    method: "POST",
    pattern: "/api/auth/logincompanyrecruiter",
    handler: auth.loginCompanyRecruiter,
  },
  {
    method: "POST",
    pattern: "/api/auth/registeradmin",
    handler: auth.registerAdmin,
  },
  { method: "POST", pattern: "/api/auth/loginadmin", handler: auth.loginAdmin },
  {
    method: "POST",
    pattern: "/api/auth/loginadminbycode",
    handler: auth.loginAdminByCode,
  },
  {
    method: "GET",
    pattern: "/api/auth/admin-access-code",
    handler: auth.downloadAdminAccessCode,
  },

  // Job Seekers
  {
    method: "GET",
    pattern: "/api/jobseekers",
    handler: jobseekers.getJobSeekers,
  },
  {
    method: "GET",
    pattern: "/api/jobseekers/:id/dashboard",
    handler: jobseekers.getJobSeekerDashboard,
  },
  {
    method: "GET",
    pattern: "/api/jobseekers/:id",
    handler: jobseekers.getJobSeekerById,
  },
  {
    method: "PATCH",
    pattern: "/api/jobseekers/:id",
    handler: jobseekers.updateJobSeekerById,
  },
  {
    method: "DELETE",
    pattern: "/api/jobseekers/:id",
    handler: jobseekers.deleteJobSeekerById,
  },

  // Company Recruiters (note: route has the typo "recruiter" not "recruiter")
  {
    method: "GET",
    pattern: "/api/companyrecruiter",
    handler: companyrecruiters.getCompanyRecruiters,
  },
  {
    method: "GET",
    pattern: "/api/companyrecruiter/:id",
    handler: companyrecruiters.getCompanyRecruiterById,
  },
  {
    method: "PATCH",
    pattern: "/api/companyrecruiter/:id",
    handler: companyrecruiters.updateCompanyRecruiterById,
  },
  {
    method: "DELETE",
    pattern: "/api/companyrecruiter/:id",
    handler: companyrecruiters.deleteCompanyRecruiterById,
  },

  // Jobs
  { method: "GET", pattern: "/api/jobs/job_bank", handler: jobs.getJobBank },
  { method: "GET", pattern: "/api/jobs", handler: jobs.getAllJobs },
  { method: "GET", pattern: "/api/jobs/:id", handler: jobs.getJobById },
  { method: "POST", pattern: "/api/jobs", handler: jobs.createJob },
  {
    method: "PATCH",
    pattern: "/api/jobs/:id/status",
    handler: jobs.changeJobStatus,
  },
  { method: "PATCH", pattern: "/api/jobs/:id", handler: jobs.updateJobById },
  { method: "DELETE", pattern: "/api/jobs/:id", handler: jobs.deleteJobById },

  // Applications
  {
    method: "POST",
    pattern: "/api/applications/job/:jobId",
    handler: applications.applyForJob,
  },
  {
    method: "GET",
    pattern: "/api/applications/job/:jobId",
    handler: applications.getJobApplications,
  },
  {
    method: "PATCH",
    pattern: "/api/applications/:id/status",
    handler: applications.updateApplicationStatus,
  },

  // Messages
  { method: "POST", pattern: "/api/messages", handler: messages.sendMessage },
  {
    method: "GET",
    pattern: "/api/messages/received",
    handler: messages.getAllConversationsList,
  },
  {
    method: "GET",
    pattern: "/api/messages/:otherId",
    handler: messages.getConversation,
  },

  // Saved
  { method: "GET", pattern: "/api/saved/jobs", handler: saved.getSavedJobs },
  { method: "POST", pattern: "/api/saved/jobs/:jobId", handler: saved.saveJob },
  {
    method: "DELETE",
    pattern: "/api/saved/jobs/:jobId",
    handler: saved.unsaveJob,
  },
  {
    method: "GET",
    pattern: "/api/saved/companies",
    handler: saved.getSavedCompanies,
  },
  {
    method: "POST",
    pattern: "/api/saved/companies/:companyId",
    handler: saved.saveCompany,
  },
  {
    method: "DELETE",
    pattern: "/api/saved/companies/:companyId",
    handler: saved.unsaveCompany,
  },

  // Support
  {
    method: "POST",
    pattern: "/api/support",
    handler: support.submitSupportTicket,
  },

  // Workspace
  {
    method: "GET",
    pattern: "/api/workspace/announcements",
    handler: workspace.getAnnouncements,
  },
  {
    method: "POST",
    pattern: "/api/workspace/announcements",
    handler: workspace.createAnnouncement,
  },
  { method: "GET", pattern: "/api/workspace/logs", handler: workspace.getLogs },
  {
    method: "POST",
    pattern: "/api/workspace/logs",
    handler: workspace.createLog,
  },
  {
    method: "GET",
    pattern: "/api/workspace/projects",
    handler: workspace.getProjects,
  },
  {
    method: "POST",
    pattern: "/api/workspace/projects",
    handler: workspace.createProject,
  },
  {
    method: "GET",
    pattern: "/api/workspace/tasks",
    handler: workspace.getTasks,
  },
  {
    method: "POST",
    pattern: "/api/workspace/tasks",
    handler: workspace.createTask,
  },
];

function matchRoute(
  requestMethod: string,
  requestPath: string,
): { handler: HandlerFn; params: Record<string, string> } | null {
  const normalizedPath = requestPath.replace(/\/$/, "") || "/";

  for (const route of routes) {
    if (route.method !== requestMethod) continue;

    const routeParts = route.pattern.split("/");
    const pathParts = normalizedPath.split("/");

    if (routeParts.length !== pathParts.length) continue;

    const params: Record<string, string> = {};
    let matched = true;

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(":")) {
        params[routeParts[i].slice(1)] = pathParts[i];
      } else if (routeParts[i] !== pathParts[i]) {
        matched = false;
        break;
      }
    }

    if (matched) return { handler: route.handler, params };
  }

  return null;
}

function pathToLogString(path: string): string {
  return (
    path.split("/").slice(0, 4).join("/") +
    (path.split("/").length > 4 ? "/..." : "")
  );
}

export async function handleApiRequest(
  request: Request,
): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/") {
    return null;
  }

  if (path === "/health") {
    return json({ status: "ok\u2705", timestamp: new Date().toISOString() });
  }

  if (!path.startsWith("/api/")) {
    return null;
  }

  const match = matchRoute(request.method, path);

  if (!match) {
    return json({ error: `Route not found: ${request.method} ${path}` }, 404);
  }

  let body: any = undefined;
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      body = await request.json();
    } catch {
      body = {};
    }
  }

  const user = extractUser(request);

  const ctx: HandlerContext = {
    body: body ?? {},
    query: url.searchParams,
    params: match.params,
    user,
  };

  try {
    return await match.handler(ctx);
  } catch (error) {
    if (error instanceof AppError) {
      return json(
        { message: error.message, status: error.statusCode },
        error.statusCode,
      );
    }
    console.error(
      `[API Error] ${request.method} ${pathToLogString(path)}:`,
      error,
    );
    return json({ message: "Internal server error" }, 500);
  }
}

function extractUser(
  request: Request,
): { id: number; role: string; companyId: number | null } | null {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  try {
    return verifyToken(header.slice(7));
  } catch {
    return null;
  }
}
