// Sistema Académico — frontend vanilla JS.
// Mantiene la API existente y agrega una interfaz profesional para operar
// los módulos directamente dentro de la página principal.
const URL_BASE_API = "/api/v1";

const vistaLogin = document.getElementById("vista-login");
const vistaDashboard = document.getElementById("vista-dashboard");
const formularioLogin = document.getElementById("formulario-login");
const campoUsuario = document.getElementById("campo-usuario");
const campoClave = document.getElementById("campo-clave");
const botonEntrar = document.getElementById("boton-entrar");
const mensajeLogin = document.getElementById("mensaje-login");
const tituloBienvenida = document.getElementById("titulo-bienvenida");
const chipUsuario = document.getElementById("chip-usuario");
const botonActualizar = document.getElementById("boton-actualizar");
const botonSalir = document.getElementById("boton-salir");
const filaTarjetas = document.getElementById("fila-tarjetas");
const textoPeriodo = document.getElementById("texto-periodo");
const campoBuscar = document.getElementById("campo-buscar");
const cuerpoTablaEstudiantes = document.getElementById("cuerpo-tabla-estudiantes");
const textoSinResultados = document.getElementById("texto-sin-resultados");
const tituloFormulario = document.getElementById("titulo-formulario");
const formularioEstudiante = document.getElementById("formulario-estudiante");
const campoEstudianteId = document.getElementById("estudiante-id");
const campoNombres = document.getElementById("estudiante-nombres");
const campoApellidos = document.getElementById("estudiante-apellidos");
const campoCuenta = document.getElementById("estudiante-cuenta");
const campoCorreo = document.getElementById("estudiante-correo");
const campoTelefono = document.getElementById("estudiante-telefono");
const campoNacimiento = document.getElementById("estudiante-nacimiento");
const campoCarrera = document.getElementById("estudiante-carrera");
const campoEstado = document.getElementById("estudiante-estado");
const botonGuardarEstudiante = document.getElementById("boton-guardar-estudiante");
const botonCancelarEdicion = document.getElementById("boton-cancelar-edicion");
const mensajeFormulario = document.getElementById("mensaje-formulario");

const vistaModulo = document.getElementById("vista-modulo");
const moduloEtiqueta = document.getElementById("modulo-etiqueta");
const moduloTitulo = document.getElementById("modulo-titulo");
const moduloDescripcion = document.getElementById("modulo-descripcion");
const contenidoModulo = document.getElementById("contenido-modulo");
const mensajeModulo = document.getElementById("mensaje-modulo");
const botonCerrarModulo = document.getElementById("boton-cerrar-modulo");
const botonRefrescarModulo = document.getElementById("boton-refrescar-modulo");
const panelInicio = document.getElementById("panel-inicio");
const panelEstudiantes = document.getElementById("panel-estudiantes");

let usuarioActual = null;
let temporizadorBusqueda = null;
let moduloActual = null;
let registrosModulo = [];
let registroEditando = null;
let opcionesCache = {};

