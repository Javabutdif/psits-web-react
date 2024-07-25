/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
          'banner': 'url(./src/assets/images/download.png)',

      },
      backgroundColor: {
        'primary': "#074873",
        'secondary': '#f2f2f2'
      },
      borderColor: {
        'primary': "#f2f2f2",
        'secondary': '#074873',

      },
      textColor: {
        'primary': '#fffcf2',
      },
      width: {
        'header': 'calc(100% - 5rem)',
        'header-sm': 'calc(100% - 6.7rem)',
      },
      minHeight: {
        'main': "calc(100vh - 100px)",
        'main-md': "calc(100vh - 80px)",
        'footer': "calc(100vh -218px)"
      },
      container: {
        center: true, // Centers the container
        screens: {
          sm: '640px',   // Small screens
          md: '768px',   // Medium screens
          lg: '1024px',  // Large screens
          xl: '1280px',  // Extra large screens
          '2xl': '1'
        },
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        segoe: [
          "Segoe UI",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        blue: "#074873",
      },
      boxShadow: {
        custom: "0px 0px 8px rgba(0, 0, 0, 0.24)",
      },
    },
  },
  plugins: [],

}

