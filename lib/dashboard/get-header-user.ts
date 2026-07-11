import { getSessionUserId } from "@/lib/auth";
import { decryptOptional } from "@/lib/encryption";
import prisma from "@/lib/prisma";
import type { HeaderUser } from "@/components/dashboard/DashboardHeaderBar";

function buildInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

function buildDisplayName(
  name: string | null,
  email: string,
  phone: string | null,
): string {
  if (name) {
    return name;
  }

  if (email.includes("@whatsapp.jalvayu")) {
    return phone ? `+91 ${phone}` : "WhatsApp user";
  }

  return email;
}

export async function getHeaderUser(): Promise<HeaderUser> {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      displayName: "Guest",
      initials: "GU",
      location: null,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      name: true,
      phone: true,
      defaultLocation: true,
    },
  });

  if (!user) {
    return {
      displayName: "Guest",
      initials: "GU",
      location: null,
    };
  }

  const displayName = buildDisplayName(user.name, user.email, user.phone);

  return {
    displayName,
    initials: buildInitials(displayName),
    location: decryptOptional(user.defaultLocation),
  };
}
