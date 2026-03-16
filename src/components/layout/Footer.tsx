export function Footer() {
  return (
    <footer className="border-t border-border/50 py-6 no-print">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} RoomAI. Interior design ideas in seconds.
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by advanced AI · Interior design in minutes
          </p>
        </div>
      </div>
    </footer>
  );
}
