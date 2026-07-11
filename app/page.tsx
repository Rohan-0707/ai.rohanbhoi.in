import { cookies } from "next/headers";
import Link from "next/link";
import { SESSION_COOKIE } from "@/lib/auth";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingMobileNav } from "@/components/landing/LandingMobileNav";
import { LandingPlanWorkspace } from "@/components/landing/LandingPlanWorkspace";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { JuryAlertBanner } from "@/components/ui/JuryAlertBanner";
import { LiveWeatherWidget } from "@/components/ui/LiveWeatherWidget";

export default async function LandingPage() {
  const cookieStore = await cookies();
  const isAuthenticated = Boolean(cookieStore.get(SESSION_COOKIE)?.value);
  const loginHref = isAuthenticated ? "/dashboard" : "/#get-started";

  return (
    <SocketProvider>
      <div className="min-h-screen pb-[calc(4.5rem+env(safe-area-inset-bottom))] print:pb-0 lg:pb-0">
        <div className="print:hidden">
          <JuryAlertBanner />
        </div>

        <LandingPlanWorkspace
          loginHref={loginHref}
          isAuthenticated={isAuthenticated}
          weatherWidget={<LiveWeatherWidget variant="dark" />}
        >
          <main className="landing-dot-grid relative z-30 bg-slate-50 px-[15px] py-16 text-slate-900 print:bg-white md:px-[50px] md:py-20">
            <LandingFeatures
              loginHref={loginHref}
              isAuthenticated={isAuthenticated}
            />
          </main>
        </LandingPlanWorkspace>

        <footer className="relative z-30 border-t border-slate-200 bg-slate-50 px-[15px] py-8 text-slate-600 print:hidden md:px-[50px]">
          <div className="flex w-full flex-col gap-6">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm sm:justify-start">
              <Link href="#realtime-alerts" className="transition hover:text-teal-600">
                Live alerts
              </Link>
              <Link href="#plan-results" className="transition hover:text-teal-600">
                Your plan
              </Link>
              <Link href="#quick-plan" className="transition hover:text-teal-600">
                Quick plan
              </Link>
              <Link href="#weather-check" className="transition hover:text-teal-600">
                Weather check
              </Link>
              <Link href="#how-it-works" className="transition hover:text-teal-600">
                How it works
              </Link>
              <Link href="#features" className="transition hover:text-teal-600">
                Features
              </Link>
              <Link href={loginHref} className="transition hover:text-teal-600">
                {isAuthenticated ? "Dashboard" : "Get started"}
              </Link>
            </div>
            <div className="flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
              <p>
                © {new Date().getFullYear()} JalVayu AI. Helping families stay safe
                through monsoon season.
              </p>
              <Link
                href={isAuthenticated ? "/dashboard" : "#quick-plan"}
                className="font-semibold text-teal-600 transition hover:text-teal-700"
              >
                {isAuthenticated ? "Go to Dashboard →" : "Create Your Free Plan →"}
              </Link>
            </div>
          </div>
        </footer>

        <LandingMobileNav loginHref={loginHref} />
      </div>
    </SocketProvider>
  );
}
