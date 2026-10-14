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