const MODULOS = {
  carreras: { titulo: "Carreras", descripcion: "CRUD de carreras universitarias.", endpoint: "/carreras", icono: "🎓", color: "azul", id: "id", campos: [
    {n:"codigo",l:"Código",t:"text",r:true,ph:"IS"}, {n:"nombre",l:"Nombre",t:"text",r:true,ph:"Ingeniería en Sistemas"}, {n:"duracion_anios",l:"Duración (años)",t:"number",r:true,min:1,max:10}, {n:"activo",l:"Carrera activa",t:"checkbox"}
  ]},
  estudiantes: { titulo: "Estudiantes", descripcion: "CRUD, búsqueda, filtros y relación con carrera.", endpoint: "/estudiantes", icono: "👨‍🎓", color: "verde" },
  docentes: { titulo: "Docentes", descripcion: "CRUD y asignación a secciones.", endpoint: "/docentes", icono: "👨‍🏫", color: "naranja", campos: [
    {n:"numero_empleado",l:"N.º de empleado",t:"text",r:true}, {n:"nombres",l:"Nombres",t:"text",r:true}, {n:"apellidos",l:"Apellidos",t:"text",r:true}, {n:"correo",l:"Correo",t:"email",r:true}, {n:"especialidad",l:"Especialidad",t:"text",r:true}, {n:"estado",l:"Estado",t:"select",r:true,opts:["ACTIVO","INACTIVO"]}
  ]},
  asignaturas: { titulo: "Asignaturas", descripcion: "CRUD, unidades valorativas y requisitos.", endpoint: "/asignaturas", icono: "📚", color: "morado", campos: [
    {n:"codigo",l:"Código",t:"text",r:true}, {n:"nombre",l:"Nombre",t:"text",r:true}, {n:"unidades_valorativas",l:"Unidades valorativas",t:"number",r:true,min:1,max:8}, {n:"carrera_id",l:"Carrera",t:"relation",r:true,source:"carreras"}, {n:"requisito_id",l:"Requisito",t:"relation",source:"asignaturas",none:true}, {n:"activo",l:"Asignatura activa",t:"checkbox"}
  ]},
  periodos: { titulo: "Períodos", descripcion: "Control de períodos académicos; solo uno queda activo.", endpoint: "/periodos", icono: "📅", color: "amarillo", campos: [
    {n:"anio",l:"Año",t:"number",r:true,min:2020,max:2100}, {n:"numero",l:"Número de período",t:"select",r:true,opts:[1,2,3]}, {n:"fecha_inicio",l:"Fecha de inicio",t:"date",r:true}, {n:"fecha_fin",l:"Fecha de finalización",t:"date",r:true}, {n:"activo",l:"Período activo",t:"checkbox"}
  ]},
  aulas: { titulo: "Aulas", descripcion: "CRUD, capacidad y asignación de espacios.", endpoint: "/aulas", icono: "🏫", color: "celeste", campos: [
    {n:"codigo",l:"Código",t:"text",r:true}, {n:"edificio",l:"Edificio",t:"text",r:true}, {n:"capacidad",l:"Capacidad",t:"number",r:true,min:1,max:200}, {n:"activo",l:"Aula activa",t:"checkbox"}
  ]},
  secciones: { titulo: "Secciones", descripcion: "Oferta de asignaturas, docente, aula, horario y cupos.", endpoint: "/secciones", icono: "🧑‍🏫", color: "rojo", campos: [
    {n:"codigo",l:"Código de sección",t:"text",r:true}, {n:"asignatura_id",l:"Asignatura",t:"relation",r:true,source:"asignaturas"}, {n:"docente_id",l:"Docente",t:"relation",r:true,source:"docentes"}, {n:"periodo_id",l:"Período",t:"relation",r:true,source:"periodos"}, {n:"aula_id",l:"Aula",t:"relation",source:"aulas",none:true}, {n:"dias",l:"Días",t:"text",r:true,ph:"LU-MI"}, {n:"hora_inicio",l:"Hora inicio",t:"time",r:true}, {n:"hora_fin",l:"Hora fin",t:"time",r:true}, {n:"cupo_maximo",l:"Cupo máximo",t:"number",r:true,min:1,max:200}, {n:"estado",l:"Estado",t:"select",r:true,opts:["ABIERTA","CERRADA","FINALIZADA"]}
  ]},
  matriculas: { titulo: "Matrículas", descripcion: "Relación entre estudiantes y secciones.", endpoint: "/matriculas", icono: "📝", color: "verde", especial: "matriculas" },
  calificaciones: { titulo: "Calificaciones", descripcion: "Tres parciales, promedio y resultado automático.", endpoint: "/calificaciones", icono: "📋", color: "violeta", especial: "calificaciones" },
  reportes: { titulo: "Reportes", descripcion: "Dashboard, historial, lista de sección y carga docente.", endpoint: null, icono: "📊", color: "turquesa", especial: "reportes" }
};

const TARJETAS_KPI = [
  { clave: "estudiantes_activos", etiqueta: "Estudiantes activos" },
  { clave: "docentes_activos", etiqueta: "Docentes activos" },
  { clave: "carreras_activas", etiqueta: "Carreras activas" },
  { clave: "asignaturas_activas", etiqueta: "Asignaturas activas" },
  { clave: "secciones_abiertas", etiqueta: "Secciones abiertas" },
  { clave: "matriculas_activas", etiqueta: "Matrículas activas" },
];

// ------------------------- Navegación de módulos -------------------------
function marcarModuloActivo(nombre) {
  document.querySelectorAll(".modulo-card").forEach((tarjeta) => {
    tarjeta.classList.toggle("activo", tarjeta.dataset.modulo === nombre);
  });
}

function mostrarPanelInicio() {
  panelInicio?.classList.remove("oculto");
  panelEstudiantes?.classList.add("oculto");
  vistaModulo.classList.add("oculto");
  marcarModuloActivo("");
}

function mostrarPanelEstudiantes() {
  panelInicio?.classList.add("oculto");
  panelEstudiantes?.classList.remove("oculto");
  vistaModulo.classList.add("oculto");
}

document.querySelectorAll(".modulo-card").forEach((tarjeta) => {
  const abrir = () => abrirModulo(tarjeta.dataset.modulo);
  tarjeta.addEventListener("click", abrir);
  tarjeta.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(); } });
});

