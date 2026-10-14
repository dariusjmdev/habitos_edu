// ===== DATOS (los dos arrays) =====
let habitos = [];    // { id, nombre, descripcion, categoria }
let registros = [];  // { id, habitoId, fecha, observaciones, cumplido }

// ===== COOKIES + JSON =====

// Guarda cualquier valor (objeto, array...) como texto JSON en una cookie
function guardarCookie(nombre, valor, dias = 365) {
  const json = JSON.stringify(valor);                       // objeto -> JSON
  const caducidad = new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${nombre}=${encodeURIComponent(json)}; expires=${caducidad}; path=/; SameSite=Lax`;
}

// Lee una cookie y devuelve el valor ya convertido a objeto (o null)
function leerCookie(nombre) {
  const partes = document.cookie.split("; ");
  for (const parte of partes) {
    const [clave, ...resto] = parte.split("=");
    if (clave === nombre) {
      try {
        return JSON.parse(decodeURIComponent(resto.join("=")));  // cookie -> JSON -> objeto
      } catch (error) {
        console.error(`Cookie "${nombre}" corrupta:`, error);
        return null;
      }
    }
  }
  return null;
}

// Borra una cookie poniéndole una fecha de caducidad pasada
function borrarCookie(nombre) {
  document.cookie = `${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// Guarda las dos cookies de golpe
function guardarTodo() {
  guardarCookie("habitos", habitos);
  guardarCookie("registros", registros);
}

// Carga las dos cookies al arrancar
function cargarTodo() {
  habitos = leerCookie("habitos") || [];
  registros = leerCookie("registros") || [];
}

cargarTodo();

// ===== UTILIDADES =====

// Id único: el mayor id existente + 1 (o 1 si la lista está vacía)
function generarId(lista) {
  return lista.length ? Math.max(...lista.map(item => item.id)) + 1 : 1;
}

// Muestra un mensaje bajo el formulario (tipo: "error" u "ok")
function mostrarMensaje(idElemento, texto, tipo) {
  const p = document.getElementById(idElemento);
  p.textContent = texto;
  p.className = "mensaje " + tipo;
}

// ===== FORMULARIO A: CREAR HÁBITOS =====
const formHabito = document.getElementById("form-habito");

function crearHabito(e) {
  e.preventDefault();  // evita que la página se recargue

  const nombre = document.getElementById("h-nombre").value.trim();
  const descripcion = document.getElementById("h-descripcion").value.trim();
  const categoria = document.getElementById("h-categoria").value;

  // Validación: el nombre no puede estar vacío
  if (nombre === "") {
    mostrarMensaje("h-mensaje", "El nombre es obligatorio.", "error");
    return;
  }

  const habito = { id: generarId(habitos), nombre, descripcion, categoria };
  habitos.push(habito);
  guardarTodo();
  actualizarEstadisticas();
  rellenarDesplegable();  // el desplegable del formulario B se actualiza

  formHabito.reset();
  mostrarMensaje("h-mensaje", `Hábito "${nombre}" creado.`, "ok");
}

formHabito.addEventListener("submit", crearHabito);
// ===== FORMULARIO B: REGISTRAR DÍAS =====
const formRegistro = document.getElementById("form-registro");

// Genera las <option> del desplegable recorriendo el array de hábitos
function rellenarDesplegable() {
  const select = document.getElementById("r-habito");
  select.innerHTML = "";

  const inicial = document.createElement("option");
  inicial.value = "";
  inicial.textContent = "-- Elige un hábito --";
  select.appendChild(inicial);

  habitos.forEach(h => {
    const op = document.createElement("option");
    op.value = h.id;              // el value guarda el id del hábito
    op.textContent = h.nombre;    // textContent evita inyectar HTML
    select.appendChild(op);
  });
}

function crearRegistro(e) {
  e.preventDefault();

  const habitoId = Number(document.getElementById("r-habito").value); // value es texto -> a número
  const fecha = document.getElementById("r-fecha").value;
  const observaciones = document.getElementById("r-observaciones").value.trim();
  const cumplido = document.getElementById("r-cumplido").checked;

  // Validación: tiene que haber hábito y fecha
  if (!habitoId || fecha === "") {
    mostrarMensaje("r-mensaje", "Elige un hábito y una fecha.", "error");
    return;
  }

  const registro = { id: generarId(registros), habitoId, fecha, observaciones, cumplido };
  registros.push(registro);
  guardarTodo();
  actualizarEstadisticas();

  formRegistro.reset();
  mostrarMensaje("r-mensaje", "Registro guardado.", "ok");
}

formRegistro.addEventListener("submit", crearRegistro);

rellenarDesplegable();  // al cargar la página, con los hábitos guardados
// ===== MENÚ Y MODAL =====
const modal = document.getElementById("modal");

function abrirModal() {
  pintarTabla();                    // la tabla se regenera con los datos actuales
  modal.classList.remove("oculto"); // se muestra
}

function cerrarModal() {
  modal.classList.add("oculto");    // se oculta
}

// Crea una celda <td> con texto (y clase opcional)
function crearCelda(texto, clase) {
  const td = document.createElement("td");
  td.textContent = texto;
  if (clase) td.className = clase;
  return td;
}

// Genera la tabla: una fila por registro + resumen
function pintarTabla() {
  const tbody = document.getElementById("tabla-body");
  tbody.innerHTML = "";

  registros.forEach(reg => {
    const habito = habitos.find(h => h.id === reg.habitoId);  // relación por habitoId
    const tr = document.createElement("tr");

    tr.appendChild(crearCelda(habito ? habito.nombre : "(hábito borrado)"));
    tr.appendChild(crearCelda(reg.fecha));
    tr.appendChild(crearCelda(reg.observaciones || "—"));
    tr.appendChild(crearCelda(reg.cumplido ? "✓" : "✗", reg.cumplido ? "ok" : "ko"));
    // Botón para cambiar el estado de este registro
    const tdAccion = document.createElement("td");
    const btn = document.createElement("button");
    btn.textContent = "Cambiar";
    btn.addEventListener("click", () => cambiarEstado(reg.id));
    tdAccion.appendChild(btn);
    tr.appendChild(tdAccion);
    tbody.appendChild(tr);
  });

  const cumplidos = registros.filter(r => r.cumplido).length;
  const fallados = registros.length - cumplidos;
  document.getElementById("resumen").textContent = `Cumplidos: ${cumplidos} · Fallados: ${fallados}`;
}

// Eventos del menú y del modal
document.getElementById("enlace-seguimiento").addEventListener("click", function (e) {
  e.preventDefault();
  abrirModal();
});

document.getElementById("enlace-inicio").addEventListener("click", function (e) {
  e.preventDefault();
  cerrarModal();
  window.scrollTo(0, 0);
});

document.getElementById("cerrar-modal").addEventListener("click", cerrarModal);

// Cerrar al hacer clic en el fondo oscuro (no en la caja)
modal.addEventListener("click", function (e) {
  if (e.target === this) cerrarModal();
});
// ===== CAMBIAR ESTADO =====

// Función de la ventana PRINCIPAL: invierte cumplido en el array real y guarda
function toggleCumplido(id) {
  const reg = registros.find(r => r.id === id);
  if (!reg) return;
  reg.cumplido = !reg.cumplido;
  guardarTodo();
  actualizarEstadisticas();
}

// La llama el botón de la tabla.
// Si la tabla estuviera en una 2ª ventana, window.opener sería la ventana padre.
// Aquí la tabla está en un modal (misma ventana): window.opener es null y usamos window.
function cambiarEstado(id) {
  const principal = window.opener || window;
  principal.toggleCumplido(id);  // modifica el array de la ventana principal
  pintarTabla();                 // repinta para ver el cambio al instante
}
// ===== ESTADÍSTICAS Y BORRADO =====
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
  rellenarDesplegable();
  actualizarEstadisticas();
  pintarTabla();
}

document.getElementById("btn-borrar").addEventListener("click", borrarTodo);

actualizarEstadisticas();  // al cargar la página