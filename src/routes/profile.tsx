import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { clearSession, getSession } from "@/lib/auth";
import { apiGet, apiPatch, apiDelete } from "@/lib/api";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — ThreadLog" },
      { name: "description", content: "Edit your profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const session = getSession();
  const isAdmin = session?.role === "admin";
  const apiBase = isAdmin ? `/companyrecruiter/${session!.id}` : `/jobseekers/${session!.id}`;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate({ to: "/login" });
      return;
    }
    apiGet<Record<string, unknown>>(apiBase, session.token)
      .then((res) => {
        const data = (res.data ?? res.jobseeker ?? res) as Record<string, unknown>;
        setFormData({
          firstName: String(data.firstName ?? ""),
          lastName: String(data.lastName ?? ""),
          companyName: String(data.companyName ?? ""),
          email: String(data.email ?? ""),
          phoneNumber: String(data.phoneNumber ?? ""),
          city: String(data.city ?? ""),
          country: String(data.country ?? ""),
          bio: String(data.bio ?? ""),
          personalStatement: String(data.personalStatement ?? ""),
          portfolioLink: String(data.portfolioLink ?? ""),
          description: String(data.description ?? ""),
          organizationNumber: String(data.organizationNumber ?? ""),
          industry: String(data.industry ?? ""),
          logoUrl: String(data.logoUrl ?? ""),
          languages: Array.isArray(data.languages) ? data.languages.join(", ") : String(data.languages ?? ""),
          skills: Array.isArray(data.skills) ? data.skills.join(", ") : String(data.skills ?? ""),
          adminAccessCode: String(
            (data.company as Record<string, unknown> | null)?.adminAccessCode ??
            data.adminAccessCode ??
            "",
          ),
          password: "",
        });
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  function set<K extends string>(key: K, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function buildPayload(): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(formData)) {
      if (key === "adminAccessCode" || key === "password") continue;
      if (key === "languages" || key === "skills") {
        const arr = value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (arr.length > 0) payload[key] = arr;
        continue;
      }
      if (value) payload[key] = value;
    }
    if (formData.password) payload.password = formData.password;
    return payload;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      await apiPatch(apiBase, buildPayload(), session!.token);
      toast.success("Profile updated!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiDelete(apiBase, session!.token);
      clearSession();
      toast.success(isAdmin ? "Company deleted. All associated accounts have been removed." : "Account deleted.");
      navigate({ to: "/" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete account";
      toast.error(msg);
      setDeleting(false);
      setShowDelete(false);
    }
  }

  if (!session) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-xl px-4 py-12">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-2xl">Profile</CardTitle>
              <CardDescription>Manage your account details.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : (
                <form onSubmit={handleSave} className="space-y-5">
                  {formError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}

                  {isAdmin ? (
                    <>
                      <h3 className="text-sm font-semibold text-muted-foreground">Company info</h3>
                      <div className="space-y-1.5">
                        <Label htmlFor="companyName">Company name</Label>
                        <Input id="companyName" value={formData.companyName ?? ""} onChange={(e) => set("companyName", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="organizationNumber">Organization number</Label>
                        <Input id="organizationNumber" value={formData.organizationNumber ?? ""} onChange={(e) => set("organizationNumber", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" rows={3} value={formData.description ?? ""} onChange={(e) => set("description", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="industry">Industry</Label>
                        <Input id="industry" value={formData.industry ?? ""} onChange={(e) => set("industry", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="logoUrl">Logo URL</Label>
                        <Input id="logoUrl" value={formData.logoUrl ?? ""} onChange={(e) => set("logoUrl", e.target.value)} />
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-semibold text-muted-foreground">Personal info</h3>
                      <div className="space-y-1.5">
                        <Label htmlFor="firstName">First name</Label>
                        <Input id="firstName" value={formData.firstName ?? ""} onChange={(e) => set("firstName", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input id="lastName" value={formData.lastName ?? ""} onChange={(e) => set("lastName", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" rows={3} value={formData.bio ?? ""} onChange={(e) => set("bio", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="personalStatement">Personal statement</Label>
                        <Textarea id="personalStatement" rows={3} value={formData.personalStatement ?? ""} onChange={(e) => set("personalStatement", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="portfolioLink">Portfolio link</Label>
                        <Input id="portfolioLink" value={formData.portfolioLink ?? ""} onChange={(e) => set("portfolioLink", e.target.value)} />
                      </div>
                    </>
                  )}

                  <h3 className="text-sm font-semibold text-muted-foreground">Contact info</h3>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email ?? ""} onChange={(e) => set("email", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phoneNumber">Phone</Label>
                    <Input id="phoneNumber" value={formData.phoneNumber ?? ""} onChange={(e) => set("phoneNumber", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={formData.city ?? ""} onChange={(e) => set("city", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" value={formData.country ?? ""} onChange={(e) => set("country", e.target.value)} />
                    </div>
                  </div>

                  {!isAdmin && (
                    <>
                      <h3 className="text-sm font-semibold text-muted-foreground">Skills &amp; languages</h3>
                      <div className="space-y-1.5">
                        <Label htmlFor="languages">Languages <span className="text-xs text-muted-foreground">(comma-separated)</span></Label>
                        <Input id="languages" value={formData.languages ?? ""} onChange={(e) => set("languages", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="skills">Skills <span className="text-xs text-muted-foreground">(comma-separated)</span></Label>
                        <Input id="skills" value={formData.skills ?? ""} onChange={(e) => set("skills", e.target.value)} />
                      </div>
                    </>
                  )}

                  <h3 className="text-sm font-semibold text-muted-foreground">Account</h3>
                  <div className="space-y-1.5">
                    <Label htmlFor="adminAccessCode">Company invite code</Label>
                    <Input id="adminAccessCode" value={formData.adminAccessCode ?? ""} readOnly className="cursor-not-allowed opacity-60" tabIndex={-1} />
                    <p className="text-xs text-muted-foreground">This code cannot be changed.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">New password <span className="text-xs text-muted-foreground">(leave blank to keep current)</span></Label>
                    <Input id="password" type="password" value={formData.password ?? ""} onChange={(e) => set("password", e.target.value)} />
                  </div>

                  <Button type="submit" disabled={saving} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                </form>
              )}

              <div className="mt-8 border-t border-border/60 pt-6">
                <h3 className="text-sm font-medium text-destructive">Danger zone</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isAdmin
                    ? "Deleting your account removes your company and all employee accounts permanently."
                    : "Once deleted, your account cannot be recovered."}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-3"
                  onClick={() => setShowDelete(true)}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete account</DialogTitle>
            <DialogDescription>
              {isAdmin
                ? "This will permanently delete your company, all employee accounts, jobs, and workspace data. This cannot be undone."
                : "This will permanently delete your profile, applications, and saved items. This cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
