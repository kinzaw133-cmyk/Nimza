/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        olive: {
          DEFAULT: "#343D27",
          dark: "#1F2615",
          deep: "#171D0F",
          light: "#4B5739",
          muted: "#2C3421",
        },
        gold: {
          DEFAULT: "#B99A5B",
          light: "#D8BF83",
          dark: "#8E723B",
          shimmer: "#F3E5C2",
          foil: "#C9A765",
        },
        ivory: {
          DEFAULT: "#F7F4EC",
          soft: "#FAF8F3",
          warm: "#EFECE3",
        },
        charcoal: {
          DEFAULT: "#24241F",
          dark: "#171714",
          soft: "#363630",
        },
        sand: {
          DEFAULT: "#E9DFC9",
          light: "#F3ECE0",
          dark: "#D4C7AE",
        },
      },
      fontFamily: {
        serif: ["var(--font-pf)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-dm)", "DM Sans", "system-ui", "sans-serif"],
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
