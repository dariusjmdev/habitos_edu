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

  formRegistro.reset();
  mostrarMensaje("r-mensaje", "Registro guardado.", "ok");
}

formRegistro.addEventListener("submit", crearRegistro);

rellenarDesplegable();  // al cargar la página, con los hábitos guardados