botonCerrarModulo.addEventListener("click", () => {
  moduloActual = null;
  mostrarPanelInicio();
});
botonRefrescarModulo.addEventListener("click", () => { if (moduloActual) cargarModulo(moduloActual); });

async function abrirModulo(nombre) {
  const modulo = MODULOS[nombre];
  if (!modulo) return;
  moduloActual = nombre;
  registroEditando = null;
  marcarModuloActivo(nombre);

  if (nombre === "estudiantes") {
    mostrarPanelEstudiantes();
    await cargarEstudiantes(campoBuscar.value.trim());
    return;
  }

  panelInicio?.classList.add("oculto");
  panelEstudiantes?.classList.add("oculto");
  vistaModulo.classList.remove("oculto");
  moduloEtiqueta.textContent = `MÓDULO · ${modulo.titulo.toUpperCase()}`;
  moduloTitulo.textContent = modulo.titulo;
  moduloDescripcion.textContent = modulo.descripcion;
  mensajeModulo.textContent = "";
  contenidoModulo.innerHTML = '<div class="tabla-vacia">Cargando módulo...</div>';
  await cargarModulo(nombre);
}

async function apiFetch(path, options = {}) {
  const respuesta = await fetch(`${URL_BASE_API}${path}`, options);
  const tipo = respuesta.headers.get("content-type") || "";
  const datos = tipo.includes("application/json") ? await respuesta.json().catch(() => null) : null;
  if (!respuesta.ok) throw new Error(datos?.detail || datos?.mensaje || `Error HTTP ${respuesta.status}`);
  return datos;
}

async function cargarModulo(nombre) {
  const modulo = MODULOS[nombre];
  if (!modulo) return;
  mensajeModulo.textContent = "";
  contenidoModulo.innerHTML = '<div class="tabla-vacia">Cargando información...</div>';
  try {
    if (modulo.especial === "reportes") return await renderReportes();
    if (modulo.especial === "matriculas") return await renderMatriculas();
    if (modulo.especial === "calificaciones") return await renderCalificaciones();
    registrosModulo = await apiFetch(modulo.endpoint);
    await renderCrudModulo(nombre);
  } catch (error) {
    contenidoModulo.innerHTML = '<div class="tabla-vacia">No se pudo cargar la información.</div>';
    mensajeModulo.textContent = error.message || "No se pudo conectar con la API.";
  }
}

async function obtenerOpciones(source) {
  if (opcionesCache[source]) return opcionesCache[source];
  const datos = await apiFetch(`/${source}`);
  opcionesCache[source] = Array.isArray(datos) ? datos : [];
  return opcionesCache[source];
}

function textoOpcion(source, item) {
  if (source === "carreras") return `${item.codigo} — ${item.nombre}`;
  if (source === "asignaturas") return `${item.codigo} — ${item.nombre}`;
  if (source === "docentes") return `${item.numero_empleado} — ${item.nombres} ${item.apellidos}`;
  if (source === "periodos") return item.nombre || `${item.anio}-${item.numero}`;
  if (source === "aulas") return `${item.codigo} — ${item.edificio}`;
  if (source === "estudiantes") return `${item.cuenta} — ${item.nombres} ${item.apellidos}`;
  if (source === "secciones") return `${item.codigo} — ${item.asignatura_nombre || item.asignatura_codigo || "Sección"}`;
  return String(item.nombre || item.codigo || item.id);
}

async function construirCampo(campo, valor = undefined) {
  const envoltura = document.createElement("div");
  envoltura.className = "campo-modulo";
  const label = document.createElement("label");
  label.textContent = campo.l;
  envoltura.appendChild(label);

  if (campo.t === "checkbox") {
    const caja = document.createElement("label"); caja.className = "check-modulo";
    const input = document.createElement("input"); input.type = "checkbox"; input.name = campo.n; input.checked = valor !== undefined ? Boolean(valor) : true;
    caja.append(input, document.createTextNode(" Sí")); envoltura.appendChild(caja); return envoltura;
  }
  let input;
  if (campo.t === "select" || campo.t === "relation") {
    input = document.createElement("select"); input.name = campo.n;
    if (campo.none) { const op = document.createElement("option"); op.value=""; op.textContent="— Sin asignar —"; input.appendChild(op); }
    const opciones = campo.t === "relation" ? await obtenerOpciones(campo.source) : campo.opts.map(v=>({id:v,nombre:v}));
    opciones.forEach(item => { const op=document.createElement("option"); op.value = campo.t === "relation" ? item.id : item.id; op.textContent = campo.t === "relation" ? textoOpcion(campo.source,item) : item.nombre; if (String(item.id)===String(valor ?? "")) op.selected=true; input.appendChild(op); });
  } else {
    input = document.createElement("input"); input.type=campo.t; input.name=campo.n; input.value = valor ?? ""; if (campo.min!==undefined) input.min=campo.min; if(campo.max!==undefined) input.max=campo.max; if(campo.ph) input.placeholder=campo.ph;
  }
  if (campo.r) input.required = true;
  envoltura.appendChild(input); return envoltura;
}

