/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-inverted": "var(--primary-inverted)",
      },
    },
  },
  plugins: [
    // @ts-ignore
    function ({ addUtilities }) {
      addUtilities({
        ".no-scrollbar": {
          "-ms-overflow-style": "none" /* IE and Edge */,
          "scrollbar-width": "none" /* Firefox */,
        },
        ".text-fill-transparent": {
          "-webkit-text-fill-color": "transparent",
        },
        ".text-shadow-sm": {
          "text-shadow": "0px 0.079px 0.016px rgba(0, 0, 0, 0.08)",
        },
        ".text-shadow-md": {
          "text-shadow": "0px 0.216px 0.043px rgba(0, 0, 0, 0.08)",
        },
        ".text-shadow-lg": {
          "text-shadow": "0px 12px 14.4px rgba(0, 0, 0, 0.15)",
        },
        ".usecases-application-heading": {
          "text-shadow": "0px 4px 24px rgba(0, 0, 0, 0.40)",
        },
        ".bg-text": { "-webkit-background-clip": "text" },
        ".editor-box-shadow": {
          "box-shadow": "0px 0px 90px 0px rgba(255, 255, 255, 0.05)",
        },
        ".gradient-chip": {
          background:
            "radial-gradient(50% 100% at 50% 0%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.00) 100%), rgba(255, 255, 255, 0.15)",
        },
        ".careers-software-bg": {
          background:
            "radial-gradient(67.31% 80.26% at 0% 0%, rgba(37, 166, 249, 0.30) 0%, rgba(37, 166, 249, 0.00) 100%), linear-gradient(0deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.01) 100%), var(--text-default-invert)",
        },
        ".careers-sales-bg": {
          background:
            "radial-gradient(67.31% 80.26% at 0% 0%, rgba(247, 144, 9, 0.30) 0%, rgba(247, 144, 9, 0.00) 100%), linear-gradient(0deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.01) 100%), var(--text-default-invert);",
        },
        ".careers-marketing-bg": {
          background:
            "radial-gradient(67.31% 80.26% at 0% 0%, rgba(247, 209, 88, 0.30) 0%, rgba(247, 209, 88, 0.00) 100%), linear-gradient(0deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.01) 100%), var(--text-default-invert)",
        },
        ".careers-design-bg": {
          background:
            "radial-gradient(67.31% 80.26% at 0% 0%, rgba(238, 70, 188, 0.30) 0%, rgba(238, 70, 188, 0.00) 100%), linear-gradient(0deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.01) 100%), var(--text-default-invert);",
        },
        ".careers-product-bg": {
          background:
            "radial-gradient(67.31% 80.26% at 0% 0%, rgba(151, 71, 255, 0.30) 0%, rgba(151, 71, 255, 0.00) 100%), linear-gradient(0deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.01) 100%), var(--text-default-invert)",
        },
        ".careers-bottom-btn": {
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.00) 100%), linear-gradient(107deg, #25A6F9 -65.15%, #244CF8 90.95%)",
        },
        ".careers-software-heading-bg": {
          background:
            "radial-gradient(39.35% 50% at 50.37% 100%, rgba(37, 166, 249, 0.30) 0%, rgba(37, 166, 249, 0.00) 100%), linear-gradient(0deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.01) 100%), var(--text-default-invert)",
          borderImage:
            "linear-gradient(to right, #2E90FA00, #2E90FA,  #2E90FA00)",
          "border-image-slice": "1",
        },
        ".careers-sales-heading-bg": {
          background:
            "radial-gradient(39.35% 50% at 50.37% 100%, rgba(247, 144, 9, 0.30) 0%, rgba(247, 144, 9, 0.00) 100%), linear-gradient(0deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.01) 100%), var(--text-default-invert);",
          borderImage:
            "linear-gradient(to right, #F7900900, #F79009,  #F7900900)",
          "border-image-slice": "1",
        },
        ".careers-marketing-heading-bg": {
          background:
            "radial-gradient(39.35% 50% at 50.37% 100%, rgba(247, 209, 88, 0.30) 0%, rgba(247, 209, 88, 0.00) 100%), linear-gradient(0deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.01) 100%), var(--text-default-invert)",
          borderImage:
            "linear-gradient(to right, #F7D15800, #F7D158,  #F7D15800)",
          "border-image-slice": "1",
        },
        ".careers-design-heading-bg": {
          background:
            "radial-gradient(39.35% 50% at 50.37% 100%, rgba(238, 70, 188, 0.30) 0%, rgba(238, 70, 188, 0.00) 100%), linear-gradient(0deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.01) 100%), var(--text-default-invert);",
          borderImage:
            "linear-gradient(to right, #EE46BC00, #EE46BC,  #EE46BC00)",
          "border-image-slice": "1",
        },
        ".careers-product-heading-bg": {
          background:
            "radial-gradient(39.35% 50% at 50.37% 100%, rgba(151, 71, 255, 0.30) 0%, rgba(151, 71, 255, 0.00) 100%), linear-gradient(0deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.01) 100%), var(--text-default-invert)",
          borderImage:
            "linear-gradient(to right, #9747FF00, #9747FF,  #9747FF00)",
          "border-image-slice": "1",
        },
        ".careers-founders-office-heading-bg": {
          background:
            "radial-gradient(39.35% 50% at 50.37% 100%, rgba(18, 183, 106, 0.30) 0%, rgba(18, 183, 106, 0.00) 100%), linear-gradient(0deg, rgba(18, 183, 106, 0.01) 0%, rgba(18, 183, 106, 0.01) 100%), var(--text-default-invert)",
          borderImage:
            "linear-gradient(to right, #12B76A00, #12B76A,  #12B76A,#12B76A, #12B76A, #12B76A00)",
          "border-image-slice": "1",
        },
        ".careers-all-heading-bg": {
          background:
            "radial-gradient(39.35% 50% at 50.37% 100%, rgba(var(--default-rgb) , 0.30) 0%, rgba(var(--default-rgb) , 0.00) 100%)",
          borderImage:
            "linear-gradient(to right, rgba(var(--default-rgb) , 0), rgba(var(--default-rgb) , 1),  rgba(var(--default-rgb) , 0))",
          "border-image-slice": "1",
        },
        ".careers-human-resourses-heading-bg": {
          background:
            "radial-gradient(39.35% 50% at 50.37% 100%, rgba(0, 229, 209, 0.30) 0%, rgba(0, 229, 209, 0.00) 100%), linear-gradient(0deg, rgba(0, 229, 209, 0.01) 0%, rgba(0, 229, 209, 0.01) 100%), var(--text-default-invert)",
          borderImage:
            "linear-gradient(to right, #00E5D100, #00E5D1,  #00E5D1,#00E5D1,#00E5D1, #00E5D100)",
          "border-image-slice": "1",
        },
        ".business-hero-tags-gradient": {
          background:
            "radial-gradient(50% 100% at 50% 0%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.00) 100%), rgba(0, 0, 0, 0.55)",
        },
        ".showcase-even-gradient": {
          background: ` linear-gradient(270deg, rgba(8, 8, 8, 0.00) 40%, #080808 100%),
          linear-gradient(270deg, rgba(8, 8, 8, 0.00) 40%, #080808 100%),
          radial-gradient(100% 100% at 50% 0%, rgba(8, 8, 8, 0.00) 59.65%, #080808 100%)`,
        },
        ".showcase-odd-gradient": {
          background: `linear-gradient(270deg, #080808 0%, rgba(8, 8, 8, 0.00) 60%),
          linear-gradient(270deg, #080808 0%, rgba(8, 8, 8, 0.00) 60%),
          radial-gradient(100% 100% at 50% 0%, rgba(8, 8, 8, 0.00) 59.65%, #080808 100%)`,
        },
        ".showcase-mobile-gradient": {
          background: `linear-gradient(180deg, rgba(8, 8, 8, 0.00) 40%, #080808 100%), linear-gradient(180deg, rgba(8, 8, 8, 0.00) 40%, #080808 100%), radial-gradient(100% 100% at 50% 0%, rgba(8, 8, 8, 0.00) 59.65%, #080808 100%)`,
        },
        ".timeline-card": {
          background:
            "radial-gradient(66.85% 66.85% at 50% 0%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.00) 100%), linear-gradient(0deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.01) 100%), #000",
        },
        ".founder-aboutus-card": {
          background:
            "linear-gradient(45deg, rgba(255, 255, 255, 0.00) 0%, #FFF 50%, rgba(255, 255, 255, 0.00) 100%), radial-gradient(50% 50% at 50% 100%, rgba(255, 255, 255, 0.30) 0%, rgba(255, 255, 255, 0.00) 100%), radial-gradient(86.82% 86.82% at 50% 0.91%, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.00) 100%)",
        },
        ".team-card-bg": {
          background:
            "linear-gradient(270deg, #030303 0%, rgba(3, 3, 3, 0.00) 100%)",
        },
        ".walkthrough-bg": {
          background:
            "linear-gradient(360deg, var(--background-default) 0%, rgba(3, 3, 3, 0.00) 100%)",
        },
        ".team-card-img-bg": {
          background:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.00) 60%, rgba(0, 0, 0, 0.60) 100%), linear-gradient(180deg, rgba(0, 0, 0, 0.00) 60%, rgba(0, 0, 0, 0.60) 100%), linear-gradient(180deg, rgba(0, 0, 0, 0.00) 60%, rgba(0, 0, 0, 0.60) 100%)",
        },
        ".careers-border": {
          borderImage:
            "linear-gradient(to right, #33333300, #333333, #333333,  #333333 ,  #333333,  #33333300)",
          "border-image-slice": "1",
        },
        ".top-left-corner-hover": {
          background:
            "linear-gradient(133deg, rgba(20, 20, 20, 0.00) 15.26%, #141414 113.69%)",
        },
        ".top-right-corner-hover": {
          background:
            "  linear-gradient(-133deg, rgba(20, 20, 20, 0.00) 15.26%, #141414 113.69%)",
        },
        ".bottom-right-corner-hover": {
          background:
            "linear-gradient(313deg, rgba(20, 20, 20, 0.00) 15.26%, #141414 113.69%)",
        },
        ".bottom-left-corner-hover ": {
          background:
            "linear-gradient(-313deg, rgba(20, 20, 20, 0.00) 15.26%, #141414 113.69%)",
        },
        ".middle-hover ": {
          background:
            "linear-gradient(180deg, #141414 36.68%, rgba(20, 20, 20, 0.00) 100%)",
        },
        ".product-catalogue-tabs-gradient": {
          background: `radial-gradient(50% 100% at 50% 0%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.00) 100%), rgba(255, 255, 255, 0.08)`,
        },
        ".position-bg": {
          background:
            "radial-gradient(50% 100% at 50% 0%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.00) 100%), rgba(255, 255, 255, 0.05)",
        },
        ".partner-shadow": {
          boxShadow: "0px 0px 90px 0px rgba(255, 255, 255, 0.05)",
        },
        ".catalogue-application": {
          background: "var(--catalogue-application)",
        },
        ".testomonial-bg-gradient": {
          background: "var(--testomonial-bg-gradient)",
        },
        ".testomonial-border-gradient": {
          background:
            "radial-gradient(50% 50% at 50% 100%, rgba(255, 255, 255, 0.30) 0%, var(--border-light) 100%), radial-gradient(86.82% 86.82% at 50% 0.91%, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.00) 100%)",
        },
        ".home-hero-capsule": {
          background:
            "radial-gradient(50% 100% at 50% 0%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.00) 100%), rgba(255, 255, 255, 0.01)",
        },
        ".home-hero-capsule-hover": {
          background:
            "radial-gradient(50% 100% at 50% 0%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.00) 100%), rgba(255, 255, 255, 0.01)",
        },
        ".editor-capsule-bg": {
          background:
            "radial-gradient(50% 100% at 50% 0%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.00) 100%), linear-gradient(0deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.01) 100%), #080808;",
        },
        ".usecases-application-bg": {
          background:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.00) 50%, rgba(0, 0, 0, 0.40) 100%), radial-gradient(50% 50% at 50% 50%, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.20) 100%)",
        },
        ".usecases-application-card-bg": {
          background:
            "linear-gradient(0deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.01) 100%), rgba(0, 0, 0, 0.6)",
        },
        ".usecases-application-card-bg:hover": {
          background:
            "linear-gradient(0deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.01) 100%), rgba(0, 0, 0, 0.8)",
        },
        ".platform-feature-one": {
          background:
            "radial-gradient(141.42% 141.42% at 100% 100%, rgba(37, 83, 248, 0.40) 0%, rgba(37, 173, 249, 0.00) 58.56%), linear-gradient(0deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.01) 100%), #000",
        },
        ".platform-feature-two": {
          background:
            "radial-gradient(113.26% 141.42% at 0% 100%, rgba(37, 83, 248, 0.40) 0%, rgba(37, 173, 249, 0.00) 58.56%), linear-gradient(0deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.01) 100%), #000",
        },
        ".platform-feature-three": {
          background:
            "radial-gradient(128.24% 138.61% at 95.98% 0%, rgba(37, 83, 248, 0.40) 0%, rgba(37, 173, 249, 0.00) 64.24%), linear-gradient(0deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.01) 100%), #000",
        },
        ".platform-feature-four": {
          background:
            "radial-gradient(148.98% 141.42% at 0% 0%, rgba(37, 83, 248, 0.40) 0%, rgba(37, 173, 249, 0.00) 58.56%), linear-gradient(0deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.01) 100%), #000",
        },
        ".platform-key-features": {
          background:
            "linear-gradient(0deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.01) 100%), #000",
          boxShadow:
            "0px 0px 95px 0px rgba(255, 255, 255, 0.10) inset, 0px 0px 250px 0px rgba(255, 255, 255, 0.03)",
        },
        ".leaderboard-gradient": {
          background:
            "radial-gradient(19.38% 30.19% at 50% 100%, rgba(37, 173, 249, 0.50) 0%, rgba(36, 76, 248, 0.00) 100%), radial-gradient(25.7% 31.67% at 50% 100%, rgba(36, 76, 248, 0.40) 0%, rgba(36, 76, 248, 0.00) 100%), radial-gradient(45.55% 56.11% at 50% 100%, rgba(37, 173, 249, 0.60) 0%, rgba(36, 76, 248, 0.00) 100%), transparent",
        },
        ".leaderboard-profile": {
          border: "0.8px solid rgba(255, 255, 255, 0.40)",
          boxShadow:
            "0px 0px 102.4px 0px rgba(255, 255, 255, 0.25), 0px 0px 38.4px 0px rgba(0, 0, 0, 0.06)",
        },
        ".leaderboard-second": {
          border: "3.2px solid rgba(255, 255, 255, 0.40)",
          boxShadow: "0px 0px 46.08px 0px rgba(0, 0, 0, 0.06)",
        },
        ".platform-community": {
          background:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.00) 100%), radial-gradient(50% 50% at 50% 50%, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.40) 100%), url('https://ctruhcdn.azureedge.net/main-webiste/public/images/platform/91f4ccdbb152507da306c3dd2d56c7c0.jpeg') lightgray 50% / cover no-repeat",
        },
        ".platform-cta-gradient": {
          background:
            " radial-gradient(20.71% 32.25% at 50% -0.09%, rgba(37, 173, 249, 0.50) 0%, rgba(36, 76, 248, 0.00) 100%), radial-gradient(33.59% 41.38% at 50% -0.09%, rgba(36, 76, 248, 0.40) 0%, rgba(36, 76, 248, 0.00) 100%), radial-gradient(65.55% 80.75% at 50% -0.09%, rgba(37, 173, 249, 0.60) 0%, rgba(36, 76, 248, 0.00) 100%), var(--background-default)",
        },
        ".why-ctruh-gradient-hover": {
          background:
            "linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%), #1A1A1A",
        },
        ".card-one-data-bg": {
          background:
            "linear-gradient(0deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.01) 100%), #000",
        },
        ".product-active": {
          background:
            "radial-gradient(50% 100% at 50.62% 100%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.00) 100%)",
        },

        ".key-feature-one": {
          background:
            "radial-gradient(20.71% 32.25% at 50% -0.09%, rgba(37, 173, 249, 0.50) 0%, rgba(36, 76, 248, 0.00) 100%), radial-gradient(33.59% 41.38% at 50% -0.09%, rgba(36, 76, 248, 0.40) 0%, rgba(36, 76, 248, 0.00) 100%), radial-gradient(65.55% 80.75% at 50% -0.09%, rgba(37, 173, 249, 0.60) 0%, rgba(36, 76, 248, 0.00) 100%)",
        },
        ".key-feature-three": {
          background:
            " radial-gradient(28.29% 28.82% at 100% 0%, rgba(255, 255, 255, 0.50) 0%, rgba(255, 255, 255, 0.00) 100%), radial-gradient(88.19% 70.71% at 100% 0%, rgba(255, 255, 255, 0.40) 0%, rgba(255, 255, 255, 0.00) 100%), radial-gradient(139.73% 110.73% at 100% 0%, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.00) 100%)",
        },
        ".key-feature-four": {
          background:
            " radial-gradient(28.29% 28.82% at 100% 0%, rgba(255, 202, 59, 0.50) 0%, rgba(255, 202, 59, 0.00) 100%), radial-gradient(88.19% 70.71% at 100% 0%, rgba(255, 202, 59, 0.40) 0%, rgba(255, 202, 59, 0.00) 100%), radial-gradient(139.73% 110.73% at 100% 0%, rgba(255, 202, 59, 0.60) 0%, rgba(255, 202, 59, 0.00) 100%)",
        },
        ".key-feature-five-two": {
          background:
            " linear-gradient(0deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.01) 100%), #000",
          boxShadow:
            "0px 0px 95px 0px rgba(255, 255, 255, 0.10) inset, 0px 0px 250px 0px rgba(255, 255, 255, 0.03)",
        },
        ".key-feature-six": {
          background:
            " radial-gradient(20.71% 32.25% at 50% -0.09%, rgba(37, 173, 249, 0.50) 0%, rgba(36, 76, 248, 0.00) 100%), radial-gradient(33.59% 41.38% at 50% -0.09%, rgba(36, 76, 248, 0.40) 0%, rgba(36, 76, 248, 0.00) 100%), radial-gradient(65.55% 80.75% at 50% -0.09%, rgba(37, 173, 249, 0.60) 0%, rgba(36, 76, 248, 0.00) 100%)",
        },
        ".border-gradient": {
          background:
            "linear-gradient(to bottom, var(--border-blend-start),  var(--border-blend-end))",
        },
        ".immersifyd-cta": {
          background:
            "linear-gradient(90deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.20) 100%), rgba(255, 255, 255, 0.10)",
        },
        ".industry-gallery-image-gradient": {
          background: `radial-gradient(61.61% 23.88% at 50% 0%, rgba(255, 255, 255, 0.30) 0%, rgba(255, 255, 255, 0.00) 100%), radial-gradient(50% 50% at 50% 50%, rgba(8, 8, 8, 0.00) 0%, rgba(8, 8, 8, 0.20) 100%), linear-gradient(180deg, rgba(8, 8, 8, 0.00) 50%, #080808 100%)`,
        },
        ".industry-card-fade-gradient-start": {
          background:
            "linear-gradient(270deg, rgba(8, 8, 8, 0.00) 0%, #080808 100%), radial-gradient(50% 50% at 50% 50%, rgba(8, 8, 8, 0.00) 0%, rgba(8, 8, 8, 0.20) 100%), linear-gradient(180deg, rgba(8, 8, 8, 0.00) 50%, #080808 100%)",
        },
        ".industry-card-fade-gradient-end": {
          background:
            "linear-gradient(270deg, #080808 0%, rgba(8, 8, 8, 0.00) 100%), radial-gradient(50% 50% at 50% 50%, rgba(8, 8, 8, 0.00) 0%, rgba(8, 8, 8, 0.20) 100%), linear-gradient(180deg, rgba(8, 8, 8, 0.00) 50%, #080808 100%)",
        },
        ".home-announcement-chip": {
          background: "var(--announcement-chip)",
        },
        ".home-top-select": {
          background:
            "radial-gradient(68.63% 189.8% at 101.61% -1.98%, #FD1638 0%, rgba(254, 20, 57, 0.00) 100%), radial-gradient(68.63% 189.8% at 101.61% -1.98%, #FD1638 0%, rgba(254, 20, 57, 0.00) 100%), #FF6801",
          boxShadow: "0px 0px 16px 0px rgba(255, 104, 1, 0.48)",
          textShadow: "0px 0px 4px rgba(255, 255, 255, 0.35)",
        },
        ".home-platform-chip-border": {
          background:
            "radial-gradient(46.41% 74.04% at 50% 0%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.00) 100%), rgba(255, 255, 255, 0.06)",
        },
      });
    },
    function ({
      addVariant,
    }: {
      addVariant: (name: string, selector: string) => void,
    }) {
      addVariant("theme-light", '[data-theme="light"] &');
      addVariant("theme-dark", '[data-theme="dark"] &');
    },
  ],
};
