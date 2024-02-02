/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(64 37 121)",
        "primary-light": "rgb(195 177 232)",
      },
    },
  },
  plugins: [],
}
