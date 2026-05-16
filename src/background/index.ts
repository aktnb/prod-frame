/// <reference types="chrome" />

import type { StorageData } from "../types";

const STORAGE_KEY = "prodFrameData";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(STORAGE_KEY, (result) => {
    if (!result[STORAGE_KEY]) {
      const initial: StorageData = { rules: [] };
      chrome.storage.sync.set({ [STORAGE_KEY]: initial });
    }
  });
});
