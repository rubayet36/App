/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pastelPink: "#FFB6C1",
        glass: "rgba(255, 255, 255, 0.2)",
        glassBorder: "rgba(255, 255, 255, 0.4)",
      },
    },
  },
  plugins: [],
};
