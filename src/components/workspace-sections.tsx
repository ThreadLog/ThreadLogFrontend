import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, ClipboardList, FolderKanban, MessageSquare, Plus, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { actions } from "@/lib/workspace-store";
import { toast } from "sonner";

type Announcement = {
  id: number;
  category: string;
  priority: "low" | "medium" | "high";
  description: string;
  createdAt: string;
};

type LogItem = {
  id: number;
  content: string;
  createdAt: string;
};

type ProjectItem = {
  id: number;
  title: string;
  description: string;
  objective: string;
  keyFeature: string;
  createdAt: string;
};

type TaskItem = {
  id: number;
  title: string;
  objective: string;
  cause: string;
  createdAt: string;
};

const priorityStyles: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-destructive/10 text-destructive",
};

type SectionProps = {
  hideAdd?: boolean;
  scrollable?: boolean;
  scrollHeight?: number;
};

function SectionShell({
  title,
  description,
  icon: Icon,
  onAdd,
  isEmpty,
  emptyLabel,
  emptyHint,
  hideAdd,
  scrollable,
  scrollHeight = 280,
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  onAdd: () => void;
  isEmpty: boolean;
  emptyLabel: string;
  emptyHint: string;
  hideAdd?: boolean;
  scrollable?: boolean;
  scrollHeight?: number;
  children: React.ReactNode;
}) {
  const list = <ul className="divide-y divide-border/60">{children}</ul>;
  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          {!hideAdd && (
            <Button size="icon" variant="ghost" aria-label={`Add ${title}`} onClick={onAdd}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 px-4 py-8 text-center">
            <p className="text-sm font-medium text-foreground">{emptyLabel}</p>
            <p className="mt-1 text-xs text-muted-foreground">{emptyHint}</p>
          </div>
        ) : scrollable ? (
          <ScrollArea style={{ height: scrollHeight }} className="pr-3">
            {list}
          </ScrollArea>
        ) : (
          list
        )}
      </CardContent>
    </Card>
  );
}

