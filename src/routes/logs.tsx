import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LogsSection } from "@/components/workspace-sections";

export const Route = createFileRoute("/logs")({
  head: () => ({
    meta: [
      { title: "Logs — ThreadLog" },
      { name: "description", content: "Workspace logs and notes." },
    ],
  }),
  component: LogsPage,
});

function LogsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="mb-6 text-3xl font-semibold tracking-tight text-foreground">Logs</h1>
          <LogsSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
