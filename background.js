try {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openTabs' && message.urls) {
      if (message.urls.length > 0) {
        for (const url of message.urls) {
          chrome.tabs.create({ url, active: false });
        }
        sendResponse({ status: 'success', count: message.urls.length });
      } else {
        sendResponse({ status: 'error', message: 'No URLs provided' });
      }
    }
    // Devuelve true para indicar que la respuesta se enviará de forma asíncrona.
    return true;
  });
} catch (e) {
  console.error("Error en el Service Worker:", e);
}
