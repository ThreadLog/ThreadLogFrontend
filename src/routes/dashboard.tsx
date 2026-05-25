import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  AnnouncementsSection,
  LogsSection,
  ProjectsSection,
  TasksSection,
} from "@/components/workspace-sections";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ThreadLog" },
      { name: "description", content: "Your ThreadLog workspace overview." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Welcome back</h1>
            <p className="mt-1 text-muted-foreground">
              Here's what's happening across your workspace.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <AnnouncementsSection hideAdd scrollable />
            <LogsSection hideAdd scrollable />
            <TasksSection hideAdd scrollable />
            <ProjectsSection hideAdd scrollable />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
