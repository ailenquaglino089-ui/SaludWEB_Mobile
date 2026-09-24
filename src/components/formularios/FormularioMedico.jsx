// ============================================================
// components/formularios/FormularioMedico.jsx - Alta y edición
// ============================================================
// Formulario reutilizado para CREAR (POST /api/medicos) y EDITAR
// (PUT /api/medicos/{id}) de médicos. Campos: nombre, matrícula y
// especialidad. El backend exige rol admin para ambas operaciones
// (routes.php), por lo que la pantalla solo lo muestra a admins.
// Validaciones en cliente = mismas reglas que MedicoService.
// Layout: campos en ScrollView + pie FIJO con Cancelar/Guardar.
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from 'react-native';
// Estilos compartidos de la app.
import { styles } from '../../styles';
// Cliente HTTP de la app.
import { api } from '../../api/client';
// Campo reutilizable (label + input + error).
import CampoInput from '../CampoInput';

// Props:
//  - inicial: médico existente (modo edición) o null (modo alta)
//  - onGuardado: () => void — avisa a la pantalla que el guardado fue exitoso
//  - onCancelar: () => void — vuelve al listado sin guardar
export default function FormularioMedico({ inicial, onGuardado, onCancelar }) {
  // Nombre del médico (se precarga con el del registro en edición).
  const [nombre, setNombre] = useState(inicial?.nombre || '');
  // Matrícula profesional (cadena vacía = no informada).
  const [matricula, setMatricula] = useState(inicial?.matricula || '');
  // Especialidad (cadena vacía = sin especialidad declarada).
  const [especialidad, setEspecialidad] = useState(inicial?.especialidad || '');
  // Errores por campo: {nombre} con mensajes específicos.
  const [errores, setErrores] = useState({});
  // Error general del envío (mensajes del backend), si existe.
  const [error, setError] = useState('');
  // True mientras se guarda: bloquea botones y campos.
  const [cargando, setCargando] = useState(false);

  // Valida el nombre y devuelve un mensaje específico (o '' si es válido).
  const validarNombre = (valor) => {
    if (!valor.trim()) return 'El nombre es obligatorio';        // Regla 1: requerido
    if (valor.trim().length > 150) return 'Máximo 150 caracteres'; // Regla 2: longitud
    return ''; // Sin errores
  };

  // Guarda el médico: POST (alta) o PUT (edición) según exista 'inicial'.
  const guardar = async () => {
    // 1) Validación del nombre en el cliente (regla del backend).
    const nuevoError = { nombre: validarNombre(nombre) };
    setErrores(nuevoError);
    if (nuevoError.nombre) {
      setError('Corregí el campo marcado');
      return; // Sale sin llamar la API
    }

    // 2) Estado de carga (bloquea la interfaz mientras se envía).
    setCargando(true);
    setError('');
    try {
      // 3) Cuerpo con el mismo formato que espera MedicoService.
      const cuerpo = {
        nombre: nombre.trim(),        // Nombre limpio de espacios
        matricula: matricula.trim(),  // Matrícula limpia de espacios
        especialidad: especialidad.trim(), // Especialidad limpia de espacios
      };
      // 4) POST (crear) o PUT (editar) según exista o no registro inicial.
      if (inicial) {
        await api(`/medicos/${inicial.id}`, { method: 'PUT', body: cuerpo });
      } else {
        await api('/medicos', { method: 'POST', body: cuerpo });
      }
      // 5) Éxito: la pantalla vuelve al listado y muestra el mensaje verde.
      onGuardado();
    } catch (err) {
      // 6) Se muestra el mensaje del backend (ej: campos con longitud excedida).
      setError(err.message || 'Error al guardar el médico');
    } finally {
      setCargando(false); // En todos los casos termina el estado de carga
    }
  };

  return (
    // KeyboardAvoidingView evita que el teclado tape los campos.
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Título según el modo: alta o edición */}
      <Text style={styles.titulo}>{inicial ? '✏️ Editar médico' : '➕ Nuevo médico'}</Text>

      {/* Error general del envío, si existe */}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Campos del formulario en un ScrollView (ocupa el espacio sobrante) */}
      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        {/* Nombre: obligatorio */}
        <CampoInput
          etiqueta="Nombre *"
          valor={nombre}
          onChange={setNombre}
          error={errores.nombre}
          placeholder="Nombre y apellido"
          maxLength={150}
          autoCapitalize="words"
          editable={!cargando}
        />
        {/* Matrícula: opcional */}
        <CampoInput
          etiqueta="Matrícula"
          valor={matricula}
          onChange={setMatricula}
          placeholder="Número de matrícula"
          maxLength={50}
          editable={!cargando}
        />
        {/* Especialidad: opcional */}
        <CampoInput
          etiqueta="Especialidad"
          valor={especialidad}
          onChange={setEspecialidad}
          placeholder="Ej: Clínica, Cardiología..."
          maxLength={100}
          autoCapitalize="words"
          editable={!cargando}
        />
      </ScrollView>

      {/* Pie FIJO: acciones siempre accesibles en la zona del pulgar */}
      <View style={styles.pieFormulario}>
        {/* Cancela y vuelve al listado sin guardar */}
        <TouchableOpacity
          style={[styles.botonSecundario, styles.botonMitad]}
          onPress={onCancelar}
          disabled={cargando}
        >
          <Text style={{ fontWeight: '600' }}>Cancelar</Text>
        </TouchableOpacity>

        {/* Guarda: ruleta mientras procesa; texto cambia según el modo */}
        <TouchableOpacity
          style={[styles.botonPrimario, styles.botonMitad, { marginBottom: 0 }]}
          onPress={guardar}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonPrimarioTexto}>
              {inicial ? 'Guardar cambios' : 'Guardar'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}