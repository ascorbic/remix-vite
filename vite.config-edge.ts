import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { netlifyEdgePlugin } from "./netlify-edge-plugin";
import { posix as path } from "node:path";
import { writeFile, mkdir } from "node:fs/promises";
import { ResolvedVitePluginConfig } from "@remix-run/dev/dist/vite/plugin";

function generateEntrypoint(config: ResolvedVitePluginConfig) {
  const server = path.resolve(config.buildDirectory, "server", "server.js");
  return /* js */ `
    export { default } from "${server}";

    export const config = {
      cache: "manual",
      path: "/*",
      excludedPath: ["/build/*", "/favicon.ico"],
    };`;
}

export default defineConfig({
  plugins: [
    remix({
      buildEnd: async ({ remixConfig }) => {
        const entrypoint = generateEntrypoint(remixConfig);
        await mkdir(path.resolve(".netlify/edge-functions"), {
          recursive: true,
        });
        await writeFile(
          path.resolve(".netlify", "edge-functions", "server.mjs"),
          entrypoint
        );
      },
    }),
    netlifyEdgePlugin(),
    tsconfigPaths(),
  ],
});
