/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#14161B",
        surface: "#1D2027",
        surfaceAlt: "#262A32",
        borderCol: "#33383F",
        ink: "#F3EFE7",
        muted: "#9BA0A8",
        brass: "#C9A24B",
        brassDim: "#8A7238",
        clay: "#A5432E",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
