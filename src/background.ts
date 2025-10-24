import { generateDoodleAdventure } from "./ai/DoodleQuestAi";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'generateAdventure') {
    (async () => {
      try {
        const progressCallback = (progress: number) => {
          chrome.runtime.sendMessage({ type: 'modelStatus', status: 'downloading', progress });
        };

        chrome.runtime.sendMessage({ type: 'modelStatus', status: 'generating' });

        const adventureResult = await generateDoodleAdventure(
          message.data.text,
          // message.data.imageDataUrl,
          progressCallback
        );

        await chrome.storage.session.set({ adventureResult });
        await chrome.tabs.create({ url: 'result.html' });

      } catch (e: any) {
        chrome.runtime.sendMessage({
          type: 'modelStatus', status: 'error',
          message: e.message || "An unknown AI error occurred."
        });
      }
    })();
    return true; // Keep message channel open for async operations
  }
});