// ============================================================
// Pacientes.jsx - Listado y CRUD de pacientes
// ============================================================
// Muestra el listado paginado (PagedList) y, según la acción elegida,
// el formulario de alta/edición (FormularioPaciente) o el diálogo de
// confirmación de borrado (ConfirmarModal). Consume /api/pacientes
// con POST (crear), PUT (editar) y DELETE (eliminar; solo admin).
// Regla de negocio: la gestión de pacientes es administrativa.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
// Listado paginado genérico reutilizable.
import PagedList from './PagedList';
// Formulario de alta/edición de pacientes.
import FormularioPaciente from '../components/formularios/FormularioPaciente';
// Diálogo de confirmación para eliminar.
import ConfirmarModal from '../components/ConfirmarModal';
// Estilos compartidos.
import { styles } from '../styles';
// Cliente HTTP de la app (DELETE de pacientes).
import { api } from '../api/client';
// Contexto de autenticación (para conocer el rol del usuario).
import { useAuth } from '../context/AuthContext';

export default function Pacientes() {
  // Usuario logueado: su rol decide qué acciones de CRUD se muestran.
  const { usuario } = useAuth();
  // Solo el admin gestiona pacientes (regla administrativa del sistema).
  const esAdmin = usuario?.tipo_usuario === 'admin';

  // Modo de la pantalla: 'lista' (listado) | 'nuevo' (alta) | 'editar'.
  const [modo, setModo] = useState('lista');
  // Paciente que se está editando (null en modo alta).
  const [editando, setEditando] = useState(null);
  // Paciente pendiente de confirmar su borrado (null = diálogo cerrado).
  const [borrar, setBorrar] = useState(null);
  // True mientras el backend procesa el borrado (bloquea el diálogo).
  const [cargandoBorrado, setCargandoBorrado] = useState(false);
  // Mensaje verde de éxito (aparece al volver al listado tras guardar/borrar).
  const [mensajeExito, setMensajeExito] = useState('');
  // Mensaje rojo de error (ej: no se pudo eliminar).
  const [mensajeError, setMensajeError] = useState('');
  // Llave del listado: al incrementarla PagedList se remonta y recarga los datos,
  // reflejando los cambios del CRUD sin recargar toda la app.
  const [claveLista, setClaveLista] = useState(0);

  // Vuelve al listado tras un guardado exitoso y fuerza la recarga.
  const alGuardado = () => {
    setMensajeExito('Paciente guardado correctamente');
    setModo('lista');
    setEditando(null);
    setClaveLista((c) => c + 1); // Remonta el listado para ver el cambio
  };

  // Cierra el diálogo de confirmación (sin borrar).
  const cancelarBorrado = () => {
    if (!cargandoBorrado) setBorrar(null);
  };

  // Confirma el borrado: DELETE /api/pacientes/{id} (ruta solo admin).
  const confirmarBorrado = async () => {
    setCargandoBorrado(true);
    try {
      // Se elimina el paciente en el backend.
      await api(`/pacientes/${borrar.id}`, { method: 'DELETE' });
      // Éxito: se informa y se recarga el listado sin el registro.
      setMensajeExito('Paciente eliminado correctamente');
      setBorrar(null);
      setClaveLista((c) => c + 1);
    } catch (err) {
      // Error: se muestra el mensaje y se cierra el diálogo.
      setMensajeError(err.message || 'No se pudo eliminar el paciente');
      setBorrar(null);
    } finally {
      setCargandoBorrado(false); // En todos los casos termina el estado de borrado
    }
  };

  // Si no se está en el listado, se muestra el formulario (alta o edición).
  if (modo !== 'lista') {
    return (
      <FormularioPaciente
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
        url="/pacientes"                  // Ruta del backend (paginada)
        titulo="👤 Pacientes"
        placeholder="Buscar por nombre, DNI u obra social..."
        campos={[
          { clave: 'nombre', etiqueta: 'Nombre' },       // Nombre completo
          { clave: 'dni', etiqueta: 'DNI' },             // Número de documento
          { clave: 'obra_social', etiqueta: 'Obra Social' }, // Obra social (o null)
        ]}
        // Alta: solo admin ve el botón "Nuevo" (regla administrativa).
        onNuevo={esAdmin ? () => setModo('nuevo') : null}
        // Acciones sobre cada tarjeta (también solo admin).
        renderAcciones={esAdmin ? (item) => (
          <>
            {/* Editar: abre el formulario precargado con el paciente */}
            <TouchableOpacity
              style={[styles.botonAccion, styles.botonAccionClaro]}
              onPress={() => { setEditando(item); setModo('editar'); }}
            >
              <Text style={styles.textoAccion}>✏️ Editar</Text>
            </TouchableOpacity>
            {/* Eliminar: abre el diálogo de confirmación de borrado */}
            <TouchableOpacity
              style={[styles.botonAccion, styles.botonAccionPeligro]}
              onPress={() => setBorrar(item)}
            >
              <Text style={styles.textoAccionPeligro}>🗑️ Eliminar</Text>
            </TouchableOpacity>
          </>
        ) : null}
      />

      {/* Diálogo de confirmación: pregunta antes de borrar el paciente */}
      <ConfirmarModal
        visible={borrar !== null}
        titulo="Eliminar paciente"
        mensaje={`¿Eliminar a "${borrar?.nombre}"? Esta acción no se puede deshacer.`}
        alConfirmar={confirmarBorrado}
        alCancelar={cancelarBorrado}
        cargando={cargandoBorrado}
      />
    </View>
  );
}