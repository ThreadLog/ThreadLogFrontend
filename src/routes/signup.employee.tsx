import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { registerEmployee, loginEmployee } from "@/lib/auth";

export const Route = createFileRoute("/signup/employee")({
  head: () => ({
    meta: [
      { title: "Employee sign up — ThreadLog" },
      { name: "description", content: "Create your ThreadLog employee account using your company invite code." },
    ],
  }),
  component: EmployeeSignup,
});

const schema = z
  .object({
    fullName: z.string().min(1, "Your full name is required").max(120),
    email: z.string().email("Enter a valid email").max(255),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
    adminAccessCode: z.string().min(1, "Enter the code from your company").max(64),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function EmployeeSignup() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries()) as Record<string, string>;
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[i.path[0] as string] = i.message));
      setErrors(errs);
      setFormError("Please fix the highlighted fields and try again.");
      return;
    }
    setPending(true);
    try {
      const { confirmPassword: _c, fullName, ...rest } = parsed.data;
      void _c;
      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      await registerEmployee({ firstName, lastName, ...rest });
      await loginEmployee(rest.email, rest.password);
      toast.success("Account created!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not create account. Please try again.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-xl px-4 py-12">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-2xl">Sign up as an employee</CardTitle>
              <CardDescription>You'll need the invite code your company executive gave you.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                {formError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                <Field id="fullName" label="Full name" autoComplete="name" error={errors.fullName} />
                <Field id="email" label="Email" type="email" autoComplete="email" error={errors.email} />
                <Field id="password" label="Password" type="password" autoComplete="new-password" error={errors.password} />
                <Field id="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" error={errors.confirmPassword} />
                <Field id="adminAccessCode" label="Company invite code" error={errors.adminAccessCode} />
                <Button type="submit" disabled={pending} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  {pending ? "Creating account…" : "Create account"}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Are you an executive?{" "}
                <Link to="/signup/admin" className="font-medium text-brand-navy hover:underline">Sign up as admin</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  autoComplete,
  error,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} autoComplete={autoComplete} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