async function renderCrudModulo(nombre) {
  const modulo = MODULOS[nombre];
  contenidoModulo.innerHTML = `
    <div class="modulo-toolbar"><div><strong>Gestión de ${modulo.titulo}</strong><span>Crear, editar, eliminar y actualizar datos directamente en la API.</span></div><button class="boton-primario" id="btn-nuevo-modulo">+ Nuevo ${modulo.titulo.slice(0,-1)}</button></div>
    <form id="form-modulo-dinamico" class="form-modulo-dinamico oculto"></form>
    <div class="contenedor-tabla modulo-tabla-wrap" id="tabla-dinamica"></div>`;
  document.getElementById("btn-nuevo-modulo").addEventListener("click", () => abrirFormularioDinamico(nombre));
  await pintarTablaCrud(nombre);
}

async function pintarTablaCrud(nombre) {
  const modulo = MODULOS[nombre];
  const datos = registrosModulo;
  if (!Array.isArray(datos) || !datos.length) { document.getElementById("tabla-dinamica").innerHTML='<div class="tabla-vacia">No hay registros todavía.</div>'; return; }
  const ocultar = new Set(["id"]);
  const claves = Object.keys(datos[0]).filter(k=>!ocultar.has(k)).slice(0,10);
  document.getElementById("tabla-dinamica").innerHTML = `<table class="tabla-modulo"><thead><tr>${claves.map(k=>`<th>${formatearEncabezado(k)}</th>`).join("")}<th>Acciones</th></tr></thead><tbody>${datos.map((fila,i)=>`<tr>${claves.map(k=>`<td>${formatearValor(fila[k])}</td>`).join("")}<td class="acciones-fila"><button class="boton-icono" data-editar="${i}">Editar</button><button class="boton-icono peligro" data-eliminar="${i}">Eliminar</button></td></tr>`).join("")}</tbody></table>`;
  document.querySelectorAll("[data-editar]").forEach(b=>b.addEventListener("click",()=>abrirFormularioDinamico(nombre,datos[Number(b.dataset.editar)])));
  document.querySelectorAll("[data-eliminar]").forEach(b=>b.addEventListener("click",()=>eliminarRegistroModulo(nombre,datos[Number(b.dataset.eliminar)])));
}

async function abrirFormularioDinamico(nombre, registro = null) {
  const modulo=MODULOS[nombre], form=document.getElementById("form-modulo-dinamico");
  registroEditando=registro;
  form.classList.remove("oculto");
  form.innerHTML = `<div class="form-modulo-titulo"><div><strong>${registro ? "Editar" : "Nuevo"} ${modulo.titulo.slice(0,-1)}</strong><small>Los datos se guardan en la API.</small></div><button type="button" class="boton-secundario" id="cancelar-form-modulo">Cancelar</button></div><div class="rejilla-formulario modulo-form-grid" id="campos-form-modulo"></div><div class="acciones-formulario"><button class="boton-primario" type="submit">${registro ? "Guardar cambios" : "Crear registro"}</button></div><p class="mensaje-formulario-dinamico"></p>`;
  const cont=document.getElementById("campos-form-modulo");
  for(const campo of modulo.campos){ cont.appendChild(await construirCampo(campo,registro?.[campo.n])); }
  document.getElementById("cancelar-form-modulo").addEventListener("click",()=>form.classList.add("oculto"));
  form.onsubmit = async e => { e.preventDefault(); await guardarRegistroModulo(nombre,form,registro); };
}

function datosFormulario(form,campos){
  const datos={};
  campos.forEach(c=>{const el=form.elements[c.n]; if(c.t==="checkbox") datos[c.n]=el.checked; else if(c.t==="number") datos[c.n]=Number(el.value); else if(c.t==="relation") datos[c.n]=el.value===""?null:Number(el.value); else datos[c.n]=el.value;});
  return datos;
}

async function guardarRegistroModulo(nombre,form,registro){
  const modulo=MODULOS[nombre], mensaje=form.querySelector(".mensaje-formulario-dinamico");
  try{
    const datos=datosFormulario(form,modulo.campos);
    const id=registro?.id;
    const datosEnvio={...datos};
    if(datosEnvio.requisito_id===null) datosEnvio.requisito_id=null;
    const respuesta=await apiFetch(`${modulo.endpoint}${id?`/${id}`:""}`,{method:id?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(datosEnvio)});
    mensaje.className="mensaje-formulario-dinamico exito"; mensaje.textContent="Guardado correctamente.";
    opcionesCache={}; await cargarModulo(nombre); form.classList.add("oculto"); cargarDashboard();
  }catch(error){mensaje.textContent=error.message; mensaje.className="mensaje-formulario-dinamico error";}
}

