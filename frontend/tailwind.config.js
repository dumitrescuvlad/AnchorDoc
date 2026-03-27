/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#ffffff",
        surface: "#f8fafc",
        surface2: "#f1f5f9",
        border: "#e5e7eb",
        borderStrong: "#d1d5db",
        text: "#111827",
        textMuted: "#6b7280",
        primary: "#2563eb",
        primarySoft: "#dbeafe",
        success: "#16a34a",
        successSoft: "#dcfce7",
        danger: "#dc2626",
        dangerSoft: "#fee2e2",
        warning: "#d97706",
        warningSoft: "#fef3c7",
      },
      boxShadow: {
        panel: "0 1px 2px rgba(16, 24, 40, 0.04)",
        card: "0 1px 3px rgba(16, 24, 40, 0.08)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};
