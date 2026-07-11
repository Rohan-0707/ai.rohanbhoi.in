export function getGreetingName(displayName: string): string {
  if (displayName.startsWith("+") || displayName.includes("@")) {
    return "there";
  }

  return displayName.split(/\s+/)[0] || "there";
}

export function getTimeGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}
