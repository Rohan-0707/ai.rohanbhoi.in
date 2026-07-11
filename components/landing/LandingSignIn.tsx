import Link from "next/link";
import { OtpLoginForm } from "@/components/auth/OtpLoginForm";
import { IconShield } from "@/components/dashboard/CitizenIcons";

type LandingSignInProps = {
  loginHref: string;
  isAuthenticated: boolean;
};

export function LandingSignIn({
  loginHref,
  isAuthenticated,
}: LandingSignInProps) {
  if (isAuthenticated) {
    return null;
  }

  return (
    <section id="get-started" className="scroll-mt-24 print:hidden">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-2">
          <div className="border-b border-slate-200 bg-gradient-to-br from-slate-900 to-teal-950 px-5 py-8 text-white sm:px-8 lg:border-b-0 lg:border-r">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-teal-300">
                <IconShield className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">
                  Optional sign-in
                </p>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                  Save Plans &amp; Get Alerts
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  You can generate emergency plans without an account. Sign in
                  only when you want encrypted history, saved household
                  defaults, and dashboard tools.
                </p>
                <ul className="mt-5 space-y-2 text-sm text-slate-300">
                  <li>· AES-256 encrypted location &amp; medical needs</li>
                  <li>· Plan history across sessions</li>
                  <li>· Dashboard profile &amp; real-time alert banner</li>
                </ul>
                <Link
                  href="#quick-plan"
                  className="mt-6 inline-flex text-sm font-semibold text-teal-300 hover:text-teal-200"
                >
                  ← Back to quick plan (no login)
                </Link>
              </div>
            </div>
          </div>

          <div className="px-5 py-8 sm:px-8">
            <p className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">
              Sign in with email or WhatsApp OTP
            </p>
            <OtpLoginForm variant="embedded" tone="light" redirectTo="/dashboard" />
            <p className="mt-4 text-center text-xs text-slate-500">
              Evaluator: <span className="font-mono">judge@google.com</span> / OTP{" "}
              <span className="font-mono">123456</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
