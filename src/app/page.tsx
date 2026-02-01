import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-palette-mid bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="My Flight School"
              width={120}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
            <span className="font-bold text-palette-darkest text-lg sr-only sm:not-sr-only">
              My Flight School
            </span>
          </Link>
          <nav className="flex gap-4">
            <Link
              href="/login"
              className="font-semibold text-palette-darkest hover:underline"
            >
              Log in
            </Link>
            <Link
              href="/school/login"
              className="font-semibold text-palette-darkest hover:underline"
            >
              List your school
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-palette-darkest mb-4 tracking-tight">
          Find the right flight school for you.
        </h1>
        <p className="text-xl font-semibold text-palette-dark text-center max-w-xl mb-10">
          Compare programs, pricing, and locations—then reach out when you&apos;re ready.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-palette-mid text-palette-cream px-8 py-3 font-medium hover:bg-palette-dark focus-ring min-h-[44px]"
          >
            Find your flight school
          </Link>
          <Link
            href="/school/login"
            className="inline-flex items-center justify-center rounded-lg border border-palette-mid text-palette-darkest px-8 py-3 font-medium hover:bg-palette-light hover:text-palette-cream focus-ring min-h-[44px]"
          >
            List your school
          </Link>
        </div>

        <section className="mt-24 max-w-2xl text-center" aria-label="How it works">
          <h2 className="text-2xl font-bold text-palette-darkest mb-8">
            How it works
          </h2>
          <ol className="space-y-6 text-left">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-palette-mid text-palette-cream font-bold flex items-center justify-center">
                1
              </span>
              <div>
                <strong className="text-palette-darkest font-bold">Enter your goals</strong>
                <p className="text-palette-dark font-semibold mt-1">
                  Tell us where you want to fly and what you&apos;re aiming for (Private Pilot, Instrument, etc.).
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-palette-mid text-palette-cream font-bold flex items-center justify-center">
                2
              </span>
              <div>
                <strong className="text-palette-darkest font-bold">See matched schools</strong>
                <p className="text-palette-dark font-semibold mt-1">
                  We rank schools by fit—distance, programs, and your preferences.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-palette-mid text-palette-cream font-bold flex items-center justify-center">
                3
              </span>
              <div>
                <strong className="text-palette-darkest font-bold">Contact and visit</strong>
                <p className="text-palette-dark font-semibold mt-1">
                  Request an intro; schools reach out. No spam, no commitment until you&apos;re ready.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <p className="mt-16 text-palette-darkest font-semibold text-sm">
          Trusted by aspiring pilots · 50+ flight schools
        </p>
      </main>

      <footer className="border-t border-palette-mid py-6 bg-white">
        <div className="max-w-4xl mx-auto px-4 flex justify-center gap-6 text-sm font-semibold text-palette-darkest">
          <Link href="/login" className="text-palette-darkest hover:underline">
            Login
          </Link>
          <span>·</span>
          <a href="#" className="text-palette-darkest hover:underline">
            Privacy
          </a>
          <span>·</span>
          <a href="#" className="text-palette-darkest hover:underline">
            Terms
          </a>
        </div>
      </footer>
    </div>
  );
}
