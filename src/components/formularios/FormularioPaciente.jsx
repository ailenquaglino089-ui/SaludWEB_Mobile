// ============================================================
// components/formularios/FormularioPaciente.jsx - Alta y edición
// ============================================================
// Formulario reutilizado para CREAR (POST /api/pacientes) y EDITAR
// (PUT /api/pacientes/{id}). Campos: nombre, dni y obra social.
// Las validaciones del cliente replican las del backend
// (PacienteService) para evitar idas y vueltas al servidor.
// Layout mobile: campos en ScrollView + pie FIJO con Cancelar/Guardar
// (punto "Pies fijos de formularios" de la guía de adaptación a mobile).
import React, { useState, useEffect } from 'react';
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
// Selector modal para las obras sociales.
import Selector from '../Selector';

// Props:
//  - inicial: paciente existente (modo edición) o null (modo alta)
//  - onGuardado: () => void — avisa a la pantalla que el guardado fue exitoso
//  - onCancelar: () => void — vuelve al listado sin guardar
export default function FormularioPaciente({ inicial, onGuardado, onCancelar }) {
  // Nombre del paciente (se precarga con el del registro en edición).
  const [nombre, setNombre] = useState(inicial?.nombre || '');
  // DNI del paciente (cadena vacía = no informado).
  const [dni, setDni] = useState(inicial?.dni || '');
  // Obra social elegida (por defecto la 1: mismo valor que usa el backend si no llega).
  const [idObraSocial, setIdObraSocial] = useState(inicial?.id_obra_social ?? 1);
  // Catálogo de obras sociales: [{valor: id, etiqueta: nombre_obra}] para el Selector.
  const [obrasSociales, setObrasSociales] = useState([]);
  // True mientras se descarga el catálogo (GET /api/obras-sociales).
  const [cargandoObras, setCargandoObras] = useState(true);
  // Errores por campo: {nombre, dni} con mensajes específicos.
  const [errores, setErrores] = useState({});
  // Error general del envío (mensajes del backend: DNI duplicado, etc.).
  const [error, setError] = useState('');
  // True mientras se guarda: bloquea botones y campos.
  const [cargando, setCargando] = useState(false);

  // Al montar el formulario: se descarga el catálogo de obras sociales
  // (ruta pública del backend, usada para poblar el Selector).
  useEffect(() => {
    api('/obras-sociales')
      // mapea cada obra {id, nombre_obra} a la forma {valor, etiqueta} del Selector
      .then((lista) => setObrasSociales(lista.map((o) => ({ valor: o.id, etiqueta: o.nombre_obra }))))
      // Si falla la descarga, el formulario continúa con la obra social por defecto
      .catch(() => setObrasSociales([]))
      // En todos los casos finaliza el estado de carga del catálogo
      .finally(() => setCargandoObras(false));
  }, []);

  // Valida el nombre y devuelve un mensaje específico (o '' si es válido).
  const validarNombre = (valor) => {
    if (!valor.trim()) return 'El nombre es obligatorio';   // Regla 1: requerido
    if (valor.trim().length > 150) return 'Máximo 150 caracteres'; // Regla 2: longitud
    return ''; // Sin errores
  };

  // Valida el DNI: solo se limita su longitud (mismo límite que el backend).
  const validarDni = (valor) => (valor.length > 50 ? 'Máximo 50 caracteres' : '');

  // Guarda el paciente: POST (alta) o PUT (edición) según exista 'inicial'.
  const guardar = async () => {
    // 1) Validación completa en el cliente (mismas reglas que el backend).
    const nuevoError = { nombre: validarNombre(nombre), dni: validarDni(dni) };
    setErrores(nuevoError);
    // Si algún campo falla se avisa y se corta el envío.
    if (nuevoError.nombre || nuevoError.dni) {
      setError('Corregí los campos marcados');
      return;
    }

    // 2) Se activa el estado de carga (bloquea la interfaz).
    setCargando(true);
    setError('');
    try {
      // 3) Cuerpo con el mismo formato que espera PacienteService.
      const cuerpo = {
        nombre: nombre.trim(),                  // Nombre limpio de espacios
        dni: dni.trim(),                        // DNI limpio de espacios
        id_obra_social: idObraSocial || 1,      // Obra social elegida (o la 1)
      };
      // 4) Según haya o no registro inicial se arma el método correcto.
      if (inicial) {
        await api(`/pacientes/${inicial.id}`, { method: 'PUT', body: cuerpo });
      } else {
        await api('/pacientes', { method: 'POST', body: cuerpo });
      }
      // 5) Éxito: la pantalla vuelve al listado y muestra el mensaje verde.
      onGuardado();
    } catch (err) {
      // 6) Se muestra el mensaje del backend
      //    (ej: "Ya existe un paciente con este DNI").
      setError(err.message || 'Error al guardar el paciente');
    } finally {
      setCargando(false); // En todos los casos termina el estado de carga
    }
  };

  return (
    // KeyboardAvoidingView evita que el teclado tape los campos (iOS en especial).
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Título según el modo: alta o edición */}
      <Text style={styles.titulo}>{inicial ? '✏️ Editar paciente' : '➕ Nuevo paciente'}</Text>

      {/* Error general (del envío al backend), si existe */}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Campos del formulario en un ScrollView: ocupa el espacio sobrante */}
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
        {/* DNI: opcional, con teclado numérico */}
        <CampoInput
          etiqueta="DNI"
          valor={dni}
          onChange={setDni}
          error={errores.dni}
          placeholder="Número de documento"
          keyboardType="number-pad"
          maxLength={50}
          editable={!cargando}
        />
        {/* Obra social: catálogo descargado del backend en un Selector */}
        <Selector
          etiqueta="Obra social"
          opciones={obrasSociales}
          valorSeleccionado={idObraSocial}
          onSeleccionar={(o) => setIdObraSocial(o.valor)}
          cargando={cargandoObras}
          placeholder="Seleccionar..."
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