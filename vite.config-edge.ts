import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { netlifyEdgePlugin } from "./netlify-edge-plugin";

export default defineConfig({
  plugins: [remix(), netlifyEdgePlugin(), tsconfigPaths()],
});
