import { cookies } from "next/headers";
import Link from "next/link";
import { SESSION_COOKIE } from "@/lib/auth";
import { CinematicHero } from "@/components/landing/CinematicHero";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingMobileNav } from "@/components/landing/LandingMobileNav";

export default async function LandingPage() {
  const cookieStore = await cookies();
  const isAuthenticated = Boolean(cookieStore.get(SESSION_COOKIE)?.value);
  const loginHref = isAuthenticated ? "/dashboard" : "/";

  return (
    <div className="min-h-screen bg-slate-50 pb-[calc(4.5rem+env(safe-area-inset-bottom))] text-slate-700 lg:pb-0">
      <CinematicHero loginHref={loginHref} isAuthenticated={isAuthenticated} />

      <LandingFeatures loginHref={loginHref} />

      <footer className="border-t border-slate-200 bg-white py-5">
        <div className="ops-page-padding flex flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} JalVayu AI. Helping families stay safe
            through monsoon season.
          </p>
          <Link
            href={loginHref}
            className="font-semibold text-monsoon-secondary transition hover:text-teal-700"
          >
            {isAuthenticated ? "Go to Dashboard →" : "Create Your Free Plan →"}
          </Link>
        </div>
      </footer>

      <LandingMobileNav loginHref={loginHref} />
    </div>
  );
}
