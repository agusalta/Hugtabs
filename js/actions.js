export function openMany(urls) {
  return new Promise((resolve, reject) => {
    if (!chrome.runtime || !chrome.runtime.sendMessage) {
      // Fallback para cuando no se ejecuta como extensión
      console.warn("No se puede acceder a la API de Chrome. Abriendo pestañas con window.open().");
      let openedCount = 0;
      for (const url of urls) {
        window.open(url, '_blank', 'noopener,noreferrer');
        openedCount++;
      }
      if (openedCount > 0) {
        resolve(openedCount);
      } else {
        reject(new Error("No se pudieron abrir las pestañas."));
      }
      return;
    }

    chrome.runtime.sendMessage({ action: 'openTabs', urls }, (response) => {
      if (chrome.runtime.lastError) {
        // Error en la comunicación
        console.error('Error enviando mensaje al service worker:', chrome.runtime.lastError.message);
        return reject(new Error(chrome.runtime.lastError.message));
      }

      if (response && response.status === 'success') {
        resolve(response.count);
      } else {
        const errorMessage = response ? response.message : 'Respuesta inválida del service worker.';
        console.error(errorMessage);
        reject(new Error(errorMessage));
      }
    });
  });
}
