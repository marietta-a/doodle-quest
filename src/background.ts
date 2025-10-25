import { generateDoodleAdventure } from "./ai/DoodleQuestAi";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'generateAdventure') {
    (async () => {
      try {
        const progressCallback = (progress: number) => {
          chrome.runtime.sendMessage({ type: 'modelStatus', status: 'downloading', progress });
        };

        chrome.runtime.sendMessage({ type: 'modelStatus', status: 'generating' });

        // --- PASS NEW OPTIONS TO THE AI FUNCTION ---
        const adventureResult = await generateDoodleAdventure(
          {
            pageContent: message.data.text,
            progressCallback: progressCallback,
            language: message.data.language, // New
            difficulty: message.data.difficulty // New
        
          }
        );

        await chrome.storage.session.set({ 
          adventureResult,
          language: message.data.language,
          difficulty: message.data.difficulty 
        });
        await chrome.tabs.create({ url: 'result.html' });

      } catch (e: any) {
        // ... (error handling is the same)
      }
    })();
    return true;
  }
});