import { apiGet, apiPost } from "./api";
import { getSession } from "./auth";

function token() {
  return getSession()?.token ?? "";
}

type Announcement = {
  id: number;
  category: string;
  priority: "low" | "medium" | "high";
  description: string;
  createdAt: string;
};

type Log = {
  id: number;
  content: string;
  createdAt: string;
};

type Project = {
  id: number;
  title: string;
  description: string;
  objective: string;
  keyFeature: string;
  createdAt: string;
};

type Task = {
  id: number;
  title: string;
  objective: string;
  cause: string;
  createdAt: string;
};

export function useWorkspace() {
  return { updates: [] as Announcement[], logs: [] as Log[], projects: [] as Project[], tasks: [] as Task[] };
}

export const actions = {
  async addUpdate(u: { category: string; priority: "low" | "medium" | "high"; description: string }) {
    return apiPost<{ announcement: Announcement }>("/workspace/announcements", u, token());
  },
  async addLog(content: string) {
    return apiPost<{ log: Log }>("/workspace/logs", { content }, token());
  },
  async addProject(p: { title: string; description: string; objective: string; keyFeature: string }) {
    return apiPost<{ project: Project }>("/workspace/projects", p, token());
  },
  async addTask(t: { title: string; objective: string; cause: string }) {
    return apiPost<{ task: Task }>("/workspace/tasks", t, token());
  },
  async fetchUpdates(): Promise<Announcement[]> {
    const res = await apiGet<{ announcements: Announcement[] }>("/workspace/announcements", token());
    return res.announcements;
  },
  async fetchLogs(): Promise<Log[]> {
    const res = await apiGet<{ logs: Log[] }>("/workspace/logs", token());
    return res.logs;
  },
  async fetchProjects(): Promise<Project[]> {
    const res = await apiGet<{ projects: Project[] }>("/workspace/projects", token());
    return res.projects;
  },
  async fetchTasks(): Promise<Task[]> {
    const res = await apiGet<{ tasks: Task[] }>("/workspace/tasks", token());
    return res.tasks;
  },
};
