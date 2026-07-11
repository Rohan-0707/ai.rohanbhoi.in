/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "monsoon-primary": "#0F172A",
        "monsoon-secondary": "#0D9488",
        "monsoon-alert": "#EA580C",
        "monsoon-light": "#F8FAFC",
        "monsoon-dark": "#1E293B",
        "ops-base": "#070a13",
        "ops-teal": "#0d9488",
        "ops-amber": "#ea580c",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "ops-glow": "0 0 15px rgba(13,148,136,0.4)",
        "ops-glow-lg": "0 0 24px rgba(13,148,136,0.35)",
        "ops-active": "0 0 20px rgba(13,148,136,0.55)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
