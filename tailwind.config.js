/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",        // snag all components under app/
    "./components/**/*.{js,jsx,ts,tsx}", // reusable UI components
  ],
  presets: [require("nativewind/preset")],
  theme: { extend: {} },
  plugins: [],
};
