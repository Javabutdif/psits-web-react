  /** @type {import('tailwindcss').Config} */
  export default {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        colors: {
          'custom-active': '#005f73',
          'custom-active-text': '#e9d8a6',
          'custom-text': '#d8e2dc',
          'custom-hover': '#0a9396',
          'custom-logout': '#008C9E',
          'custom-logout-hover': '#007a8d',
          'custom-logout-text': '#ffffff',
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
          'footer': "calc(100vh - 218px)"
        },
        container: {
          center: true,
          screens: {
            xl: '1440px'
          },
        },
        fontFamily: {
          primary: ["Montserrat", "sans-serif"],
          secondary: ["League Spartan", "sans-serif"],
        },
        fontSize: {
          'h1': ['3rem', { lineHeight: '3.5rem' }],
          'h2': ['2.5rem', { lineHeight: '3rem' }],
          'h3': ['2rem', { lineHeight: '2.5rem' }],
          'h4': ['1.75rem', { lineHeight: '2.25rem' }],
          'h5': ['1.5rem', { lineHeight: '2rem' }],
          'h6': ['1.25rem', { lineHeight: '1.75rem' }],
        },
        translate: {
          'fulls': 'calc(100% - 0.05rem)',
        },
      },
    },
    plugins: [],
  };
