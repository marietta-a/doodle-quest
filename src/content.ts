(async () => {
  async function getImageAsBase64(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      const blob = await response.blob();
      return new Promise((r) => { const reader = new FileReader(); reader.onloadend = () => r(reader.result as string); reader.readAsDataURL(blob); });
    } catch (e) { console.error(e); return null; }
  }

  const pageText = document.body.innerText;
  let bestImageUrl: string | null = null;
  for (const img of Array.from(document.querySelectorAll('img'))) {
    if (img.naturalWidth > 200 && img.naturalHeight > 200 && img.src) {
      bestImageUrl = img.src;
      break;
    }
  }
  const imageDataUrl = bestImageUrl ? await getImageAsBase64(bestImageUrl) : null;
  return { text: pageText, imageDataUrl: imageDataUrl };
})();