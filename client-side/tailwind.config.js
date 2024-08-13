/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 'primary': '#001621',   // Very dark blue/black
        // 'secondary': '#002E48', // Dark blue
        // 'tertiary': '#074873',  // Medium blue
        // 'accent': '#4398AC',    // Light blue/teal
        // 'muted': '#A4CDD7',     // Pale blue/gray
        'custom-active': '#005f73', // Softer blue for active state
        'custom-active-text': '#e9d8a6', // Light beige for text in active state
        'custom-text': '#d8e2dc', // Light grayish blue for text
        'custom-hover': '#0a9396', // Slightly lighter blue for hover state
        'custom-logout': '#008C9E', // Softer teal for logout button background
        'custom-logout-hover': '#007a8d', // Darker teal for logout button on hover
        'custom-logout-text': '#ffffff', // White text for logout button
      },
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
        header: "calc(100% - 6rem)",
        "header-md": "calc(100% - 6rem)",
        "header-lg": "calc(100% - 7.4rem)",
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
        primary: ["Montserrat", "sans-serif"],
        secondary: ["League Spartan", "sans-serif"],
      },
    },
  },
  plugins: [],
};
