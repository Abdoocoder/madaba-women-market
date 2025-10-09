/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media", // ✅ يتحول تلقائيًا حسب إعداد النظام (dark/light)
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        // 🎨 الوضع الفاتح
        primary: "#C2703D",      // فخار دافئ
        secondary: "#E3A6A1",    // وردي ترابي
        accent: "#7CB7A8",       // فيروزي باهت
        background: "#F8F5F2",   // رملي فاتح
        foreground: "#3F3F3F",   // رمادي غامق للنصوص
        muted: "#A18C7C",        // رمادي دافئ للنصوص الثانوية

        // 🌙 الوضع الغامق
        dark: {
          primary: "#E2B893",     // أفتح قليلًا لإبراز العناصر
          secondary: "#D68F8A",
          accent: "#8EC8BB",
          background: "#1C1A19",
          foreground: "#F4EDE6",
          muted: "#7A6C61",
        },
      },
      fontFamily: {
        sans: ['"Noto Sans Arabic"', "ui-sans-serif", "system-ui"],
        display: ['"Playfair Display"', "serif"],
      },
      boxShadow: {
        soft: "0 2px 10px rgba(0, 0, 0, 0.05)",
        card: "0 4px 20px rgba(0, 0, 0, 0.08)",
      },
      borderRadius: {
        xl: "1rem",
        '2xl': "1.5rem",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
};
