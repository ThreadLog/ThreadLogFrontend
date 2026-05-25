import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AnnouncementsSection } from "@/components/workspace-sections";

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements — ThreadLog" },
      { name: "description", content: "Team announcements and updates." },
    ],
  }),
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="mb-6 text-3xl font-semibold tracking-tight text-foreground">Announcements</h1>
          <AnnouncementsSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
