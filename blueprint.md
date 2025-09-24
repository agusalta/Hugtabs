# Blueprint: Checkmate URL Shortener

## Descripción

Checkmate es un acortador de URLs simple y efectivo que utiliza Firebase para almacenar y gestionar las URLs. La aplicación permite a los usuarios añadir nuevas URLs y ver una lista de las URLs acortadas.

## Estilos y Diseño

La aplicación utiliza un diseño limpio y moderno con los siguientes elementos:

*   **Paleta de colores:** Se utiliza una paleta de colores simple con un color primario para los elementos interactivos.
*   **Tipografía:** Se utiliza una fuente clara y legible para todo el texto.
*   **Layout:** El layout es simple y fácil de navegar, con un formulario para añadir nuevas URLs y una tabla para mostrar las URLs existentes.

## Funcionalidades

*   **Añadir URLs:** Los usuarios pueden añadir nuevas URLs a través de un formulario simple.
*   **Ver URLs:** Las URLs añadidas se muestran en una tabla con la URL original y la URL acortada.
*   **Notificaciones:** Se muestran notificaciones (toasts) para informar al usuario sobre el resultado de sus acciones.

## Plan de Acción

1.  **Actualizar `main.js`:**
    *   Reemplazar el código existente con la nueva sintaxis modular de Firebase (v9+).
    *   Utilizar la configuración de Firebase proporcionada por el usuario.
    *   Reimplementar la lógica para añadir y mostrar URLs utilizando Firestore.
2.  **Actualizar `index.html`:**
    *   Eliminar los scripts de la versión 8 de Firebase.
    *   Añadir los nuevos scripts modulares de Firebase desde el CDN.
    *   Asegurarse de que `main.js` se carga como un módulo (`type="module"`).
3.  **Configurar el entorno de desarrollo:**
    *   Actualizar `.idx/mcp.json` para habilitar el servidor de Firebase.
