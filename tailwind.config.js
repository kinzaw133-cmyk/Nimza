/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        olive: {
          DEFAULT: "#1F241F",
          dark: "#151915",
          deep: "#101310",
          light: "#2C342C",
          muted: "#181D18",
        },
        gold: {
          DEFAULT: "#B99A5B",
          light: "#D8BF83",
          dark: "#8E723B",
          shimmer: "#F3E5C2",
          foil: "#C9A765",
        },
        ivory: {
          DEFAULT: "#FAFAF8",
          soft: "#FFFFFF",
          warm: "#F5F4EE",
        },
        charcoal: {
          DEFAULT: "#1F241F",
          dark: "#121512",
          soft: "#2E342E",
        },
        sand: {
          DEFAULT: "#E5E0D8",
          light: "#EFECE6",
          dark: "#D6CFC3",
        },
        wine: {
          DEFAULT: "#9E2A2B",
          light: "#C8322B",
          dark: "#7A1C1D",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "'Playfair Display'", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "'DM Sans'", "system-ui", "-apple-system", "sans-serif"],
      },
      animation: {
        "float-slow": "floatSlow 6s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
      },
      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(1.5deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
};
