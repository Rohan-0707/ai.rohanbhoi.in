import { cookies } from "next/headers";
import Link from "next/link";
import { SESSION_COOKIE } from "@/lib/auth";
import { CinematicHero } from "@/components/landing/CinematicHero";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingMobileNav } from "@/components/landing/LandingMobileNav";
import { LiveWeatherWidget } from "@/components/ui/LiveWeatherWidget";

export default async function LandingPage() {
  const cookieStore = await cookies();
  const isAuthenticated = Boolean(cookieStore.get(SESSION_COOKIE)?.value);
  const loginHref = isAuthenticated ? "/dashboard" : "/#get-started";

  return (
    <div className="min-h-screen pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <CinematicHero
        loginHref={loginHref}
        isAuthenticated={isAuthenticated}
        weatherWidget={<LiveWeatherWidget variant="dark" />}
      />

      <main className="relative z-30 bg-slate-50 px-[15px] py-20 text-slate-900 md:px-[50px]">
        <LandingFeatures loginHref={loginHref} />
      </main>

      <footer className="relative z-30 border-t border-slate-200 bg-slate-50 px-[15px] py-6 text-slate-600 md:px-[50px]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm sm:flex-row">
          <p>
            © {new Date().getFullYear()} JalVayu AI. Helping families stay safe
            through monsoon season.
          </p>
          <Link
            href={loginHref}
            className="font-semibold text-teal-600 transition hover:text-teal-700"
          >
            {isAuthenticated ? "Go to Dashboard →" : "Create Your Free Plan →"}
          </Link>
        </div>
      </footer>

      <LandingMobileNav loginHref={loginHref} />
    </div>
  );
}
