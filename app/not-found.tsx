import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full text-center">
        <div className="inline-block mb-4">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            Page not found
          </span>
        </div>
        <h1 className="text-6xl md:text-7xl font-bold text-primary mb-4 font-serif">
          404
        </h1>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="cursor-pointer inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary-light hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Go home
          </Link>
          <Link
            href="/advisories"
            className="cursor-pointer inline-flex items-center justify-center px-8 py-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-primary-foreground hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Browse advisories
          </Link>
        </div>
      </div>
    </main>
  );
}
