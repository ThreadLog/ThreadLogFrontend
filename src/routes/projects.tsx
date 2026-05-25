import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProjectsSection } from "@/components/workspace-sections";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — ThreadLog" },
      { name: "description", content: "Active projects in your workspace." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="mb-6 text-3xl font-semibold tracking-tight text-foreground">Projects</h1>
          <ProjectsSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
