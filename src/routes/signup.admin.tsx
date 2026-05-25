import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { registerAdminLocal } from "@/lib/local-auth";

export const Route = createFileRoute("/signup/admin")({
  head: () => ({
    meta: [
      { title: "Admin sign up — ThreadLog" },
      { name: "description", content: "Set up your company on ThreadLog as an admin or executive." },
    ],
  }),
  component: AdminSignup,
});

const schema = z
  .object({
    companyName: z.string().min(1, "Company name is required").max(120),
    organizationNumber: z.string().min(3, "Enter your organization number").max(40),
    description: z.string().min(1, "A short description is required").max(1000),
    companyPhone: z.string().min(4, "Enter a valid phone number").max(40),
    companyEmail: z.string().email("Enter a valid email").max(255),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function AdminSignup() {
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
      const { confirmPassword: _c, ...rest } = parsed.data;
      void _c;
      registerAdminLocal(rest);
      toast.success("Company created!");
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
              <CardTitle className="text-2xl">Sign up as an admin</CardTitle>
              <CardDescription>Set up your company on ThreadLog. You can invite your team after.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                {formError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                <TextField id="companyName" label="Company name" error={errors.companyName} />
                <TextField id="organizationNumber" label="Organization number" error={errors.organizationNumber} />
                <div className="space-y-1.5">
                  <Label htmlFor="description">Company description</Label>
                  <Textarea id="description" name="description" rows={3} placeholder="What does your company do?" />
                  {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                </div>
                <TextField id="companyPhone" label="Company phone" type="tel" autoComplete="tel" error={errors.companyPhone} />
                <TextField id="companyEmail" label="Company email" type="email" autoComplete="email" error={errors.companyEmail} />
                <TextField id="password" label="Password" type="password" autoComplete="new-password" error={errors.password} />
                <TextField id="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" error={errors.confirmPassword} />
                <Button type="submit" disabled={pending} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  {pending ? "Creating account…" : "Create account"}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Joining an existing company?{" "}
                <Link to="/signup/employee" className="font-medium text-brand-navy hover:underline">Sign up as employee</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function TextField({
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