export function AnnouncementsSection({ hideAdd, scrollable, scrollHeight }: SectionProps = {}) {
  const [updates, setUpdates] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<string>("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    actions.fetchUpdates().then(setUpdates).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cat = category.trim();
    const desc = description.trim();
    if (!cat) return setError("Category is required.");
    if (!priority) return setError("Select a priority.");
    if (!desc) return setError("Description is required.");
    setSubmitting(true);
    try {
      await actions.addUpdate({ category: cat, priority: priority as "low" | "medium" | "high", description: desc });
      const fresh = await actions.fetchUpdates();
      setUpdates(fresh);
      setCategory(""); setPriority(""); setDescription(""); setError(null); setOpen(false);
      toast.success("Announcement posted!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post announcement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SectionShell
        title="Announcements"
        description="Latest activity across your team."
        icon={Activity}
        onAdd={() => setOpen(true)}
        isEmpty={updates.length === 0 && !loading}
        emptyLabel="No updates yet"
        emptyHint="Team updates will appear here as they're posted."
        hideAdd={hideAdd}
        scrollable={scrollable}
        scrollHeight={scrollHeight}
      >
        {loading ? (
          <li className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></li>
        ) : (
          updates.map((it) => (
            <li key={it.id} className="py-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{it.category}</p>
                <Badge className={priorityStyles[it.priority]} variant="secondary">{it.priority}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{it.description}</p>
            </li>
          ))
        )}
      </SectionShell>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New update</DialogTitle>
            <DialogDescription>Share a recent update with your team.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Design, Engineering" maxLength={60} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v)}>
                <SelectTrigger id="priority"><SelectValue placeholder="Select priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's the update?" rows={4} maxLength={500} />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Posting…" : "Submit"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function LogsSection({ hideAdd, scrollable, scrollHeight }: SectionProps = {}) {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    actions.fetchLogs().then(setLogs).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = content.trim();
    if (!c) return setError("Log can't be empty.");
    setSubmitting(true);
    try {
      await actions.addLog(c);
      const fresh = await actions.fetchLogs();
      setLogs(fresh);
      setContent(""); setError(null); setOpen(false);
      toast.success("Log saved!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save log");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SectionShell
        title="Logs"
        description="Decisions and notes from your workspace."
        icon={MessageSquare}
        onAdd={() => setOpen(true)}
        isEmpty={logs.length === 0 && !loading}
        emptyLabel="No logs yet"
        emptyHint="Start a log to keep your team aligned."
        hideAdd={hideAdd}
        scrollable={scrollable}
        scrollHeight={scrollHeight}
      >
        {loading ? (
          <li className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></li>
        ) : (
          logs.map((it) => (
            <li key={it.id} className="py-3">
              <p className="whitespace-pre-wrap text-sm text-foreground">{it.content}</p>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(it.createdAt).toLocaleString()}</p>
            </li>
          ))
        )}
      </SectionShell>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New log</DialogTitle>
            <DialogDescription>Capture a note or decision.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="log">Log</Label>
              <Textarea id="log" value={content} onChange={(e) => setContent(e.target.value)} placeholder="What happened?" rows={6} maxLength={1000} />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Submit"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ProjectsSection({ hideAdd, scrollable, scrollHeight }: SectionProps = {}) {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objective, setObjective] = useState("");
  const [keyFeature, setKeyFeature] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    actions.fetchProjects().then(setProjects).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim(), d = description.trim(), o = objective.trim(), k = keyFeature.trim();
    if (!t) return setError("Title is required.");
    if (!d) return setError("Description is required.");
    if (!o) return setError("Objective is required.");
    if (!k) return setError("Key feature is required.");
    setSubmitting(true);
    try {
      await actions.addProject({ title: t, description: d, objective: o, keyFeature: k });
      const fresh = await actions.fetchProjects();
      setProjects(fresh);
      setTitle(""); setDescription(""); setObjective(""); setKeyFeature(""); setError(null); setOpen(false);
      toast.success("Project created!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SectionShell
        title="Projects"
        description="Active initiatives in your company."
        icon={FolderKanban}
        onAdd={() => setOpen(true)}
        isEmpty={projects.length === 0 && !loading}
        emptyLabel="No projects yet"
        emptyHint="Create a project to get the team moving."
        hideAdd={hideAdd}
        scrollable={scrollable}
        scrollHeight={scrollHeight}
      >
        {loading ? (
          <li className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></li>
        ) : (
          projects.map((it) => (
            <li key={it.id} className="py-3">
              <p className="text-sm font-medium text-foreground">{it.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{it.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Objective:</span> {it.objective}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Key feature:</span> {it.keyFeature}
              </p>
            </li>
          ))
        )}
      </SectionShell>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
            <DialogDescription>Kick off a new initiative.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="p-title">Title</Label>
              <Input id="p-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" maxLength={80} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-description">Description</Label>
              <Textarea id="p-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this project about?" rows={3} maxLength={500} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-objective">Objective</Label>
              <Textarea id="p-objective" value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="What outcome are you aiming for?" rows={2} maxLength={300} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-key-feature">Key feature</Label>
              <Input id="p-key-feature" value={keyFeature} onChange={(e) => setKeyFeature(e.target.value)} placeholder="The standout feature" maxLength={200} />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Creating…" : "Submit"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function TasksSection({ hideAdd, scrollable, scrollHeight }: SectionProps = {}) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [cause, setCause] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    actions.fetchTasks().then(setTasks).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim(), o = objective.trim(), c = cause.trim();
    if (!t) return setError("Title is required.");
    if (!o) return setError("Objective is required.");
    if (!c) return setError("Cause is required.");
    setSubmitting(true);
    try {
      await actions.addTask({ title: t, objective: o, cause: c });
      const fresh = await actions.fetchTasks();
      setTasks(fresh);
      setTitle(""); setObjective(""); setCause(""); setError(null); setOpen(false);
      toast.success("Task created!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SectionShell
        title="Tasks"
        description="Work assigned to you and your team."
        icon={ClipboardList}
        onAdd={() => setOpen(true)}
        isEmpty={tasks.length === 0 && !loading}
        emptyLabel="No tasks yet"
        emptyHint="New tasks will show up here once created."
        hideAdd={hideAdd}
        scrollable={scrollable}
        scrollHeight={scrollHeight}
      >
        {loading ? (
          <li className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></li>
        ) : (
          tasks.map((it) => (
            <li key={it.id} className="py-3">
              <p className="text-sm font-medium text-foreground">{it.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Objective:</span> {it.objective}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Cause:</span> {it.cause}
              </p>
            </li>
          ))
        )}
      </SectionShell>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New task</DialogTitle>
            <DialogDescription>Add a task and what triggered it.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="t-title">Title</Label>
              <Input id="t-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" maxLength={80} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-objective">Objective</Label>
              <Textarea id="t-objective" value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="What needs to be accomplished?" rows={2} maxLength={300} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-cause">Cause</Label>
              <Textarea id="t-cause" value={cause} onChange={(e) => setCause(e.target.value)} placeholder="What triggered this task? (e.g. an error on a project)" rows={3} maxLength={500} />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Creating…" : "Submit"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
