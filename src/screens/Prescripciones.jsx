// ============================================================
// Prescripciones.jsx - Listado y CRUD de prescripciones
// ============================================================
// Listado paginado con filtro por estado + CRUD:
//  - Alta/edición: SOLO médicos (routes.php exige rol 'medico').
//  - Cambiar estado: cualquier usuario autenticado (PATCH /estado).
//  - Borrado: SOLO admins (routes.php exige rol 'admin').
// Usa el formulario FormularioPrescripcion, el diálogo ConfirmarModal
// y un Modal nativo de cambio de estado (ModalEstado).
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
// Listado paginado genérico reutilizable.
import PagedList from './PagedList';
// Formulario de alta/edición de prescripciones.
import FormularioPrescripcion from '../components/formularios/FormularioPrescripcion';
// Diálogo de confirmación para eliminar.
import ConfirmarModal from '../components/ConfirmarModal';
// Estilos compartidos.
import { styles } from '../styles';
// Cliente HTTP de la app (DELETE y PATCH de prescripciones).
import { api } from '../api/client';
// Contexto de autenticación (para conocer el rol del usuario).
import { useAuth } from '../context/AuthContext';

// Devuelve la etiqueta con ícono del estado (igual que getStatusBadge del Web).
const etiquetaEstado = (estado) => {
  if (estado === 'activa') return '✓ Activa';          // Estado vigente
  if (estado === 'vencida') return '⚠ Vencida';        // Expirada
  if (estado === 'dispensada') return '✓ Dispensada';  // Entregada en farmacia
  if (estado === 'cancelada') return '✗ Cancelada';    // Anulada
  return estado; // Cualquier otro valor se muestra tal cual
};

// Devuelve el color del estado (igual que getStatusColor del Web).
const colorEstado = (estado) => {
  if (estado === 'activa') return '#22c55e';    // Verde
  if (estado === 'vencida') return '#f59e0b';   // Ámbar
  if (estado === 'dispensada') return '#3b82f6';   // Azul
  if (estado === 'cancelada') return '#ef4444'; // Rojo
  return '#6b7280'; // Gris para valores no previstos
};

