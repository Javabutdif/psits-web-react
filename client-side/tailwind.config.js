/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        banner: "url(./src/assets/images/download.png)",
      },
      backgroundColor: {
        primary: "#074873",
        secondary: "#f2f2f2",
      },
      borderColor: {
        primary: "#f2f2f2",
        secondary: "#074873",
      },
      textColor: {
        primary: "#fffcf2",
      },
      width: {
        header: "calc(100% - 7rem)",
        "header-sm": "calc(100% - 5rem)",
      },
      minHeight: {

        'main': "calc(100vh - 100px)",
        'main-md': "calc(100vh - 80px)",
        'footer': "calc(100vh -218px)"
      },
      container: {
        center: true, // Centers the container
        screens: {
          xl: '1440px'
        },
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};
