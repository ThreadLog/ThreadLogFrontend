import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import logo from "@/assets/threadlog-logo.png";
import { clearSession, getSession } from "@/lib/local-auth";

export function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const showLandingActions = pathname === "/";
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    setHasSession(!!getSession());
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to={hasSession ? "/dashboard" : "/"} className="flex items-center gap-2">
          <img src={logo} alt="ThreadLog" className="h-8 w-auto" />
        </Link>

        {showLandingActions ? (
          <>
            <nav className="hidden items-center gap-8 md:flex">
              <a href="/#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
              <a href="/#how" className="text-sm text-muted-foreground hover:text-foreground">How it works</a>
              <a href="/#contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
            </nav>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          </>
        ) : hasSession ? (
          <>
            <nav className="hidden items-center gap-6 md:flex">
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "text-sm text-foreground font-medium" }} activeOptions={{ exact: true }}>Dashboard</Link>
              <Link to="/announcements" className="text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "text-sm text-foreground font-medium" }}>Announcements</Link>
              <Link to="/logs" className="text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "text-sm text-foreground font-medium" }}>Logs</Link>
              <Link to="/tasks" className="text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "text-sm text-foreground font-medium" }}>Tasks</Link>
              <Link to="/projects" className="text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "text-sm text-foreground font-medium" }}>Projects</Link>
            </nav>
            <Button
              size="sm"
              onClick={() => {
                clearSession();
                setHasSession(false);
                navigate({ to: "/login" });
              }}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Sign out
            </Button>
          </>
        ) : null}
      </div>
    </header>
  );
}
