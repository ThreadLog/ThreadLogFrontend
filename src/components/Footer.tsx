import logo from "@/assets/threadlog-logo.png";

export function Footer() {
  return (
    <footer id="contact" className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row">
        <img src={logo} alt="ThreadLog" className="h-7 w-auto" />
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} ThreadLog. All rights reserved.
        </p>
        <a href="mailto:hello@threadlog.app" className="text-sm text-muted-foreground hover:text-foreground">
          hello@threadlog.app
        </a>
      </div>
    </footer>
  );
}
