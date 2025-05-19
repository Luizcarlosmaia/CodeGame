/// <reference types="node" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pkg = require("./package.json");

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(pkg.version),
  },
});
