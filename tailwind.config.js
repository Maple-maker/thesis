/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Backgrounds & surfaces (Daylight)
        bg: {
          DEFAULT: "#F3F5F1",
          surface: "#FFFFFF",
          surface2: "#F7F9F5",
          subtle: "#EDF0EB",
        },
        // Text inks
        ink: {
          DEFAULT: "#16201C",
          2: "#4D5A54",
          3: "#8C988F",
        },
        // Lines
        line: {
          DEFAULT: "#EAEDE8",
          strong: "#D6DBD4",
        },
        // Track (progress / range slider)
        track: "#EDF0EB",
        // Brand
        brand: {
          DEFAULT: "#0E7A66",
          ink: "#FFFFFF",
          bg: "#D5E4DF",
          deep: "#06483C",
        },
        // Accent — amber
        amber: {
          DEFAULT: "#D98512",
          bg: "#FCF1E0",
        },
        // Accent — violet
        violet: {
          DEFAULT: "#7C3AED",
          bg: "#F2ECFD",
        },
        // Positive / good
        pos: {
          DEFAULT: "#149059",
          ink: "#0C5836",
          bg: "#E5F5EC",
          line: "#BDE6CE",
        },
        // Negative / bad
        neg: {
          DEFAULT: "#D8472C",
          ink: "#8F2A18",
          bg: "#FBEAE5",
          line: "#F2C9BE",
        },
      },
      fontFamily: {
        // Body family (Plus Jakarta Sans)
        sans: ["PlusJakartaSans_400Regular"],
        sansMd: ["PlusJakartaSans_500Medium"],
        sansSb: ["PlusJakartaSans_600SemiBold"],
        sansBold: ["PlusJakartaSans_700Bold"],
        sansX: ["PlusJakartaSans_800ExtraBold"],
        // Display alias (Daylight theme uses Jakarta for display too)
        display: ["PlusJakartaSans_700Bold"],
        displayX: ["PlusJakartaSans_800ExtraBold"],
        // Mono for tickers + numerics (2 weights loaded at startup)
        mono: ["SplineSansMono_400Regular"],
        monoMd: ["SplineSansMono_400Regular"],
        monoSb: ["SplineSansMono_700Bold"],
        monoBold: ["SplineSansMono_700Bold"],
      },
      borderRadius: {
        chip: "11px",
        card: "20px",
        sheet: "28px",
      },
    },
  },
  plugins: [],
};
