// popup.js
document.getElementById('createBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Execute a script on the page to get its content
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getPageContent,
  }, (injectionResults) => {
    const pageData = injectionResults[0].result;
    // Now send this pageData to your background script to process with Gemini
    chrome.runtime.sendMessage({ type: 'generateStory', data: pageData });
  });
});

// This function will be injected into the target webpage
function getPageContent() {
  // A simple way to get the main readable text
  const mainContent = document.body.innerText.substring(0, 2000); // Limit length
  // In a real app, you'd have a way for the user to select an image
  const firstImageUrl = document.querySelector('img')?.src;
  return { text: mainContent, imageUrl: firstImageUrl };
}