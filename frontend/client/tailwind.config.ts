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
        // "smoke-eerie-inverted": "var(--smoke-eerie-inverted)",
      },
      backgroundImage: {
        "accent-duo": "var(--accent-duo)",
        "silver-duo-gradient": "var(--silver-duo-gradient)",
      },
      fontFamily: {
        metropolis: ["metropolis", "sans-serif"],
        degular: ["degular", "sans-serif"],
      },
    },
  },
  plugins: [
    function ({
      addVariant,
    }: {
      addVariant: (name: string, selector: string) => void;
    }) {
      addVariant("light", '[theme="light"] &');
      addVariant("dark", '[theme="dark"] &');
    },
  ],
};
