"use strict";

/* =========================================================
   «Mi compra» — lógica de la aplicación
   ---------------------------------------------------------
   La app guarda la lista en localStorage con esta forma:
     [{ id, nombre, cantidad, comprado }, ...]
   Cada vez que la lista cambia se guarda y se vuelve a pintar.
   ========================================================= */

/* ---------- Constantes ---------- */

const CLAVE_ALMACEN = "mi-compra.lista.v1";
const CANTIDAD_MINIMA = 1;
const CANTIDAD_MAXIMA = 99;
const LONGITUD_MAXIMA_NOMBRE = 60;

/* ---------- Elementos del HTML ---------- */

const formulario = document.querySelector("#form-add");
const campoNombre = document.querySelector("#nombre");
const campoCantidad = document.querySelector("#cantidad");
const mensajeError = document.querySelector("#error");
const contador = document.querySelector("#contador");
const lista = document.querySelector("#lista");
const mensajeVacio = document.querySelector("#vacio");
const botonBorrarComprados = document.querySelector("#borrar-comprados");
const plantillaFila = document.querySelector("#fila");

/* ---------- Estado ---------- */

/**
 * Lista de productos en memoria.
 * @type {Array<{id: string, nombre: string, cantidad: number, comprado: boolean}>}
 */
let productos = [];

/* =========================================================
   Persistencia (localStorage)
   ========================================================= */

/** Lee la lista guardada. Si hay datos corruptos, devuelve solo lo válido. */
function cargar() {
  try {
    const guardado = localStorage.getItem(CLAVE_ALMACEN);
    if (!guardado) {
      return [];
    }

    const datos = JSON.parse(guardado);
    if (!Array.isArray(datos)) {
      return [];
    }

    return datos.filter(esProductoValido).map(normalizarProducto);
  } catch (error) {
    console.warn("No se pudo leer la lista guardada:", error);
    return [];
  }
}

/** Guarda la lista completa en localStorage. */
function guardar() {
  try {
    localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(productos));
  } catch (error) {
    // Por ejemplo, si el navegador no permite almacenar datos.
    console.warn("No se pudo guardar la lista:", error);
  }
}

/** Comprueba que un objeto leído de localStorage tiene lo mínimo necesario. */
function esProductoValido(producto) {
  return (
    producto !== null &&
    typeof producto === "object" &&
    typeof producto.nombre === "string" &&
    producto.nombre.trim() !== ""
  );
}

/** Corrige los valores de un producto leído para que cumplan el modelo de datos. */
function normalizarProducto(producto) {
  return {
    id: producto.id ? String(producto.id) : crearId(),
    nombre: producto.nombre.trim().slice(0, LONGITUD_MAXIMA_NOMBRE),
    cantidad: limitarCantidad(producto.cantidad),
    comprado: producto.comprado === true,
  };
}

/** Convierte un valor en un entero entre CANTIDAD_MINIMA y CANTIDAD_MAXIMA. */
function limitarCantidad(valor) {
  const numero = Number.parseInt(valor, 10);
  if (!Number.isFinite(numero)) {
    return CANTIDAD_MINIMA;
  }
  return Math.min(CANTIDAD_MAXIMA, Math.max(CANTIDAD_MINIMA, numero));
}

/** Crea un identificador único. randomUUID no existe en navegadores muy antiguos. */
function crearId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

/* =========================================================
   Operaciones sobre la lista
   ========================================================= */

/** Añade un producto pendiente al final de la lista. */
function anadir(nombre, cantidad) {
  productos.push({
    id: crearId(),
    nombre,
    cantidad,
    comprado: false,
  });
  guardar();
  render();
}

/** Cambia un producto entre pendiente y comprado. */
function alternar(id) {
  const producto = productos.find((p) => p.id === id);
  if (!producto) {
    return;
  }
  producto.comprado = !producto.comprado;
  guardar();
  render();
}

/** Elimina un producto concreto. */
function borrar(id) {
  productos = productos.filter((p) => p.id !== id);
  guardar();
  render();
}

/** Elimina de golpe todos los productos marcados como comprados. */
function borrarComprados() {
  productos = productos.filter((p) => !p.comprado);
  guardar();
  render();
}

/* =========================================================
   Pintar la interfaz
   ========================================================= */

