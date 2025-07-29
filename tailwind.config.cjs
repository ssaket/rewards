/**
 * Tailwind configuration file. This configuration is deliberately
 * minimal and relies on Tailwind's default theme. It enables
 * Just-In-Time mode for faster builds and sets the content paths
 * to scan for class names in our source files and html.
 */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
