import { useSyncExternalStore } from "react";

export type UpdateItem = {
  id: string;
  category: string;
  priority: "low" | "medium" | "high";
  description: string;
  createdAt: number;
};
export type LogItem = { id: string; content: string; createdAt: number };
export type ProjectItem = {
  id: string;
  title: string;
  description: string;
  objective: string;
  keyFeature: string;
  createdAt: number;
};
export type TaskItem = {
  id: string;
  title: string;
  objective: string;
  cause: string;
  createdAt: number;
};

type State = {
  updates: UpdateItem[];
  logs: LogItem[];
  projects: ProjectItem[];
  tasks: TaskItem[];
};

const KEY = "threadlog:workspace";
const EMPTY: State = { updates: [], logs: [], projects: [], tasks: [] };

function read(): State {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

let state: State = read();
const listeners = new Set<() => void>();

function write(next: State) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useWorkspace(): State {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => EMPTY,
  );
}

export const actions = {
  addUpdate: (u: Omit<UpdateItem, "id" | "createdAt">) =>
    write({ ...state, updates: [{ ...u, id: crypto.randomUUID(), createdAt: Date.now() }, ...state.updates] }),
  addLog: (content: string) =>
    write({ ...state, logs: [{ id: crypto.randomUUID(), content, createdAt: Date.now() }, ...state.logs] }),
  addProject: (p: Omit<ProjectItem, "id" | "createdAt">) =>
    write({ ...state, projects: [{ ...p, id: crypto.randomUUID(), createdAt: Date.now() }, ...state.projects] }),
  addTask: (t: Omit<TaskItem, "id" | "createdAt">) =>
    write({ ...state, tasks: [{ ...t, id: crypto.randomUUID(), createdAt: Date.now() }, ...state.tasks] }),
};