async function eliminarRegistroModulo(nombre,registro){
  if(!confirm(`¿Desea eliminar el registro ${registro.id}?`)) return;
  try{ await apiFetch(`${MODULOS[nombre].endpoint}/${registro.id}`,{method:"DELETE"}); opcionesCache={}; await cargarModulo(nombre); cargarDashboard(); }
  catch(error){alert(error.message);}
}

// ------------------------- Matrículas -------------------------
async function renderMatriculas(){
  const datos=await apiFetch("/matriculas"); registrosModulo=datos;
  const estudiantes=await obtenerOpciones("estudiantes"); const secciones=await obtenerOpciones("secciones");
  contenidoModulo.innerHTML=`<div class="modulo-toolbar"><div><strong>Gestión de matrículas</strong><span>Matricule estudiantes en secciones, cancele o elimine registros.</span></div></div>
  <form id="form-matricula" class="form-modulo-dinamico"><div class="rejilla-formulario modulo-form-grid"><div class="campo-modulo"><label>Estudiante</label><select name="estudiante_id" required><option value="">Seleccione</option>${estudiantes.map(e=>`<option value="${e.id}">${textoOpcion("estudiantes",e)}</option>`).join("")}</select></div><div class="campo-modulo"><label>Sección</label><select name="seccion_id" required><option value="">Seleccione</option>${secciones.map(s=>`<option value="${s.id}">${textoOpcion("secciones",s)} · ${s.periodo_nombre||""}</option>`).join("")}</select></div></div><div class="acciones-formulario"><button class="boton-primario">Matricular estudiante</button></div><p class="mensaje-formulario-dinamico"></p></form>
  <div class="contenedor-tabla modulo-tabla-wrap"><table class="tabla-modulo"><thead><tr><th>Estudiante</th><th>Asignatura</th><th>Sección</th><th>Período</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${datos.map((m,i)=>`<tr><td>${m.estudiante_cuenta} — ${m.estudiante_nombre}</td><td>${m.asignatura_codigo} — ${m.asignatura_nombre}</td><td>${m.seccion_codigo}</td><td>${m.periodo_nombre}</td><td>${m.estado}</td><td class="acciones-fila">${m.estado==="MATRICULADA"?`<button class="boton-icono" data-cancelar="${i}">Cancelar</button>`:""}<button class="boton-icono peligro" data-eliminar-m="${i}">Eliminar</button></td></tr>`).join("")}</tbody></table></div>`;
  document.getElementById("form-matricula").addEventListener("submit",async e=>{e.preventDefault();const f=e.currentTarget;const msg=f.querySelector(".mensaje-formulario-dinamico");try{await apiFetch("/matriculas",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({estudiante_id:Number(f.estudiante_id.value),seccion_id:Number(f.seccion_id.value)})});msg.textContent="Matrícula creada correctamente.";msg.className="mensaje-formulario-dinamico exito";opcionesCache={};await cargarModulo("matriculas");cargarDashboard();}catch(err){msg.textContent=err.message;msg.className="mensaje-formulario-dinamico error";}});
  contenidoModulo.querySelectorAll("[data-cancelar]").forEach(b=>b.addEventListener("click",async()=>{try{await apiFetch(`/matriculas/${datos[Number(b.dataset.cancelar)].id}/cancelar`,{method:"PATCH"});await cargarModulo("matriculas");cargarDashboard();}catch(e){alert(e.message);}}));
  contenidoModulo.querySelectorAll("[data-eliminar-m]").forEach(b=>b.addEventListener("click",async()=>{const m=datos[Number(b.dataset.eliminarM)];if(!confirm(`¿Eliminar matrícula de ${m.estudiante_nombre}?`))return;try{await apiFetch(`/matriculas/${m.id}`,{method:"DELETE"});await cargarModulo("matriculas");cargarDashboard();}catch(e){alert(e.message);}}));
}

