import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center py-20">
      <div className="text-center">
        <p className="text-5xl font-bold text-primary">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-foreground">
          Page not found
        </h1>
        <p className="mt-2 text-muted-foreground">
          This page doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
