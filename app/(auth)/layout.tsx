import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — JalVayu AI",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