// Modal de cambio de estado: lista las 4 opciones permitidas
// (misma whitelist del backend PrescripcionService) y marca la vigente.
// Props: prescripcion (o null para oculto), cargando, alElegir, alCerrar.
function ModalEstado({ prescripcion, cargando, alElegir, alCerrar }) {
  // Estados posibles de una prescripción (coinciden con el backend).
  const OPCIONES = ['activa', 'vencida', 'dispensada', 'cancelada'];

  return (
    // Modal nativo: se cierra con onRequestClose (escape) o el botón Cancelar.
    <Modal
      visible={prescripcion !== null}
      transparent
      animationType="fade"
      onRequestClose={alCerrar}
    >
      {/* Fondo oscuro: centra el diálogo */}
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        {/* Tarjeta blanca del diálogo */}
        <View style={[styles.tarjeta, { marginBottom: 0 }]}>
          <Text style={[styles.titulo, { fontSize: 18 }]}>Cambiar estado</Text>
          {/* Contexto: a qué prescripción se le cambia el estado */}
          <Text style={styles.texto}>Receta de {prescripcion?.nombre_paciente || '...'}:</Text>

          {/* Lista de estados: un botón por cada estado permitido */}
          {OPCIONES.map((estado) => (
            <TouchableOpacity
              key={estado}
              style={{
                flexDirection: 'row',                 // Etiqueta + check en horizontal
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: 44,                        // Target táctil mínimo 44px (guía)
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: '#e0e0e0',
                // Resalta la opción que ya está vigente
                backgroundColor: prescripcion?.estado === estado ? '#eef2ff' : 'transparent',
              }}
              onPress={() => alElegir(estado)}
              disabled={cargando}
            >
              {/* Etiqueta del estado con su color característico */}
              <Text style={{ fontSize: 16, color: colorEstado(estado), fontWeight: '600' }}>
                {etiquetaEstado(estado)}
              </Text>
              {/* Check: marca el estado vigente de la prescripción */}
              {prescripcion?.estado === estado ? <Text>✅</Text> : null}
            </TouchableOpacity>
          ))}

          {/* Botón para cerrar el diálogo sin cambiar nada */}
          <TouchableOpacity
            style={[styles.botonSecundario, { marginTop: 12 }]}
            onPress={alCerrar}
            disabled={cargando}
          >
            <Text style={{ fontWeight: '600' }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function Prescripciones() {
  // Usuario logueado: su rol decide qué acciones de CRUD se muestran.
  const { usuario } = useAuth();
  // Médicos: crean y editan prescripciones (regla de negocio del backend).
  const esMedico = usuario?.tipo_usuario === 'medico';
  // Admins: solo pueden eliminar prescripciones (no recetar).
  const esAdmin = usuario?.tipo_usuario === 'admin';

  // Modo de la pantalla: 'lista' | 'nuevo' (alta) | 'editar'.
  const [modo, setModo] = useState('lista');
  // Prescripción que se está editando (null en modo alta).
  const [editando, setEditando] = useState(null);
  // Prescripción pendiente de confirmar su borrado (null = diálogo cerrado).
  const [borrar, setBorrar] = useState(null);
  // Prescripción a la que se le cambia el estado (null = modal cerrado).
  const [cambiarEstado, setCambiarEstado] = useState(null);
  // True mientras el backend procesa el borrado (bloquea el diálogo).
  const [cargandoBorrado, setCargandoBorrado] = useState(false);
  // True mientras el backend procesa el cambio de estado.
  const [cargandoEstado, setCargandoEstado] = useState(false);
  // Mensaje verde de éxito (tras guardar/borrar/cambiar estado).
  const [mensajeExito, setMensajeExito] = useState('');
  // Mensaje rojo de error (ej: no se pudo eliminar).
  const [mensajeError, setMensajeError] = useState('');
  // Llave del listado: al incrementarla PagedList se remonta y recarga.
  const [claveLista, setClaveLista] = useState(0);

  // Vuelve al listado tras un guardado exitoso y fuerza la recarga.
  const alGuardado = () => {
    setMensajeExito('Prescripción guardada correctamente');
    setModo('lista');
    setEditando(null);
    setClaveLista((c) => c + 1); // Remonta el listado para ver el cambio
  };

  // Cierra el diálogo de confirmación de borrado (sin borrar).
  const cancelarBorrado = () => {
    if (!cargandoBorrado) setBorrar(null);
  };

  // Confirma el borrado: DELETE /api/prescripciones/{id} (ruta solo admin).
  const confirmarBorrado = async () => {
    setCargandoBorrado(true);
    try {
      // Se elimina la prescripción en el backend.
      await api(`/prescripciones/${borrar.id}`, { method: 'DELETE' });
      // Éxito: se informa y se recarga el listado sin el registro.
      setMensajeExito('Prescripción eliminada correctamente');
      setBorrar(null);
      setClaveLista((c) => c + 1);
    } catch (err) {
      // Error: se muestra el mensaje y se cierra el diálogo.
      setMensajeError(err.message || 'No se pudo eliminar la prescripción');
      setBorrar(null);
    } finally {
      setCargandoBorrado(false); // En todos los casos termina el estado de borrado
    }
  };

  // Cambia el estado elegido: PATCH /api/prescripciones/{id}/estado
  // (ruta protegida: cualquier usuario autenticado puede hacerlo).
  const confirmarEstado = async (nuevoEstado) => {
    setCargandoEstado(true);
    try {
      // Se envía el nuevo estado al endpoint /estado de la prescripción.
      await api(`/prescripciones/${cambiarEstado.id}/estado`, {
        method: 'PATCH',
        body: { estado: nuevoEstado },
      });
      // Éxito: se informa y se recarga el listado con el estado nuevo.
      setMensajeExito('Estado actualizado correctamente');
      setCambiarEstado(null);
      setClaveLista((c) => c + 1);
    } catch (err) {
      // Error: se muestra el mensaje y se cierra el modal.
      setMensajeError(err.message || 'No se pudo actualizar el estado');
      setCambiarEstado(null);
    } finally {
      setCargandoEstado(false); // En todos los casos termina el estado de carga
    }
  };

  // Si no se está en el listado, se muestra el formulario (alta o edición).
  if (modo !== 'lista') {
    return (
      <FormularioPrescripcion
        inicial={modo === 'editar' ? editando : null} // En alta no hay registro inicial
        onGuardado={alGuardado}
        onCancelar={() => { setModo('lista'); setEditando(null); }} // Vuelta sin guardar
      />
    );
  }

  // Listado paginado + acciones de CRUD.
  return (
    <View style={{ flex: 1 }}>
      {/* Banners de feedback: éxito (verde) y error (rojo), si existen */}
      {mensajeExito ? <Text style={styles.exito}>{mensajeExito}</Text> : null}
      {mensajeError ? <Text style={styles.error}>{mensajeError}</Text> : null}

      <PagedList
        key={claveLista}                  // Al cambiar la clave se remonta y recarga
        url="/prescripciones"             // Ruta del backend (paginada + filtro estado)
        titulo="💊 Prescripciones"
        placeholder="Buscar por medicamento, paciente o médico..."
        campos={[
          { clave: 'medicamentos', etiqueta: 'Medicamentos' }, // Lista de medicamentos
          { clave: 'nombre_paciente', etiqueta: 'Paciente' },  // Paciente al que se recetó
          { clave: 'nombre_medico', etiqueta: 'Médico' },       // Médico que recetó
          { clave: 'estado', etiqueta: 'Estado' },              // Estado vigente
        ]}
        // Filtros tipo chip para el campo "estado" (se envían como ?estado=...).
        filtros={[
          { valor: 'activa', etiqueta: '✓ Activa' },
          { valor: 'vencida', etiqueta: '⚠ Vencida' },
          { valor: 'dispensada', etiqueta: '✓ Dispensada' },
          { valor: 'cancelada', etiqueta: '✗ Cancelada' },
        ]}
        // Personaliza los valores: medicamentos se unen y el estado se pinta con color.
        renderValor={(registro, campo) => {
          // Medicamentos: array de {nombre, dosis} que se formatea "Nombre (Dosis)".
          if (campo.clave === 'medicamentos') {
            return (registro.medicamentos || [])
              .map((m) => `${m.nombre}${m.dosis ? ` (${m.dosis})` : ''}`)
              .join(', ');
          }
          // Estado: se muestra el badge coloreado con la etiqueta del estado.
          if (campo.clave === 'estado') {
            return etiquetaEstado(registro.estado);
          }
          // Cualquier otro campo se muestra con su valor por defecto.
          return registro[campo.clave] ?? '—';
        }}
        // Alta: solo el médico ve el botón "Nuevo" (regla de recetar).
        onNuevo={esMedico ? () => setModo('nuevo') : null}
        // Acciones por tarjeta según el rol del usuario logueado.
        renderAcciones={(item) => (
          <>
            {/* Editar: SOLO médico (el backend rechaza a otros roles con 403) */}
            {esMedico && (
              <TouchableOpacity
                style={[styles.botonAccion, styles.botonAccionClaro]}
                onPress={() => { setEditando(item); setModo('editar'); }}
              >
                <Text style={styles.textoAccion}>✏️ Editar</Text>
              </TouchableOpacity>
            )}
            {/* Cambiar estado: cualquier usuario autenticado puede hacerlo */}
            <TouchableOpacity
              style={[styles.botonAccion, { backgroundColor: '#e0f2fe' }]}
              onPress={() => setCambiarEstado(item)}
            >
              <Text style={{ color: '#0369a1', fontWeight: '600', fontSize: 14 }}>🔁 Estado</Text>
            </TouchableOpacity>
            {/* Eliminar: SOLO admin */}
            {esAdmin && (
              <TouchableOpacity
                style={[styles.botonAccion, styles.botonAccionPeligro]}
                onPress={() => setBorrar(item)}
              >
                <Text style={styles.textoAccionPeligro}>🗑️ Eliminar</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      />

      {/* Diálogo de confirmación: pregunta antes de borrar la prescripción */}
      <ConfirmarModal
        visible={borrar !== null}
        titulo="Eliminar prescripción"
        mensaje={`¿Eliminar la receta de "${borrar?.nombre_paciente}"? Esta acción no se puede deshacer.`}
        alConfirmar={confirmarBorrado}
        alCancelar={cancelarBorrado}
        cargando={cargandoBorrado}
      />

      {/* Modal de cambio de estado: elige entre las 4 opciones permitidas */}
      <ModalEstado
        prescripcion={cambiarEstado}
        cargando={cargandoEstado}
        alElegir={confirmarEstado}
        alCerrar={() => { if (!cargandoEstado) setCambiarEstado(null); }}
      />
    </View>
  );
}