import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./node_modules/@an-sdk/react/dist/**/*.{js,mjs}"],
  theme: { extend: {} },
  plugins: [],
}

export default config
