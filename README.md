# Mi compra — PWA

Lista de la compra para el móvil: apunta productos, indica cantidades y tacha lo
que ya has metido en el carro. Funciona sin conexión y se puede instalar como
una aplicación.

Hecha con HTML, CSS y JavaScript sin frameworks, sin dependencias y sin
herramientas de compilación. Se puede publicar tal cual en GitHub Pages.

## Estructura

```
mi_compra_pwa/
├── index.html              Estructura de la pantalla
├── styles.css              Estilos (tema claro y oscuro)
├── app.js                  Lógica, persistencia y registro del service worker
├── manifest.webmanifest    Datos para instalar la app
├── sw.js                   Service worker (funcionamiento sin conexión)
├── .nojekyll               Evita el procesado de Jekyll en GitHub Pages
├── README.md
└── icons/
    ├── icon.svg                    Icono fuente (editable)
    ├── icon-192.png                Icono 192 × 192
    ├── icon-512.png                Icono 512 × 512
    ├── icon-maskable.svg           Icono fuente para Android (maskable)
    ├── icon-maskable-512.png       Icono maskable 512 × 512
    └── apple-touch-icon-180.png    Icono para iOS
```

## Probar en local

El service worker y el manifest **no funcionan abriendo `index.html` con doble
clic** (`file://`). Hace falta un servidor local, aunque sea muy sencillo.

### Windows

**Opción A — servidor de Python** (recomendada si tienes Python instalado):

```bat
py -m http.server 8000
```

Si el comando `py` no existe, prueba con:

```bat
python -m http.server 8000
```

Después abre <http://localhost:8000> en el navegador.

**Opción B — Live Server de VS Code**:

1. Instala la extensión **Live Server** en VS Code.
2. Haz clic derecho sobre `index.html` y elige **Open with Live Server**.
3. Se abre el navegador en una dirección parecida a <http://127.0.0.1:5500>.

### Linux y macOS

```bash
python3 -m http.server 8000
```

Después abre <http://localhost:8000> en el navegador.

> En ambos casos, para parar el servidor pulsa `Ctrl + C` en la terminal.

## Probar sin conexión

1. Abre la app con el servidor local y espera a que cargue del todo (la primera
   visita es la que guarda los ficheros en caché).
2. En Chrome o Edge, abre **DevTools** (`F12`), ve a **Application → Service
   Workers** y comprueba que aparece registrado y activado.
3. Activa la casilla **Offline** y recarga la página: la app debe seguir
   funcionando y conservar la lista.

Durante el desarrollo, si cambias un fichero y no ves los cambios, marca
**Update on reload** en esa misma pantalla o desregistra el service worker.

## Comprobar que es instalable

1. Abre la app en Chrome o Edge (`http://localhost:8000` o la URL publicada).
2. Abre **DevTools → Application → Manifest**. Debe aparecer el nombre
   «Mi compra», `display: standalone` y los iconos de 192 y 512 px, sin errores.
3. En **Application → Service Workers** el service worker debe estar
   **activated and is running**.
4. En la barra de direcciones de Chrome aparece el botón **Instalar** (un icono
   de pantalla con una flecha). También está en el menú **⋮ → Instalar
   «Mi compra»**. Al pulsarlo, la app se abre en su propia ventana.

> El navegador solo permite instalar la app en `https` o en `localhost`.

## Publicar en GitHub Pages

1. Sube el proyecto a un repositorio de GitHub.
2. En el repositorio, entra en **Settings → Pages**.
3. En **Source** elige **Deploy from a branch**, la rama `main` y la carpeta
   `/ (root)`. Guarda.
4. Espera un momento y abre `https://TU-USUARIO.github.io/TU-REPOSITORIO/`.

Todas las rutas del proyecto son relativas (`./`), así que funciona igual en la
raíz de un dominio que en una subcarpeta como la de GitHub Pages.

## Actualizar la app

Los ficheros se guardan en caché, así que después de modificar el código hay
que cambiar la versión en `sw.js`:

```js
const VERSION_CACHE = "mi-compra-v2";
```

Al subir ese número, el navegador descarga los ficheros nuevos y borra la caché
antigua.

## Criterios de aceptación

- [ ] No se puede añadir un producto vacío.
- [ ] Marcar un producto lo tacha y lo envía al final; volver a tocarlo lo
      devuelve a pendientes.
- [ ] El contador se actualiza al añadir, marcar y borrar.
- [ ] «Borrar comprados» elimina solo los marcados.
- [ ] Al cerrar y reabrir la app, la lista sigue igual.
- [ ] Con la lista vacía se ve el mensaje correspondiente.

## Notas para el alumnado

- **Colores y tamaños**: variables al principio de `styles.css`. El tema oscuro
  se define en el bloque `@media (prefers-color-scheme: dark)`.
- **Textos de la pantalla**: en `index.html`. Los mensajes que genera la lógica
  (contador, errores, etiquetas de accesibilidad) están en `app.js`.
- **Datos guardados**: clave `mi-compra.lista.v1` en `localStorage`, con la
  lista en formato JSON.
- **Iconos**: se editan los `.svg` de `icons/` y se vuelven a exportar los PNG.
- **Cantidad**: entero entre 1 y 99; el nombre admite hasta 60 caracteres.
