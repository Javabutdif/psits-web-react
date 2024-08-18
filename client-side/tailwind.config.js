/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4398AC',        // Main brand color
        secondary: '#A4CDD7',      // Complementary color
        accent: '#002E48',         // Darker tone for accents
        highlight: '#FFEB3B',      // Bright highlight color
        dark: '#001621',           // Dark background or text
      
        hover: {
          primary: '#0056b3',      // Hover effect for primary elements
        },
        active: {
          primary: '#003d7a',      // Active effect for primary elements
        },
        disabled: '#C0C0C0',       // Disabled state color
      
        // Neutral colors
        neutral: {
          light: '#F5F5F5',       // Light neutral for backgrounds
          medium: '#E0E0E0',      // Medium neutral for borders and dividers
          dark: '#B0B0B0',        // Dark neutral for text and secondary elements
        }
      },      
      width: {
        header: "calc(100% - 6rem)",
        "header-md": "calc(100% - 6rem)",
        "header-lg": "calc(100% - 7.4rem)",
      },
      minHeight: {
        'main': "calc(100vh - 100px)",
        'main-md': "calc(100vh - 80px)",
        'footer': "calc(100vh - 218px)",
      },
      container: {
        center: true,
        screens: {
          xl: '1440px',
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
        fulls: 'calc(100% - 0.05rem)',
      },
    },
  },
  plugins: [],
}