// ------------------------- Calificaciones -------------------------
async function renderCalificaciones(){
  const datos=await apiFetch("/calificaciones");
  const matriculas=await obtenerOpciones("matriculas");
  contenidoModulo.innerHTML=`<div class="modulo-toolbar"><div><strong>Ingreso de calificaciones</strong><span>Los tres parciales calculan automáticamente la nota final y el resultado.</span></div></div>
  <form id="form-calificacion" class="form-modulo-dinamico"><div class="rejilla-formulario modulo-form-grid"><div class="campo-modulo"><label>Matrícula</label><select name="matricula_id" required><option value="">Seleccione</option>${matriculas.map(m=>`<option value="${m.id}">${m.estudiante_cuenta} — ${m.estudiante_nombre} · ${m.asignatura_codigo} ${m.seccion_codigo}</option>`).join("")}</select></div><div class="campo-modulo"><label>Primer parcial</label><input name="primer_parcial" type="number" min="0" max="100" step="0.01" required></div><div class="campo-modulo"><label>Segundo parcial</label><input name="segundo_parcial" type="number" min="0" max="100" step="0.01" required></div><div class="campo-modulo"><label>Tercer parcial</label><input name="tercer_parcial" type="number" min="0" max="100" step="0.01" required></div><div class="campo-modulo"><label>Observación</label><input name="observacion" maxlength="250"></div></div><div class="acciones-formulario"><button class="boton-primario">Guardar calificación</button></div><p class="mensaje-formulario-dinamico"></p></form>
  <div class="contenedor-tabla modulo-tabla-wrap"><table class="tabla-modulo"><thead><tr><th>Matrícula</th><th>Parcial 1</th><th>Parcial 2</th><th>Parcial 3</th><th>Nota final</th><th>Resultado</th><th>Acciones</th></tr></thead><tbody>${datos.map((c,i)=>`<tr><td>${c.matricula_id}</td><td>${c.primer_parcial}</td><td>${c.segundo_parcial}</td><td>${c.tercer_parcial}</td><td><strong>${c.nota_final}</strong></td><td>${c.resultado}</td><td><button class="boton-icono peligro" data-eliminar-c="${i}">Eliminar</button></td></tr>`).join("")}</tbody></table></div>`;
  document.getElementById("form-calificacion").addEventListener("submit",async e=>{e.preventDefault();const f=e.currentTarget,msg=f.querySelector(".mensaje-formulario-dinamico");try{await apiFetch(`/calificaciones/matricula/${f.matricula_id.value}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({primer_parcial:Number(f.primer_parcial.value),segundo_parcial:Number(f.segundo_parcial.value),tercer_parcial:Number(f.tercer_parcial.value),observacion:f.observacion.value.trim()||null})});msg.textContent="Calificación guardada. Nota final calculada automáticamente.";msg.className="mensaje-formulario-dinamico exito";opcionesCache={};await cargarModulo("calificaciones");cargarDashboard();}catch(err){msg.textContent=err.message;msg.className="mensaje-formulario-dinamico error";}});
  contenidoModulo.querySelectorAll("[data-eliminar-c]").forEach(b=>b.addEventListener("click",async()=>{const c=datos[Number(b.dataset.eliminarC)];if(!confirm(`¿Eliminar la calificación de la matrícula ${c.matricula_id}?`))return;try{await apiFetch(`/calificaciones/matricula/${c.matricula_id}`,{method:"DELETE"});opcionesCache={};await cargarModulo("calificaciones");cargarDashboard();}catch(e){alert(e.message);}}));
}

// ------------------------- Reportes -------------------------
async function renderReportes(){
  const [dash,estudiantes,secciones,docentes]=await Promise.all([apiFetch("/reportes/dashboard"),obtenerOpciones("estudiantes"),obtenerOpciones("secciones"),obtenerOpciones("docentes")]);
  contenidoModulo.innerHTML=`<div class="reporte-resumen">${[[dash.estudiantes_activos,"Estudiantes activos"],[dash.docentes_activos,"Docentes activos"],[dash.carreras_activas,"Carreras activas"],[dash.asignaturas_activas,"Asignaturas activas"],[dash.secciones_abiertas,"Secciones abiertas"],[dash.matriculas_activas,"Matrículas activas"]].map(([v,t])=>`<div><strong>${v??"—"}</strong><span>${t}</span></div>`).join("")}</div><p class="texto-periodo">${dash.periodo_activo?`Período activo: ${dash.periodo_activo}`:"No hay período activo."}</p>
  <div class="reportes-herramientas"><div class="reporte-tool"><h3>Historial del estudiante</h3><select id="reporte-estudiante"><option value="">Seleccione estudiante</option>${estudiantes.map(e=>`<option value="${e.id}">${textoOpcion("estudiantes",e)}</option>`).join("")}</select><button class="boton-primario" id="btn-historial">Consultar</button></div><div class="reporte-tool"><h3>Lista de sección</h3><select id="reporte-seccion"><option value="">Seleccione sección</option>${secciones.map(s=>`<option value="${s.id}">${textoOpcion("secciones",s)}</option>`).join("")}</select><button class="boton-primario" id="btn-lista-seccion">Consultar</button></div><div class="reporte-tool"><h3>Carga docente</h3><select id="reporte-docente"><option value="">Seleccione docente</option>${docentes.map(d=>`<option value="${d.id}">${textoOpcion("docentes",d)}</option>`).join("")}</select><button class="boton-primario" id="btn-carga">Consultar</button></div></div><div id="resultado-reporte" class="resultado-reporte"></div>`;
  document.getElementById("btn-historial").onclick=()=>consultarReporte(`/reportes/historial-estudiante/${document.getElementById("reporte-estudiante").value}`);
  document.getElementById("btn-lista-seccion").onclick=()=>consultarReporte(`/reportes/lista-seccion/${document.getElementById("reporte-seccion").value}`);
  document.getElementById("btn-carga").onclick=()=>consultarReporte(`/reportes/carga-docente/${document.getElementById("reporte-docente").value}`);
}
async function consultarReporte(path){if(path.endsWith("undefined")||path.endsWith("/")){alert("Seleccione un registro.");return;}const box=document.getElementById("resultado-reporte");box.innerHTML='<div class="tabla-vacia">Consultando...</div>';try{const d=await apiFetch(path);box.innerHTML=`<pre>${escapeHtml(JSON.stringify(d,null,2))}</pre>`;}catch(e){box.innerHTML=`<div class="tabla-vacia">${escapeHtml(e.message)}</div>`;}}
function escapeHtml(v){return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}

function formatearEncabezado(valor){return String(valor).replaceAll("_"," ").replace(/\b\w/g,l=>l.toUpperCase());}
function formatearValor(valor){if(valor===null||valor===undefined||valor==="")return "—";if(typeof valor==="object")return JSON.stringify(valor);return String(valor);}

// ------------------------- Autenticación -------------------------
formularioLogin.addEventListener("submit", async (evento) => {
  evento.preventDefault(); mensajeLogin.textContent=""; botonEntrar.disabled=true; botonEntrar.textContent="Entrando...";
  try{usuarioActual=await apiFetch("/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({usuario:campoUsuario.value.trim(),clave:campoClave.value})});mostrarDashboard();}
  catch(error){mensajeLogin.textContent=error.message.includes("401")?"Usuario o contraseña incorrectos.":"No se pudo iniciar sesión.";}
  finally{botonEntrar.disabled=false;botonEntrar.textContent="Iniciar sesión";}
});
botonSalir.addEventListener("click",()=>{usuarioActual=null;formularioLogin.reset();vistaDashboard.classList.add("oculto");vistaLogin.classList.remove("oculto");});

// ------------------------- Dashboard -------------------------
function mostrarDashboard(){vistaLogin.classList.add("oculto");vistaDashboard.classList.remove("oculto");tituloBienvenida.textContent=`Hola, ${usuarioActual.nombre_completo}`;chipUsuario.textContent=`Rol: ${usuarioActual.rol}`;construirTarjetasVacias();moduloActual=null;mostrarPanelInicio();cargarDashboard();cargarCarreras();cargarEstudiantes();}
function construirTarjetasVacias(){filaTarjetas.innerHTML="";TARJETAS_KPI.forEach(({clave,etiqueta})=>{const t=document.createElement("article");t.className="tarjeta-kpi";t.innerHTML=`<div class="valor" data-kpi="${clave}">—</div><div class="etiqueta-kpi">${etiqueta}</div>`;filaTarjetas.appendChild(t);});}
async function cargarDashboard(){try{const resumen=await apiFetch("/reportes/dashboard");TARJETAS_KPI.forEach(({clave})=>{const n=filaTarjetas.querySelector(`[data-kpi="${clave}"]`);if(n)n.textContent=resumen[clave]??"—";});textoPeriodo.textContent=resumen.periodo_activo?`Período académico activo: ${resumen.periodo_activo}`:"No hay un período académico activo.";}catch(e){textoPeriodo.textContent="No se pudieron cargar los indicadores.";}}
async function cargarCarreras(){try{const carreras=await apiFetch("/carreras?solo_activas=true");opcionesCache.carreras=carreras;campoCarrera.innerHTML='<option value="">Seleccione una carrera</option>';carreras.forEach(c=>{const o=document.createElement("option");o.value=c.id;o.textContent=`${c.codigo} — ${c.nombre}`;campoCarrera.appendChild(o);});}catch(e){campoCarrera.innerHTML='<option value="">No se pudieron cargar las carreras</option>';}}

// ------------------------- Estudiantes: se conserva el CRUD original -------------------------
formularioEstudiante.addEventListener("submit",async(e)=>{e.preventDefault();mensajeFormulario.textContent="";mensajeFormulario.className="mensaje-error";const datos={nombres:campoNombres.value.trim(),apellidos:campoApellidos.value.trim(),cuenta:campoCuenta.value.trim(),correo:campoCorreo.value.trim(),telefono:campoTelefono.value.trim()||null,fecha_nacimiento:campoNacimiento.value,carrera_id:Number(campoCarrera.value),estado:campoEstado.value};const id=campoEstudianteId.value;botonGuardarEstudiante.disabled=true;botonGuardarEstudiante.textContent="Guardando...";try{await apiFetch(`/estudiantes${id?`/${id}`:""}`,{method:id?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(datos)});mensajeFormulario.textContent=id?"Estudiante actualizado correctamente.":"Estudiante creado correctamente.";mensajeFormulario.className="mensaje-exito";cancelarEdicion();cargarDashboard();cargarEstudiantes(campoBuscar.value.trim());opcionesCache={};}catch(error){mensajeFormulario.textContent=error.message;}finally{botonGuardarEstudiante.disabled=false;botonGuardarEstudiante.textContent="Guardar estudiante";}});
function editarEstudiante(e){campoEstudianteId.value=e.id;campoNombres.value=e.nombres;campoApellidos.value=e.apellidos;campoCuenta.value=e.cuenta;campoCorreo.value=e.correo;campoTelefono.value=e.telefono??"";campoNacimiento.value=e.fecha_nacimiento;campoCarrera.value=e.carrera_id;campoEstado.value=e.estado;tituloFormulario.textContent=`Editar estudiante — ${e.nombres} ${e.apellidos}`;botonGuardarEstudiante.textContent="Guardar cambios";botonCancelarEdicion.classList.remove("oculto");}
function cancelarEdicion(){formularioEstudiante.reset();campoEstudianteId.value="";tituloFormulario.textContent="Nuevo estudiante";botonGuardarEstudiante.textContent="Guardar estudiante";botonCancelarEdicion.classList.add("oculto");}
botonCancelarEdicion.addEventListener("click",cancelarEdicion);
async function eliminarEstudiante(e){if(!confirm(`¿Eliminar a ${e.nombres} ${e.apellidos}?`))return;try{await apiFetch(`/estudiantes/${e.id}`,{method:"DELETE"});cargarDashboard();cargarEstudiantes(campoBuscar.value.trim());opcionesCache={};}catch(error){alert(error.message);}}
async function cargarEstudiantes(buscar=""){try{const estudiantes=await apiFetch(`/estudiantes${buscar?`?buscar=${encodeURIComponent(buscar)}`:""}`);renderizarTablaEstudiantes(estudiantes);opcionesCache.estudiantes=estudiantes;}catch(error){cuerpoTablaEstudiantes.innerHTML="";textoSinResultados.textContent="No se pudo cargar la lista de estudiantes.";textoSinResultados.classList.remove("oculto");}}
function renderizarTablaEstudiantes(estudiantes){cuerpoTablaEstudiantes.innerHTML="";if(!estudiantes.length){textoSinResultados.textContent="No se encontraron estudiantes con ese criterio.";textoSinResultados.classList.remove("oculto");return;}textoSinResultados.classList.add("oculto");estudiantes.forEach(e=>{const fila=document.createElement("tr");fila.innerHTML=`<td>${e.cuenta}</td><td>${e.nombres} ${e.apellidos}</td><td>${e.correo}</td><td>${e.carrera_nombre}</td><td>${pastillaEstado(e.estado)}</td><td class="acciones-fila"><button type="button" class="boton-icono" data-accion="editar">Editar</button><button type="button" class="boton-icono peligro" data-accion="eliminar">Eliminar</button></td>`;fila.querySelector('[data-accion="editar"]').onclick=()=>editarEstudiante(e);fila.querySelector('[data-accion="eliminar"]').onclick=()=>eliminarEstudiante(e);cuerpoTablaEstudiantes.appendChild(fila);});}
function pastillaEstado(estado){if(estado==="ACTIVO")return `<span class="pastilla-estado pastilla-activo">Activo</span>`;return `<span class="pastilla-estado pastilla-neutral">${({INACTIVO:"Inactivo",GRADUADO:"Graduado"})[estado]??estado}</span>`;}
botonActualizar.addEventListener("click",()=>{cargarDashboard();cargarEstudiantes(campoBuscar.value.trim());if(moduloActual)cargarModulo(moduloActual);});
campoBuscar.addEventListener("input",()=>{clearTimeout(temporizadorBusqueda);temporizadorBusqueda=setTimeout(()=>cargarEstudiantes(campoBuscar.value.trim()),300);});
