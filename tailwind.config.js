/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-gold": "#D49A20",
        "brand-gold-hover": "#BF8718",
        "brand-gold-light": "#B8860B",
        "brand-violet": "#6D28D9",
        "bg-page": "#030712",
        "bg-surface": "#1F2937",
        "bg-elevated": "#111827",
      },
      fontFamily: {
        sans: ["Inter", "Microsoft YaHei", "微软雅黑", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
