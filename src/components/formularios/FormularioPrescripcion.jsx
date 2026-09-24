// ============================================================
// components/formularios/FormularioPrescripcion.jsx - Alta/edición
// ============================================================
// Formulario de prescripciones. El backend exige rol 'medico' para
// crear y editar (routes.php), por lo que solo se muestra a médicos.
//   Alta:   POST /api/prescripciones
//           { id_paciente, id_medico, medicamentos[], indicaciones, fecha_vencimiento }
//   Edición: PUT /api/prescripciones/{id}
//           { medicamentos[], indicaciones, fecha_vencimiento }
// El paciente NO se puede cambiar en edición (el backend no lo permite),
// y los medicamentos se editan dinámicamente (agregar/quitar filas).
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, TextInput
} from 'react-native';
// Estilos compartidos de la app.
import { styles } from '../../styles';
// Cliente HTTP de la app.
import { api } from '../../api/client';
// Datos del usuario logueado (para firmar la receta con su id).
import { useAuth } from '../../context/AuthContext';
// Campo reutilizable (label + input + error).
import CampoInput from '../CampoInput';
// Selector modal para elegir el paciente.
import Selector from '../Selector';

// Props:
//  - inicial: prescripción existente (modo edición) o null (modo alta)
//  - onGuardado: () => void — avisa a la pantalla que el guardado fue exitoso
//  - onCancelar: () => void — vuelve al listado sin guardar
export default function FormularioPrescripcion({ inicial, onGuardado, onCancelar }) {
  // Usuario logueado: su id firma la receta (id_medico) al crearla.
  const { usuario } = useAuth();

  // Paciente elegido: id numérico + texto visible (nombre) para el Selector.
  const [idPaciente, setIdPaciente] = useState(inicial?.id_paciente || null);
  // Nombre del paciente (precargado en edición; elegido por el Selector en alta).
  const [nombrePaciente, setNombrePaciente] = useState(inicial?.nombre_paciente || '');
  // Medicamentos: array de {nombre, dosis}. En edición se precargan los
  // existentes; si no hay ninguno (o en alta) se empieza con una fila vacía.
  const [medicamentos, setMedicamentos] = useState(() => {
    const base = (inicial?.medicamentos || []).filter((m) => m && typeof m === 'object');
    return base.length
      ? base.map((m) => ({ nombre: m.nombre || '', dosis: m.dosis || '' }))
      : [{ nombre: '', dosis: '' }];
  });
  // Indicaciones del médico (multilínea, opcional).
  const [indicaciones, setIndicaciones] = useState(inicial?.indicaciones || '');
  // Fecha de vencimiento (opcional, formato AAAA-MM-DD).
  const [fechaVencimiento, setFechaVencimiento] = useState(
    inicial?.fecha_vencimiento || ''
  );
  // Catálogo de pacientes para el Selector (GET /api/pacientes?por_pagina=100).
  const [pacientes, setPacientes] = useState([]);
  // True mientras se descarga el catálogo (solo en alta: en edición no se usa).
  const [cargandoPacientes, setCargandoPacientes] = useState(inicial ? false : true);
  // Errores por campo: {paciente, medicamentos, fecha} con mensajes específicos.
  const [errores, setErrores] = useState({});
  // Error general del envío (mensajes del backend), si existe.
  const [error, setError] = useState('');
  // True mientras se guarda: bloquea botones y campos.
  const [cargando, setCargando] = useState(false);

  // En modo ALTA: al montar se descargan pacientes (ruta pública del backend)
  // para poder elegir a quién se prescribe.
  useEffect(() => {
    if (inicial) return; // En edición no hace falta el catálogo
    api('/pacientes', { params: { por_pagina: 100 } })
      // De cada paciente se arma {valor: id, etiqueta: "Nombre (DNI)"} del Selector
      .then((data) => {
        const lista = (data.items || []).map((p) => ({
          valor: p.id,
          etiqueta: p.nombre + (p.dni ? ` (${p.dni})` : ''),
        }));
        setPacientes(lista);
      })
      // Si falla la descarga, el Selector quedará sin opciones (y mostrará "Sin opciones")
      .catch(() => setPacientes([]))
      // En todos los casos finaliza el estado de carga del catálogo
      .finally(() => setCargandoPacientes(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Actualiza un solo campo (nombre o dosis) de un medicamento en el índice dado.
  const actualizarMedicamento = (indice, campo, valor) => {
    setMedicamentos((prev) => prev.map((m, i) => (i === indice ? { ...m, [campo]: valor } : m)));
  };

  // Agrega una fila vacía al final de la lista de medicamentos.
  const agregarMedicamento = () => {
    setMedicamentos((prev) => [...prev, { nombre: '', dosis: '' }]);
  };

  // Quita un medicamento; si era el único, lo deja vacío (nunca quedan cero filas).
  const quitarMedicamento = (indice) => {
    setMedicamentos((prev) => {
      const copia = prev.filter((_, i) => i !== indice);
      return copia.length ? copia : [{ nombre: '', dosis: '' }];
    });
  };

  // Valida la fecha opcional: si viene, debe tener formato AAAA-MM-DD.
  const validarFecha = (valor) => {
    if (!valor.trim()) return '';
    return /^\d{4}-\d{2}-\d{2}$/.test(valor.trim()) ? '' : 'Formato: AAAA-MM-DD';
  };

  // Devuelve el array de medicamentos ya "limpios" (sin filas vacías).
  const medicamentosLimpios = () =>
    medicamentos
      .filter((m) => m.nombre.trim()) // Solo filas con nombre informado
      .map((m) => ({ nombre: m.nombre.trim(), dosis: m.dosis.trim() })); // Espacios limpios

  // Guarda la receta: POST (alta) o PUT (edición) según exista 'inicial'.
  const guardar = async () => {
    // 1) Validación en el cliente (reglas espejo del backend).
    const limpios = medicamentosLimpios();
    const nuevoError = {
      // El paciente es obligatorio solo en alta (en edición ya viene fijo).
      paciente: !inicial && !idPaciente ? 'Elegí un paciente' : '',
      // Debe haber al menos un medicamento completo (regla del PrescripcionService).
      medicamentos: limpios.length === 0 ? 'Agregá al menos un medicamento' : '',
      // La fecha (si se informa) debe tener formato válido.
      fecha: validarFecha(fechaVencimiento),
    };
    setErrores(nuevoError);
    if (nuevoError.paciente || nuevoError.medicamentos || nuevoError.fecha) {
      setError('Corregí los campos marcados');
      return; // Sale sin llamar la API
    }

    // 2) Estado de carga (bloquea la interfaz mientras se envía).
    setCargando(true);
    setError('');
    try {
      // 3) En ALTA se envían todos los campos (incluida la firma del médico).
      if (!inicial) {
        const cuerpoAlta = {
          id_paciente: idPaciente,                    // A quién se prescribe
          id_medico: usuario?.id || null,             // El médico logueado firma la receta
          medicamentos: limpios,                      // Lista [{nombre, dosis}]
          indicaciones: indicaciones.trim() || null,  // Indicaciones (o null)
          fecha_vencimiento: fechaVencimiento.trim() || null, // Fecha (o null)
        };
        await api('/prescripciones', { method: 'POST', body: cuerpoAlta });
      } else {
        // 4) En EDICIÓN solo se envían los campos editables (no se cambia el paciente).
        const cuerpoEdicion = {
          medicamentos: limpios,
          indicaciones: indicaciones.trim() || null,
          fecha_vencimiento: fechaVencimiento.trim() || null,
        };
        await api(`/prescripciones/${inicial.id}`, { method: 'PUT', body: cuerpoEdicion });
      }
      // 5) Éxito: la pantalla vuelve al listado y muestra el mensaje verde.
      onGuardado();
    } catch (err) {
      // 6) Se muestra el mensaje del backend (ej: "Estado no permitido").
      setError(err.message || 'Error al guardar la prescripción');
    } finally {
      setCargando(false); // En todos los casos termina el estado de carga
    }
  };

  return (
    // KeyboardAvoidingView evita que el teclado tape los campos del formulario.
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Título según el modo: alta o edición */}
      <Text style={styles.titulo}>
        {inicial ? '✏️ Editar prescripción' : '➕ Nueva prescripción'}
      </Text>

      {/* Error general del envío, si existe */}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Campos del formulario en un ScrollView (ocupa el espacio sobrante) */}
      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        {/* En alta: Selector de pacientes (catálogo descargado del backend) */}
        {!inicial ? (
          <Selector
            etiqueta="Paciente *"
            opciones={pacientes}
            valorSeleccionado={idPaciente}
            onSeleccionar={(o) => {
              setIdPaciente(o.valor);       // Se guarda el id elegido
              setNombrePaciente(o.etiqueta); // Se guarda el texto para no repetir el lookup
            }}
            cargando={cargandoPacientes}
            error={errores.paciente}
            placeholder="Buscar paciente..."
          />
        ) : (
          // En edición: el paciente es fijo (el backend no lo deja cambiar).
          <View>
            <Text style={styles.label}>Paciente</Text>
            {/* Caja de solo lectura con el nombre del paciente */}
            <View style={[styles.input, { justifyContent: 'center' }]}>
              <Text style={{ fontSize: 16, color: '#333' }}>{nombrePaciente}</Text>
            </View>
            <Text style={styles.ayuda}>El paciente de una receta no se puede cambiar.</Text>
          </View>
        )}

        {/* Sección de medicamentos: listado dinámico con agregar/quitar */}
        <Text style={styles.label}>Medicamentos *</Text>
        {medicamentos.map((m, i) => (
          // Fila horizontal: nombre + dosis + botón para quitar
          <View key={i} style={styles.filaMedicamento}>
            {/* Nombre del medicamento (ocupa casi todo el ancho) */}
            <TextInput
              style={[styles.input, styles.campoMedicamentoNombre]}
              placeholder="Medicamento"
              value={m.nombre}
              onChangeText={(v) => actualizarMedicamento(i, 'nombre', v)}
              maxLength={100}
              editable={!cargando}
            />
            {/* Dosis del medicamento (ancho más reducido) */}
            <TextInput
              style={[styles.input, styles.campoMedicamentoDosis]}
              placeholder="Dosis"
              value={m.dosis}
              onChangeText={(v) => actualizarMedicamento(i, 'dosis', v)}
              maxLength={50}
              editable={!cargando}
            />
            {/* Botón para quitar esta fila (target táctil >= 44px) */}
            <TouchableOpacity
              style={styles.botonQuitar}
              onPress={() => quitarMedicamento(i)}
              disabled={cargando}
              accessibilityRole="button"
              accessibilityLabel="Quitar medicamento"
            >
              <Text style={{ fontSize: 20 }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}
        {/* Error de medicamentos (solo si el array quedó vacío al guardar) */}
        {errores.medicamentos ? <Text style={styles.errorCampo}>{errores.medicamentos}</Text> : null}

        {/* Botón para agregar una fila más de medicamento */}
        <TouchableOpacity
          style={[styles.botonSecundario, { marginBottom: 12 }]}
          onPress={agregarMedicamento}
          disabled={cargando}
        >
          <Text style={{ fontWeight: '600' }}>＋ Agregar medicamento</Text>
        </TouchableOpacity>

        {/* Indicaciones: multilínea, opcional */}
        <CampoInput
          etiqueta="Indicaciones"
          valor={indicaciones}
          onChange={setIndicaciones}
          placeholder="Posología, duración del tratamiento..."
          multiline
          numberOfLines={3}
          maxLength={1000}
          editable={!cargando}
        />

        {/* Fecha de vencimiento: opcional, formato AAAA-MM-DD */}
        <CampoInput
          etiqueta="Fecha de vencimiento"
          valor={fechaVencimiento}
          onChange={setFechaVencimiento}
          error={errores.fecha}
          placeholder="AAAA-MM-DD"
          keyboardType="numbers-and-punctuation"
          maxLength={10}
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