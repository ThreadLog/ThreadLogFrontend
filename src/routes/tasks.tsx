import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TasksSection } from "@/components/workspace-sections";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — ThreadLog" },
      { name: "description", content: "Your team's tasks." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="mb-6 text-3xl font-semibold tracking-tight text-foreground">Tasks</h1>
          <TasksSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
