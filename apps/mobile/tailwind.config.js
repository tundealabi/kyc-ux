/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#141414",
        muted: "#6b6b6b",
        border: "#e4e0dc",
        accent: "#e85d3b",
        "accent-soft": "#fceee9",
        "accent-disabled": "#f0b5a4",
        success: "#1f7a4d",
        "success-soft": "#e8f6ef",
        danger: "#b42318",
        "danger-soft": "#fef3f2",
        surface: "#ffffff",
        canvas: "#f3f1ef",
      },
    },
  },
  plugins: [],
};
