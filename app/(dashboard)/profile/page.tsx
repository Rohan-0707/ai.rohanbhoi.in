import { getSessionUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AccountProfileForm } from "@/components/dashboard/AccountProfileForm";
import { IconFamily } from "@/components/dashboard/CitizenIcons";

function formatAccountEmail(email: string, phone: string | null): string {
  if (email.includes("@whatsapp.jalvayu")) {
    return phone ? `+91 ${phone}` : "WhatsApp account";
  }

  return email;
}

export default async function ProfilePage() {
  const userId = await getSessionUserId();

  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          phone: true,
          defaultLocation: true,
          housingType: true,
          familySize: true,
        },
      })
    : null;

  return (
    <div className="space-y-6">
      <section className="premium-card">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-monsoon-secondary shadow-sm">
            <IconFamily className="h-6 w-6" />
          </div>
          <div>
            <h1 className="citizen-heading text-2xl sm:text-3xl">
              Account &amp; Family Profile
            </h1>
            <p className="citizen-subtext mt-2">
              Manage your household defaults and review how your account is
              connected — all protected with AES-256 encryption.
            </p>
          </div>
        </div>
      </section>

      <AccountProfileForm
        defaultLocation={user?.defaultLocation ?? ""}
        housingType={user?.housingType ?? "Apartment"}
        familySize={user?.familySize ?? 4}
        accountEmail={formatAccountEmail(user?.email ?? "", user?.phone ?? null)}
        accountPhone={user?.phone ? `+91 ${user.phone}` : null}
      />
    </div>
  );
}
