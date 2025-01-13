/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-10": "var(--primary-10)",
        "primary-14": "var(--primary-14)",
        "primary-inverted": "var(--primary-inverted)",
        "primary-inverted-10": "var(--primary-inverted-10)",
        "primary-inverted-14": "var(--primary-inverted-14)",
        "primary-inverted-50": "var(--primary-inverted-50)",
        "smoke-eerie": "var(--smoke-eerie)",
        // "smoke-eerie-inverted": "var(--smoke-eerie-inverted)",
        "seasalt-black": "var(--seasalt-black)",
        "platinum-black": "var(--platinum-black)",
        "platinum-black-inverted": "var(--platinum-black-inverted)",
      },
      backgroundImage: {
        "accent-duo": "var(--accent-duo)",
        "silver-duo-gradient": "var(--silver-duo-gradient)",
      },
      boxShadow: {
        neumorphic: "var(--shadow-neumorphic-layered)",
        "shadow-light-dark-soft": "var(--shadow-light-dark-soft)",
      },
      fontFamily: {
        metropolis: ["metropolis", "sans-serif"],
        degular: ["degular", "sans-serif"],
      },
    },
  },
  plugins: [
    // Utilities
    function ({ addUtilities }) {
      addUtilities({
        ".border-gradient": {
          background:
            "linear-gradient(to bottom, var(--battleship-davys-gray),  var(--timberwolf-eerie-black))",
        },
      });
    },
    // Theme variants
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
