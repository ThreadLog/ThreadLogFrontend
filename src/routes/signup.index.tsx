import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRound, Building2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/signup/")({
  head: () => ({
    meta: [
      { title: "Sign up — ThreadLog" },
      { name: "description", content: "Create a ThreadLog account as an employee or as a company admin." },
    ],
  }),
  component: SignupChooser,
});

function SignupChooser() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Create your account</h1>
            <p className="mt-2 text-muted-foreground">Choose the option that fits your role.</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Link to="/signup/employee" className="group">
              <Card className="h-full border-border/60 transition group-hover:-translate-y-0.5 group-hover:shadow-lg">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-brand-navy">
                    <UserRound className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-3">I'm an Employee</CardTitle>
                  <CardDescription>
                    Join your company on ThreadLog using a code from your executive.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex items-center text-sm font-medium text-brand-navy">
                    Continue <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
            <Link to="/signup/admin" className="group">
              <Card className="h-full border-border/60 transition group-hover:-translate-y-0.5 group-hover:shadow-lg">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-3">I'm an Admin / Executive</CardTitle>
                  <CardDescription>
                    Set up your company on ThreadLog and invite your team.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex items-center text-sm font-medium text-accent">
                    Continue <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </div>
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-brand-navy hover:underline">Log in</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
