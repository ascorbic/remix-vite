import type { Plugin } from "vite";
import path from "path";

export function netlifyEdgePlugin(): Plugin {
  let currentCommand: string;
  return {
    name: "vite-plugin-remix-netlify-edge",
    config(config, { command, isSsrBuild }) {
      currentCommand = command;
      // Configure for edge functions
      if (command === "build" && isSsrBuild) {
        const server = path.resolve(config.root ?? "", "server.ts");
        config.ssr = {
          ...config.ssr,
          target: "webworker",
          noExternal: true,
        };
        // We need to add an extra entrypoint, as we need to compile
        // the server entrypoint too. This avoids dealing with node
        // modules in the edge bundler.
        if (typeof config.build?.rollupOptions?.input === "string") {
          config.build.rollupOptions.input = {
            server: server,
            index: config.build.rollupOptions.input,
          };
          if (
            config.build.rollupOptions.output &&
            !Array.isArray(config.build.rollupOptions.output)
          ) {
            config.build.rollupOptions.output.entryFileNames = "[name].js";
          }
        }
      }
    },
    async resolveId(source, importer, options) {
      // Conditionally resolve the server entry based on the command.
      // The Vite dev server uses Node, so we use a different entrypoint
      if (source === "virtual:netlify-server-entry") {
        if (currentCommand === "build" && options.ssr) {
          // This is building for edge functions, so use the edge adapter
          return this.resolve("@netlify/remix-edge-adapter", importer, {
            ...options,
            skipSelf: true,
          });
        } else {
          // This is building for the dev server, so use the Node adapter
          return this.resolve(
            "@remix-run/dev/dist/config/defaults/entry.server.node",
            importer,
            {
              ...options,
              skipSelf: true,
            }
          );
        }
      }
      return null;
    },
  };
}
