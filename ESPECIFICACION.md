# Especificación: «Mi compra», lista de la compra

## 1. Concepto
Una aplicación sencilla para apuntar lo que hay que comprar y tachar los productos a medida que se meten en el carro. Debe poder usarse con una sola mano en el móvil y funcionar sin conexión a Internet.

## 2. Funcionalidades
1. **Añadir producto.** Un campo de texto y un botón «Añadir». No se permiten nombres vacíos ni formados solo por espacios. Al añadir, el campo se vacía.
2. **Cantidad (opcional).** Cada producto puede tener una cantidad (número entero ≥ 1, por defecto 1) que se muestra junto al nombre, por ejemplo «Leche ×2».
3. **Marcar como comprado.** Al tocar un producto, cambia entre pendiente y comprado. Los comprados se muestran tachados y en un color más apagado, y pasan al final de la lista.
4. **Borrar un producto** con un botón de papelera en cada fila.
5. **Borrar los comprados** con un botón que elimina de golpe todos los productos marcados. Solo está activo si hay alguno.
6. **Contador** visible con el número de productos pendientes, por ejemplo «3 pendientes».
7. **Lista vacía.** Si no hay productos, se muestra un mensaje del tipo «Tu lista está vacía. Añade el primer producto».
8. **Persistencia.** La lista se conserva al cerrar y volver a abrir la aplicación.

## 3. Modelo de datos
Cada producto tiene:
- `id`: identificador único
- `nombre`: texto
- `cantidad`: entero ≥ 1
- `comprado`: booleano

## 4. Interfaz
- Una sola pantalla: arriba el título «Mi compra» y el contador, debajo el formulario para añadir y después la lista.
- Textos de la interfaz en español.
- Diseño limpio y legible en el móvil, con zonas táctiles cómodas (mínimo unos 48 px o 48 dp).
- Modo claro y modo oscuro según la configuración del sistema.

## 5. Requisitos no funcionales
- Código sencillo y comentado en español, pensado para que lo lea alumnado de 2º DAM.
- Sin dependencias innecesarias.
- Accesible: etiquetas en los botones de solo icono (papelera), buen contraste.

## 6. Fuera del alcance
Usuarios, sincronización entre dispositivos, varias listas, categorías, precios.

## 7. Criterios de aceptación
- [ ] No se puede añadir un producto vacío.
- [ ] Marcar un producto lo tacha y lo envía al final; volver a tocarlo lo devuelve a pendientes.
- [ ] El contador se actualiza al añadir, marcar y borrar.
- [ ] «Borrar comprados» elimina solo los marcados.
- [ ] Al cerrar y reabrir la app, la lista sigue igual.
- [ ] Con la lista vacía se ve el mensaje correspondiente.

---

## Anexo A: versión PWA
- HTML, CSS y JavaScript sin frameworks ni herramientas de compilación.
- Estructura: `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, `sw.js` y una carpeta `icons/`.
- Persistencia con `localStorage`.
- Instalable: manifest con nombre, colores e iconos de 192 y 512 px; `display: standalone`.
- Funciona sin conexión: el service worker guarda en caché los ficheros de la app.
- Debe poder publicarse tal cual en GitHub Pages (rutas relativas).

## Anexo B: versión Android
- Kotlin y Jetpack Compose con Material 3, partiendo de la plantilla «Empty Activity» de Android Studio.
- Estado con `remember` y `mutableStateListOf` en esta primera versión (más adelante se refactorizará a ViewModel).
- La lista con `LazyColumn`.
- Persistencia sencilla con DataStore, guardando la lista como JSON; sin Room.
- Textos en `strings.xml`.
