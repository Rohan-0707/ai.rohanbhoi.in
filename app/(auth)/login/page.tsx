import { CinematicHero } from "@/components/landing/CinematicHero";

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <CinematicHero loginHref="/dashboard" isAuthenticated={false} />
    </div>
  );
}
