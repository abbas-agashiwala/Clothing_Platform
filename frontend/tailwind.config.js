/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: { ink: "#171717", sand: "#242424", clay: "#e48a6d" },
      boxShadow: { soft: "0 12px 32px rgba(23, 23, 23, 0.10)" },
    },
  },
  plugins: [],
};
