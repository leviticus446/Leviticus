/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F5F1E8',
        forest: '#2F3D2C',
        gold: '#B8935A',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['"Neue Montreal"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
