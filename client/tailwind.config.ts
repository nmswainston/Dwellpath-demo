import type { Config } from "tailwindcss";

/**
 * Canonical Tailwind config for the project.
 *
 * Vite is configured with `root: client`, so Tailwind will naturally discover this file.
 * Keeping a single config avoids “edited the wrong config” bugs.
 */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      spacing: {
        xs: "0.25rem", // 4px
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        paper: "hsl(var(--paper))",
        surface: "hsl(var(--surface-1))", // Alias for backward compatibility
        "surface-1": "hsl(var(--surface-1))",
        "surface-2": "hsl(var(--surface-2))",
        "surface-3": "hsl(var(--surface-3))",
        sand: {
          DEFAULT: "hsl(var(--brand-sand))",
          hover: "hsl(var(--brand-sand-hover))",
          selected: "hsl(var(--brand-sand-selected))",
          muted: "hsl(var(--brand-sand-muted))",
          border: "hsl(var(--brand-sand-border))",
          ring: "hsl(var(--brand-sand-ring))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        status: {
          safe: "hsl(var(--status-safe))",
          warning: "hsl(var(--status-warning))",
          risk: "hsl(var(--status-risk))",
          neutral: "hsl(var(--status-neutral))",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Dwellpath Brand Colors - Semantic
        brand: {
          navy: "#0B1D3A",
          cream: "#F5F3E7",
          graphite: "#1A1F1C",
          mutedBlue: "#C8D3E3",
          ink: "#101418",
          lightBg: "#F4EFE6",
          // Legacy aliases for backward compatibility
          primary: "#0B1D3A",
          accent: "#F5F3E7",
          bg: {
            // Dark-mode anchor (midnight steel): #1A212D
            dark: "#1A212D",
            light: "#F4EFE6",
          },
          text: {
            // Dark-mode primary text (soft off-white): #F2F4F7
            dark: "#F2F4F7",
            light: "#0B1D3A",
          },
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', "serif"],
        body: ["Inter", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;

