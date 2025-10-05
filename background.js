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

  // Abre el Side Panel al hacer clic en el icono de la extensión
  chrome.action.onClicked.addListener(async (tab) => {
    try {
      if (chrome.sidePanel && chrome.sidePanel.open) {
        await chrome.sidePanel.open({ windowId: tab.windowId });
      }
    } catch (e) {
      console.error('No se pudo abrir el Side Panel desde action click:', e);
    }
  });

  // Configura el Side Panel cuando se instala/actualiza la extensión
  chrome.runtime.onInstalled.addListener(async () => {
    try {
      if (chrome.sidePanel && chrome.sidePanel.setOptions) {
        await chrome.sidePanel.setOptions({ path: 'index.html', enabled: true });
      }
    } catch (e) {
      console.error('No se pudo configurar el Side Panel en onInstalled:', e);
    }
  });
} catch (e) {
  console.error("Error en el Service Worker:", e);
}
