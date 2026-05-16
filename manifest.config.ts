import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
  manifest_version: 3,
  name: "__MSG_appName__",
  description: "__MSG_appDescription__",
  default_locale: "ja",
  version: pkg.version,
  action: {
    default_popup: "src/popup/popup.html",
    default_icon: "images/icon-128.png",
  },
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/index.ts"],
    },
  ],
  permissions: ["storage"],
  icons: {
    "128": "images/icon-128.png",
  },
});
