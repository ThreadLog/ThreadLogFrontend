import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquareOff, Users, ListChecks, Activity, MessagesSquare, Search, ShieldCheck } from "lucide-react";
import mark from "@/assets/threadlog-mark.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ThreadLog — One thread for your team's work" },
      { name: "description", content: "Stop losing updates across email, chat, and hallway conversations. ThreadLog gives small teams one shared thread for every project." },
    ],
  }),
  component: Index,
});

const problems = [
  { icon: MessageSquareOff, title: "Lost updates", text: "Critical decisions buried in DMs and email threads no one can find again." },
  { icon: Users, title: "Misunderstandings", text: "Different people, different versions of the truth — and no shared record." },
  { icon: ListChecks, title: "Unclear responsibilities", text: "Tasks float between channels with no clear owner or due date." },
  { icon: Activity, title: "Hard to track progress", text: "Leaders piece status together from a dozen tools every Monday morning." },
];

const features = [
  { icon: MessagesSquare, title: "One thread per project", text: "Updates, files, and decisions live in one timeline anyone can scroll through." },
  { icon: Search, title: "Searchable history", text: "Find that decision from three weeks ago in seconds — not in a frantic Slack scroll." },
  { icon: ShieldCheck, title: "Clear ownership", text: "Every action item has an owner, a status, and a due date. No more guessing." },
];

function Index() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-secondary/60 to-background" />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
            <div>
              <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-brand-navy">
                For small business teams
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                One thread for your team's work.
              </h1>
              <p className="mt-5 text-lg text-muted-foreground">
                Email, chat, hallway conversations, shared docs — small teams lose context across too many channels.
                ThreadLog brings every update, decision, and task into a single searchable thread per project.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to="/signup">Get started</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/login">Log in</Link>
                </Button>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-sm">
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand-blue/15 via-brand-orange/10 to-brand-green/15 blur-2xl" />
              <img src={mark} alt="ThreadLog" className="mx-auto h-72 w-auto drop-shadow-xl" />
            </div>
          </div>
        </section>

        {/* Problems */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Sound familiar?</h2>
            <p className="mt-3 text-muted-foreground">
              Fragmented communication is the silent productivity killer in small teams.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {problems.map((p) => (
              <Card key={p.title} className="border-border/60 transition hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-brand-navy">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{p.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{p.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="bg-secondary/40">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">How ThreadLog helps</h2>
              <p className="mt-3 text-muted-foreground">
                A simple, shared source of truth so nothing falls through the cracks.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {features.map((f) => (
                <Card key={f.title} className="border-border/60">
                  <CardContent className="p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-semibold text-foreground">{f.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-12 flex justify-center">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/signup">Create your account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
