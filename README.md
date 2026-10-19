<div align="center">

#  HábitoTracker

### Gestor de hábitos con registros y tabla de seguimiento

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

**2 formularios · 2 arrays · JSON en cookies · modal con tabla**

*Desarrollo Web en Entorno Cliente · 2º DAW · IES Juan García Valdemora*

</div>

---

## 👤 Datos de la práctica

| | |
|---|---|
| **Alumno/a** | `Darius Joanito Marinescu`  |
| **Módulo** | Desarrollo Web en Entorno Cliente (DWEC) |
| **Curso** | 2º DAW |
---

## 📑 Índice

1. [Descripción del proyecto](#-descripción-del-proyecto)
2. [Estructura y modelo de datos](#-estructura-y-modelo-de-datos)
3. [Decisión de diseño: modal frente a segunda ventana](#-decisión-de-diseño-modal-frente-a-segunda-ventana)
4. [Fase 1: Persistencia con JSON](#-fase-1-persistencia-con-json)
5. [Fase 2: Formulario A, crear hábitos](#-fase-2-formulario-a-crear-hábitos)
6. [Fase 3: Formulario B, registrar días](#-fase-3-formulario-b-registrar-días)
7. [Fase 4: Menú y modal con la tabla](#-fase-4-menú-y-modal-con-la-tabla)
8. [Fase 5: Cambiar el estado desde la tabla](#-fase-5-cambiar-el-estado-desde-la-tabla)
9. [Fase 6: Estadísticas, pulido y publicación](#-fase-6-estadísticas-pulido-y-publicación)

---

## 📖 Descripción del proyecto

HábitoTracker es un gestor de hábitos que funciona completamente en el navegador, sin servidor. Tiene **dos formularios distintos** y **dos conjuntos de datos** que se guardan en cookies en formato JSON:

- Por un lado, los **hábitos** que el usuario crea.
- Por otro, los **registros** de cada día, donde apunta si ha cumplido o no un hábito.

Una tabla de seguimiento, mostrada en una ventana flotante (modal), permite revisar todos los registros y cambiar su estado con un botón. Un panel de estadísticas en la página principal resume el total de hábitos y los días cumplidos y fallados.

---

## 🗂️ Estructura y modelo de datos

### Estructura de archivos

```
HabitoTracker_Apellidos/
├── index.html      ← estructura: formularios, panel, menú y modal
├── style.css       ← estilos (tema oscuro, modal, tabla)
├── app.js          ← toda la lógica
```

### Modelo de datos

La aplicación gestiona dos arrays de objetos:

| Array | Objeto | Campos |
|---|---|---|
| `habitos` | Hábito | `id`, `nombre`, `descripcion`, `categoria` |
| `registros` | Registro | `id`, `habitoId`, `fecha`, `observaciones`, `cumplido` |

Ejemplo real de cada uno:

```js
// Un hábito
{ id: 1, nombre: "Leer 20 minutos", descripcion: "Antes de dormir", categoria: "Estudio" }

// Un registro que apunta al hábito anterior mediante habitoId
{ id: 1, habitoId: 1, fecha: "2026-10-14", observaciones: "Capítulo 3", cumplido: true }
```

### Relación entre los arrays

`registros[n].habitoId` guarda el `id` de un hábito. Funciona como una **clave foránea** en una base de datos:

```
 habitos                        registros
┌────┬──────────────────┐      ┌────┬──────────┬────────────┬──────────┐
│ id │ nombre           │◄─────│ id │ habitoId │ fecha      │ cumplido │
├────┼──────────────────┤      ├────┼──────────┼────────────┼──────────┤
│  1 │ Leer 20 minutos  │◄─────│  1 │    1     │ 2026-10-14 │   true   │
│  2 │ Salir a correr   │      │  2 │    1     │ 2026-10-15 │   false  │
└────┴──────────────────┘      └────┴──────────┴────────────┴──────────┘
```

---

## 🧭 Decisión de diseño: modal frente a segunda ventana

El enunciado habla de una "segunda ventana" y de `window.opener`, pero la Fase 4 pide un **modal**, es decir, una capa dentro de la misma página. Ambas cosas son incompatibles, porque en un modal no existe una ventana hija y `window.opener` vale `null`.

Mi solución fue implementar el modal y escribir el cambio de estado así:

```js
const principal = window.opener || window;
principal.toggleCumplido(id);
```

- Con el **modal** (mi caso), `window.opener` es `null`, así que se usa `window` y la función se ejecuta en la misma página.
- Si la tabla estuviera en una **ventana abierta con `window.open`**, `window.opener` apuntaría a la ventana principal y el mismo código modificaría su array.

De este modo el código cumple los dos escenarios sin cambios.

---

## 🍪 Fase 1: Persistencia con JSON

**Criterio g** · almacenamiento

### 🎯 Objetivo

Crear las funciones de cookies que guardan y recuperan **arrays de objetos completos**, no texto suelto.

### 🛠️ Qué he hecho

- Creé `guardarCookie`, `leerCookie` y `borrarCookie`.
- Al guardar convierto el valor con `JSON.stringify` y lo envuelvo con `encodeURIComponent`. Al leer deshago ambos pasos.
- Protegí la lectura con `try/catch` por si una cookie se corrompe.
- Uso **dos cookies**, `habitos` y `registros`, y una función `guardarTodo()` que guarda las dos de golpe.

### 💻 Código clave

```js
function guardarCookie(nombre, valor, dias = 365) {
  const json = JSON.stringify(valor);                       // objeto -> JSON
  const caducidad = new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${nombre}=${encodeURIComponent(json)}; expires=${caducidad}; path=/; SameSite=Lax`;
}

function leerCookie(nombre) {
  // ... busca la cookie por nombre ...
  try {
    return JSON.parse(decodeURIComponent(valorCookie));     // cookie -> JSON -> objeto
  } catch (error) {
    return null;                                            // cookie corrupta
  }
}
```

### 📝 Documentación

El ciclo completo es:

```
objeto  →  JSON.stringify  →  texto JSON  →  encodeURIComponent  →  cookie
cookie  →  decodeURIComponent  →  texto JSON  →  JSON.parse  →  objeto
```

Una cookie solo puede almacenar **texto**, por eso un array de objetos hay que convertirlo antes a JSON.

`encodeURIComponent` hace falta porque el JSON contiene caracteres como `;`, `,`, `"` y espacios. El punto y coma es el separador de atributos de una cookie (`expires`, `path`...), así que un `;` dentro del valor la rompería. Al codificarlo, esos caracteres se transforman en secuencias seguras como `%3B` o `%22`.

El `try/catch` al leer evita que la aplicación se caiga si alguien modifica la cookie a mano o queda a medias: en ese caso se muestra el error en consola y se devuelve `null`.

### 📷 Capturas

>
<img width="473" height="172" alt="Captura de pantalla 2026-10-14 093506" src="https://github.com/user-attachments/assets/34e2b802-f0fe-4245-b870-082ff31f9a28" />


>
<img width="260" height="108" alt="Captura de pantalla 2026-10-14 093555" src="https://github.com/user-attachments/assets/c55b6356-74b8-40ad-b662-99f0e4267900" />



### 🔖 Commit

```bash
git add .
git commit -m "Fase 1: persistencia con JSON"
```

---

## 📝 Fase 2: Formulario A, crear hábitos

**Criterio e** · interacción

### 🎯 Objetivo

Un formulario que crea hábitos y los añade al array de hábitos, con validación.

### 🛠️ Qué he hecho

- Formulario con tres campos: **nombre**, **descripción** y **categoría** (desplegable con Salud, Estudio, Ocio, Trabajo y Otros).
- Al pulsar "Crear" se valida el nombre, se crea el objeto con un `id` único, se añade a `habitos` y se guarda en cookie.
- Después se limpia el formulario y se muestra un mensaje de confirmación.

### 💻 Código clave

```js
function crearHabito(e) {
  e.preventDefault();
  const nombre = document.getElementById("h-nombre").value.trim();
  if (nombre === "") {
    mostrarMensaje("h-mensaje", "El nombre es obligatorio.", "error");
    return;
  }
  habitos.push({ id: generarId(habitos), nombre, descripcion, categoria });
  guardarTodo();
  formHabito.reset();
}
```

### 📝 Documentación

**Estructura del objeto hábito:**

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | número | Identificador único, calculado como el mayor id existente + 1 |
| `nombre` | texto | Nombre del hábito (obligatorio) |
| `descripcion` | texto | Descripción libre (opcional) |
| `categoria` | texto | Valor elegido en el desplegable |

**Validación aplicada:** el nombre se limpia con `trim()` y, si queda vacío, se muestra un mensaje de error y no se crea nada. La descripción es opcional y la categoría procede de un desplegable, así que siempre tiene un valor válido.

El `id` se genera con el mayor id del array más uno, de manera que nunca se repite aunque se borren elementos intermedios. Con `e.preventDefault()` evito que el formulario recargue la página.

### 📷 Capturas

>
<img width="500" height="265" alt="image" src="https://github.com/user-attachments/assets/93433bf1-5826-4c27-b956-eb76a5ee7d4d" />



>
<img width="401" height="236" alt="image" src="https://github.com/user-attachments/assets/247e4ca1-4701-4114-b5e7-5cf67bb9983e" />



### 🔖 Commit

```bash
git add .
git commit -m "Fase 2: formulario de creación de hábitos"
```

---

## 📅 Fase 3: Formulario B, registrar días

**Criterios e + d** · interacción y generación de contenido

### 🎯 Objetivo

Un segundo formulario, distinto del anterior, para apuntar que un día concreto se ha hecho (o no) un hábito.

### 🛠️ Qué he hecho

- Formulario con: desplegable de hábitos, fecha, observaciones y casilla **cumplido**.
- El desplegable se rellena **por código** recorriendo el array `habitos`.
- Cada vez que se crea un hábito nuevo, el desplegable se actualiza.
- Al guardar se valida que haya hábito y fecha, y se crea el registro con su `habitoId`.

### 💻 Código clave

```js
function rellenarDesplegable() {
  const select = document.getElementById("r-habito");
  select.innerHTML = "";
  // ... opción inicial "-- Elige un hábito --" ...
  habitos.forEach(h => {
    const op = document.createElement("option");
    op.value = h.id;            // el value guarda el id del hábito
    op.textContent = h.nombre;
    select.appendChild(op);
  });
}

const habitoId = Number(document.getElementById("r-habito").value);
registros.push({ id: generarId(registros), habitoId, fecha, observaciones, cumplido });
```

### 📝 Documentación

**Cómo relleno el desplegable por código:** el `<select>` está vacío en el HTML. La función `rellenarDesplegable()` lo vacía, añade una opción inicial y recorre `habitos` con `forEach`, creando una `<option>` por cada hábito con `createElement`. El `value` de la opción es el `id` y el texto visible es el `nombre`. Uso `textContent` en lugar de `innerHTML` para que un nombre con código HTML no se inyecte en la página. La función se llama al cargar la página y también dentro de `crearHabito()`, por eso el desplegable siempre está al día.

**Cómo relaciono un registro con su hábito:** el registro guarda en `habitoId` el `id` del hábito elegido, igual que una clave foránea en una base de datos. Como `select.value` siempre devuelve texto, lo convierto con `Number()` para que el tipo coincida con el `id` numérico del hábito. Después, para mostrar el nombre en la tabla, basta con buscar el hábito con `habitos.find(h => h.id === reg.habitoId)`.

**Validación:** es obligatorio elegir un hábito y una fecha. Las observaciones y la casilla son opcionales.

### 📷 Capturas

> <img width="282" height="182" alt="image" src="https://github.com/user-attachments/assets/4120cc6b-a8a2-4e75-9e63-097eedf6e41b" />


> <img width="155" height="115" alt="image" src="https://github.com/user-attachments/assets/7117a528-73b6-4bd8-a14d-7707584db96d" />


### 🔖 Commit

```bash
git add .
git commit -m "Fase 3: formulario de registro de días"
```

---

## 🪟 Fase 4: Menú y modal con la tabla

**Criterio d** · generación de contenido y navegación

### 🎯 Objetivo

Añadir un menú de navegación y, al pulsar **"Ver seguimiento"**, mostrar una ventana flotante dentro de la misma página, con el fondo oscurecido y la tabla encima, sin cambiar de pestaña.

### 🛠️ Qué he hecho

- `<nav id="menu">` con los enlaces "Inicio" y "Ver seguimiento".
- Modal en el HTML: capa `<div class="modal oculto">` con una caja interior que contiene el título, el botón ✕ y la tabla. Empieza oculto.
- CSS: la capa exterior ocupa toda la pantalla (`position: fixed; inset: 0`) con fondo `rgba(0,0,0,.6)`, y la caja interior es pequeña (`max-width`) y está centrada. La clase `oculto` aplica `display: none`.
- JS: "Ver seguimiento" quita la clase `oculto` y la ✕ la añade, usando `classList`.
- La tabla se genera por código con una fila por registro: nombre del hábito (buscado por `habitoId`), fecha, observaciones y estado ✓/✗ con color, más un **resumen** de cumplidos y fallados.

### 💻 Código clave

```js
function abrirModal() {
  pintarTabla();
  modal.classList.remove("oculto");   // se muestra
}

function cerrarModal() {
  modal.classList.add("oculto");      // se oculta
}

// Cerrar al hacer clic en el fondo oscuro (no en la caja)
modal.addEventListener("click", function (e) {
  if (e.target === this) cerrarModal();
});
```

### 📝 Documentación

**Cómo funciona un modal:** es una capa `<div>` de la propia página que cubre toda la pantalla (`position: fixed; inset: 0`) con un fondo semitransparente, y dentro lleva una caja centrada con el contenido. Está oculta de partida gracias a la clase `oculto` (`display: none`). Para mostrarla hago `classList.remove("oculto")` y para ocultarla `classList.add("oculto")`; no se crea ni se destruye ningún elemento, solo cambia una clase.

Para cerrar al pulsar el fondo oscuro comparo `e.target === this`. El evento `click` sube desde el elemento pulsado hasta la capa, pero `e.target` es el elemento donde se hizo clic realmente: solo coincide con la capa (`this`) si el clic fue en el fondo y no dentro de la caja.

**Diferencia con `window.open`:**

| | Modal | `window.open` |
|---|---|---|
| ¿Qué es? | Una capa de la misma página | Otra ventana o pestaña del navegador |
| Documento | El mismo | Uno distinto, con su propio `window` |
| Acceso a los datos | Directo, mismas variables | Solo mediante `window.opener` |
| Cómo se muestra | `classList.remove("oculto")` | `window.open(url, nombre, opciones)` |
| Bloqueadores de ventanas | No le afectan | Pueden bloquearla |

### 📷 Capturas

> <img width="550" height="75" alt="image" src="https://github.com/user-attachments/assets/9ca011aa-e212-442a-a9d9-3e53f2d60a76" />


> <img width="783" height="365" alt="image" src="https://github.com/user-attachments/assets/ae144a76-7003-485c-a8c5-1190e898dd70" />


### 🔖 Commit

```bash
git add .
git commit -m "Fase 4: menú y modal con la tabla"
```

---

## 🔄 Fase 5: Cambiar el estado desde la tabla

**Criterios e + g** · interacción y almacenamiento

### 🎯 Objetivo

Que cada fila de la tabla tenga un botón para marcar el registro como cumplido o no, y que el cambio se guarde en el **array real** de la ventana principal.

### 🛠️ Qué he hecho

- Nueva columna **Acción** con un botón "Cambiar" en cada fila.
- La función `toggleCumplido(id)` invierte el `cumplido` del registro en el array real y guarda la cookie.
- El botón llama a `cambiarEstado(id)`, que usa `window.opener || window` para ejecutar `toggleCumplido`.
- Tras el cambio se vuelve a pintar la tabla para ver el nuevo estado al instante.

### 💻 Código clave

```js
// Función de la ventana PRINCIPAL: modifica el array real y guarda
function toggleCumplido(id) {
  const reg = registros.find(r => r.id === id);
  if (!reg) return;
  reg.cumplido = !reg.cumplido;
  guardarTodo();
  actualizarEstadisticas();
}

// La llama el botón de la tabla
function cambiarEstado(id) {
  const principal = window.opener || window;
  principal.toggleCumplido(id);
  pintarTabla();
}
```

### 📝 Documentación

**Qué es `window.opener`:** es la referencia que una ventana abierta con `window.open` tiene hacia la ventana que la abrió. Gracias a ella, la ventana hija puede acceder a las variables y funciones de la ventana padre. Por eso `window.opener.toggleCumplido(id)` ejecuta en el padre una función que cambia su array, en lugar de modificar una copia en la ventana hija.

**Cómo consigo que un botón de la segunda ventana cambie los datos de la primera:** el botón de cada fila llama a `cambiarEstado(id)`. Esta obtiene la ventana principal con `window.opener || window` y le pide que ejecute `toggleCumplido(id)`. Esa función busca el registro en el array `registros` **de la ventana principal**, invierte su `cumplido` y guarda las cookies. Como el cambio se hace sobre el array original y no sobre una copia, los datos de la ventana principal quedan siempre actualizados. Después `pintarTabla()` redibuja la tabla con el nuevo estado.

**En mi implementación:** la tabla está en un modal (misma página), por lo que `window.opener` es `null` y se usa `window`. El código es válido también si la tabla estuviera en una segunda ventana. Esta decisión se explica en [Decisión de diseño](#-decisión-de-diseño-modal-frente-a-segunda-ventana).

### 📷 Capturas

><img width="720" height="47" alt="image" src="https://github.com/user-attachments/assets/83973947-8c06-4f62-b2c8-9104daffa336" />


><img width="732" height="47" alt="image" src="https://github.com/user-attachments/assets/657ffe5c-47d3-4a0b-919b-2f825a09173d" />


### 🔖 Commit

```bash
git add .
git commit -m "Fase 5: cambiar estado desde la tabla con window.opener"
```

---

## 📊 Fase 6: Estadísticas, pulido y publicación

**Criterios d + h** · generación de contenido, depuración y documentación

### 🎯 Objetivo

Mostrar un resumen en la ventana principal, dejar todo persistente y el código limpio.

### 🛠️ Qué he hecho

- Panel de estadísticas con **total de hábitos**, **días cumplidos** y **días fallados**, calculados con `filter` sobre `registros`.
- Botón **"Borrar todo"** con `confirm` que elimina las cookies de hábitos y registros.
- Las estadísticas se actualizan al crear un hábito, crear un registro y cambiar un estado.
- Revisión final: consola sin errores, funciones comentadas y comprobación de que al recargar sigue todo (hábitos, registros y sus estados).

### 💻 Código clave

```js
function actualizarEstadisticas() {
  document.getElementById("stat-habitos").textContent = habitos.length;
  document.getElementById("stat-cumplidos").textContent = registros.filter(r => r.cumplido).length;
  document.getElementById("stat-fallados").textContent = registros.filter(r => !r.cumplido).length;
}

function borrarTodo() {
  if (!confirm("¿Seguro que quieres borrar todos los hábitos y registros?")) return;
  borrarCookie("habitos");
  borrarCookie("registros");
  habitos = [];
  registros = [];
  // ... se actualizan desplegable, estadísticas y tabla ...
}
```

### ✅ Revisión final

- [ ] La consola (F12) no muestra errores en rojo.
- [ ] Todas las funciones llevan un comentario explicativo.
- [ ] Al recargar la página siguen los hábitos, los registros y sus estados.
- [ ] "Borrar todo" respeta la opción **Cancelar** y borra con **Aceptar**.
- [ ] La aplicación funciona en la URL pública.

### 📝 Documentación

**Problema encontrado y cómo lo resolví:**

> ⚠️ *Sustituye este texto por un problema que te haya pasado de verdad. Este es el más típico de esta práctica.*

Al crear un registro, la tabla mostraba "(hábito borrado)" aunque el hábito existía. La causa era que `select.value` devuelve **texto** (`"1"`) y en la tabla comparaba con `===` contra el `id` numérico (`1`), así que `find` nunca encontraba el hábito. Lo resolví convirtiendo el valor con `Number()` al crear el registro, de modo que `habitoId` se guarda como número y la comparación estricta funciona.

**Limitación conocida:** una cookie admite unos 4 KB, así que con muchísimos registros se llenaría. En una aplicación real usaría `localStorage` o una base de datos.

### 📷 Capturas

> <img width="797" height="262" alt="image" src="https://github.com/user-attachments/assets/8c4d97bf-9498-4a97-998b-c1a1e7243ffd" />


> <img width="520" height="147" alt="image" src="https://github.com/user-attachments/assets/229b2c44-96d5-47aa-917d-043bebfd9cd0" />


> <img width="232" height="167" alt="image" src="https://github.com/user-attachments/assets/4a014706-6847-45b0-a3b5-c826fa170d31" />


### 🔖 Commit

```bash
git add .
git commit -m "Fase 6: estadísticas, pulido y publicación"
```

<div align="center">

*HábitoTracker · RA3 avanzado · DWEC · 2º DAW*

</div>
