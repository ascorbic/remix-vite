import { unstable_vitePlugin as remix } from "@remix-run/dev";
import type { ResolvedVitePluginConfig } from "@remix-run/dev/dist/vite/plugin";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { posix as path } from "node:path";
import { writeFile, mkdir } from "node:fs/promises";

function generateEntrypoint(config: ResolvedVitePluginConfig) {
  const server = path.resolve(
    config.buildDirectory,
    "server",
    config.serverBuildFile
  );
  return /* js */ `
    import { createRequestHandler } from "https://esm.sh/@netlify/remix-edge-adapter";
    import * as build from "${server}";
    export default createRequestHandler({
      build,
    });

    export const config = {
      path: "/*",
      cache: "manual",
      excludedPath: ["/build/*", "/favicon.ico"],
    }`;
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
    tsconfigPaths(),
  ],
  ssr: {
    target: "webworker",
    noExternal: true,
  },
});
