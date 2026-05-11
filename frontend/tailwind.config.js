/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(0 0% 90%)",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(0 0% 10%)",
        muted: "hsl(0 0% 96%)",
        "muted-foreground": "hsl(0 0% 45%)",
        primary: "hsl(0 0% 10%)",
        "primary-foreground": "hsl(0 0% 100%)",
        destructive: "hsl(0 84% 60%)",
        "destructive-foreground": "hsl(0 0% 100%)",
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px",
      },
    },
  },
  plugins: [],
}
