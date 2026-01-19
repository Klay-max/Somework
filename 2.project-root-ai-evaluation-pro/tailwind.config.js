/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-cyan': '#00ffff',
        'cyber-green': '#00ff00',
        'cyber-red': '#ff0000',
        'cyber-darkgray': '#111111',
      },
    },
  },
  plugins: [],
}
