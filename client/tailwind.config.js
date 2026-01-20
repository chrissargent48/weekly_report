/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#009fb7', // Was navy
          accent: '#fed766',  // Was amber
          surface: {
            dark: '#272727',  // Was dark
            light: '#eff1f3', // Was gray
          },
          text: {
            muted: '#696773', // Was dim
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