/** Vuelve a dibujar la lista, el contador y el estado vacío. */
function render() {
  const pendientes = productos.filter((p) => !p.comprado);
  const comprados = productos.filter((p) => p.comprado);

  // Primero los pendientes y después los comprados, cada grupo en orden de creación.
  const ordenados = pendientes.concat(comprados);

  lista.replaceChildren();
  const fragmento = document.createDocumentFragment();
  for (const producto of ordenados) {
    fragmento.appendChild(crearFila(producto));
  }
  lista.appendChild(fragmento);

  // Mensaje de lista vacía
  mensajeVacio.hidden = productos.length > 0;

  // Contador en singular o plural
  contador.textContent =
    pendientes.length === 1 ? "1 pendiente" : `${pendientes.length} pendientes`;

  // «Borrar comprados» solo se puede pulsar si hay comprados
  botonBorrarComprados.disabled = comprados.length === 0;
}

/** Crea el elemento <li> de un producto a partir de la plantilla. */
function crearFila(producto) {
  const fila = plantillaFila.content.firstElementChild.cloneNode(true);
  fila.dataset.id = producto.id;
  fila.classList.toggle("comprada", producto.comprado);

  const botonAlternar = fila.querySelector(".alternar");
  botonAlternar.setAttribute("aria-pressed", String(producto.comprado));
  botonAlternar.setAttribute(
    "aria-label",
    `${producto.nombre}, cantidad ${producto.cantidad}`
  );

  fila.querySelector(".nombre").textContent = producto.nombre;
  fila.querySelector(".cantidad").textContent = `×${producto.cantidad}`;

  const botonBorrar = fila.querySelector(".borrar");
  botonBorrar.setAttribute("aria-label", `Borrar ${producto.nombre}`);

  return fila;
}

/* =========================================================
   Mensajes de error del formulario
   ========================================================= */

function mostrarError(texto, campo) {
  mensajeError.textContent = texto;
  mensajeError.hidden = false;
  campo.setAttribute("aria-invalid", "true");
  campo.setAttribute("aria-describedby", "error");
}

function ocultarError() {
  mensajeError.hidden = true;
  mensajeError.textContent = "";
  for (const campo of [campoNombre, campoCantidad]) {
    campo.removeAttribute("aria-invalid");
    campo.removeAttribute("aria-describedby");
  }
}

/* =========================================================
   Eventos
   ========================================================= */

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const nombre = campoNombre.value.trim();
  if (nombre === "") {
    mostrarError("Escribe el nombre de un producto.", campoNombre);
    campoNombre.focus();
    return;
  }

  const cantidad = Number(campoCantidad.value);
  if (
    !Number.isInteger(cantidad) ||
    cantidad < CANTIDAD_MINIMA ||
    cantidad > CANTIDAD_MAXIMA
  ) {
    mostrarError(
      `La cantidad debe ser un número entero entre ${CANTIDAD_MINIMA} y ${CANTIDAD_MAXIMA}.`,
      campoCantidad
    );
    campoCantidad.focus();
    return;
  }

  ocultarError();
  anadir(nombre, cantidad);

  // Formulario listo para el siguiente producto
  campoNombre.value = "";
  campoCantidad.value = "1";
  campoNombre.focus();
});

// Al escribir se oculta el error anterior
campoNombre.addEventListener("input", ocultarError);
campoCantidad.addEventListener("input", ocultarError);

// Un solo escuchador para todas las filas (delegación de eventos)
lista.addEventListener("click", (evento) => {
  const fila = evento.target.closest(".fila");
  if (!fila) {
    return;
  }

  const id = fila.dataset.id;

  if (evento.target.closest(".borrar")) {
    borrar(id);
  } else if (evento.target.closest(".alternar")) {
    alternar(id);
  }

  // Tras repintar, devolvemos el foco a un sitio razonable
  // (importante para quien navega con el teclado).
  const filaActual = lista.querySelector(`.fila[data-id="${CSS.escape(id)}"]`);
  const destino =
    filaActual?.querySelector(".alternar") ||
    lista.querySelector(".alternar") ||
    campoNombre;
  destino.focus();
});

botonBorrarComprados.addEventListener("click", () => {
  borrarComprados();

  // Si el botón queda desactivado no puede tener el foco: lo movemos.
  const primerProducto = lista.querySelector(".alternar");
  (primerProducto || campoNombre).focus();
});

/* =========================================================
   Arranque
   ========================================================= */

productos = cargar();
render();

/* =========================================================
   Service worker: permite usar la app sin conexión.
   Solo se registra en https o en localhost (requisito del navegador).
   ========================================================= */

if (
  "serviceWorker" in navigator &&
  (location.protocol === "https:" ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1")
) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("No se pudo registrar el service worker:", error);
    });
  });
}
