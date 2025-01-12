/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-10": "var(--primary-10)",
        "primary-inverted": "var(--primary-inverted)",
        "primary-inverted-10": "var(--primary-inverted-10)",
        "smoke-eerie": "var(--smoke-eerie)",
      },
      backgroundImage: {
        "gradient-accent": "var(--gradient-accent)",
      },
      fontFamily: {
        metropolis: ["metropolis", "sans-serif"],
      },
    },
  },
  plugins: [
    function ({
      addVariant,
    }: {
      addVariant: (name: string, selector: string) => void;
    }) {
      addVariant("theme-light", '[data-theme="light"] &');
      addVariant("theme-dark", '[data-theme="dark"] &');
    },
  ],
};
