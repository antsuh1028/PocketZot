import { resolve, join } from "node:path";
import { mkdirSync, copyFileSync, readdirSync, statSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function copyContentScripts() {
  return {
    name: "copy-content-scripts",
    closeBundle() {
      const srcDir = resolve(__dirname, "anteaterchar");
      const destDir = resolve(__dirname, "dist/anteaterchar");
      mkdirSync(destDir, { recursive: true });
      const assetsSrc = join(srcDir, "assets");
      const assetsDest = join(destDir, "assets");
      mkdirSync(assetsDest, { recursive: true });
      try {
        if (statSync(assetsSrc).isDirectory()) {
          const assetFiles = readdirSync(assetsSrc);
          assetFiles.forEach((f) => {
            const srcPath = join(assetsSrc, f);
            if (statSync(srcPath).isFile()) {
              copyFileSync(srcPath, join(assetsDest, f));
              console.log(`[PocketZot] copied assets/${f} → dist/anteaterchar/assets/`);
            }
          });
        }
      } catch {
        // assets folder may not exist yet
      }
      const files = [
        "physics.js",
        "stateMachine.js",
        "sprite.js",
        "dragController.js",
        "anteater.js",
        "messageListener.js",
      ];
      files.forEach((f) => {
        copyFileSync(join(srcDir, f), join(destDir, f));
        console.log(`[PocketZot] copied ${f} → dist/anteaterchar/`);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), copyContentScripts()],
  root: "frontend",
  base: "./",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "frontend/pocket_zot.html"),
      },
    },
  },
});
 