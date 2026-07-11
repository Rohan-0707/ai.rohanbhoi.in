import type { ComponentType, SVGProps } from "react";
import {
  IconFamily,
  IconGuides,
  IconHome,
  IconPlans,
} from "@/components/dashboard/CitizenIcons";

type IconProps = SVGProps<SVGSVGElement>;

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: ComponentType<IconProps>;
};

export const CITIZEN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Home", shortLabel: "Home", icon: IconHome },
  {
    href: "/profile",
    label: "Account & Family",
    shortLabel: "Profile",
    icon: IconFamily,
  },
  {
    href: "/my-plans",
    label: "Saved Plans",
    shortLabel: "Plans",
    icon: IconPlans,
  },
  {
    href: "/safety-guides",
    label: "Safety Guides",
    shortLabel: "Guides",
    icon: IconGuides,
  },
];

export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
