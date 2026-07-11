import { IconLock } from "@/components/dashboard/CitizenIcons";

type SecurityBadgeProps = {
  className?: string;
  compact?: boolean;
};

export function SecurityBadge({ className = "", compact = false }: SecurityBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50/90 px-3 py-1.5 text-teal-800 shadow-sm ${compact ? "text-[11px]" : "text-xs"} font-medium ${className}`}
    >
      <IconLock className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      <span>Secured via AES-256 Encryption</span>
    </div>
  );
}
