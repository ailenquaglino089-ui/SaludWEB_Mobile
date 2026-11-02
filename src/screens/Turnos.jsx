// ============================================================
// Turnos.jsx - Reserva y gestión de turnos para pacientes
// ============================================================
// Flujo de reserva en una sola pantalla, con pasos internos:
//   1. Elegir profesional
//   2. Elegir día y horario
//   3. Confirmar (con motivo opcional)
//   4. Turno reservado
//
// Por qué los pasos son estado local y no pantallas separadas:
// App.js usa navegación plana por estado, sin stack ni historial. Encadenar
// cuatro claves de pantalla obligaría a agregar un historial a mano. Con un
// único destino 'turnos' y pasos internos, el botón "atrás" del sistema no
// tiene que deshacer nada y la navegación inferior sigue funcionando igual.
//
// La reserva exige que la cuenta esté vinculada a una ficha de paciente.
// Si no lo está, esta pantalla ofrece vincular el DNI ahí mismo, en vez de
// mandar a la persona a la web.
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  ScrollView, Alert,
} from 'react-native';
import { styles } from '../styles';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

// Nombres de los días en el orden del backend (1 = lunes ... 7 = domingo).
const NOMBRES_DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const NOMBRES_DIAS_LARGOS = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo',
];
const NOMBRE_MES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// ------------------------------------------------------------
// Utilidades de fecha
// ------------------------------------------------------------
// Igual que en la web: NO se usa new Date('YYYY-MM-DD'), porque el
// constructor de texto interpreta UTC y en Argentina eso cae el día anterior.
const aFechaISO = (fecha) => {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const aDiaDeSemana = (dia) => (dia === 0 ? 7 : dia);

const unicos = (lista) => [...new Set(lista)];

// Construye los próximos días en los que el profesional atiende.
const construirDias = (diasAtencion, cantidad) => {
  if (!diasAtencion || diasAtencion.length === 0) return [];

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const resultado = [];
  const tope = cantidad * 7;

  for (let i = 0; i < tope && resultado.length < cantidad; i += 1) {
    const dia = new Date(hoy);
    dia.setDate(hoy.getDate() + i);

    const diaSemana = aDiaDeSemana(dia.getDay());

    if (diasAtencion.includes(diaSemana)) {
      resultado.push({
        fecha: aFechaISO(dia),
        nombre: NOMBRES_DIAS[diaSemana - 1],
        diaDelMes: dia.getDate(),
      });
    }
  }

  return resultado;
};

const formatearFechaLarga = (iso) => {
  if (!iso) return '';
  const [anio, mes, dia] = iso.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return `${NOMBRES_DIAS_LARGOS[aDiaDeSemana(fecha.getDay()) - 1]} ${dia} de ${NOMBRE_MES[mes - 1]}`;
};

// Normaliza listados: la API puede devolver un arreglo o { items: [...] }.
const normalizarLista = (datos) => {
  if (Array.isArray(datos)) return datos;
  if (Array.isArray(datos?.items)) return datos.items;
  return [];
};

export default function Turnos() {
  const { usuario } = useAuth();

  // Pestaña activa: reservar o ver los turnos propios.
  const [tab, setTab] = useState('reservar');

  // Control de la ficha del paciente. null = todavía no se consultó.
  const [ficha, setFicha] = useState(null);
  const [cargandoFicha, setCargandoFicha] = useState(true);
  const [documento, setDocumento] = useState('');
  const [vinculando, setVinculando] = useState(false);

  // Catálogo de profesionales.
  const [medicos, setMedicos] = useState([]);
  const [cargandoMedicos, setCargandoMedicos] = useState(true);

  // Profesional elegido y agenda.
  const [medico, setMedico] = useState(null);
  const [diasAtencion, setDiasAtencion] = useState(null);
  const [cargandoDias, setCargandoDias] = useState(false);
  const [fecha, setFecha] = useState('');
  const [slots, setSlots] = useState(null);
  const [cargandoSlots, setCargandoSlots] = useState(false);
  // Contador que fuerza a releer la agenda después de reservar: el horario
  // recién tomado tiene que aparecer ocupado sin cambiar de médico ni de día.
  const [recargaSlots, setRecargaSlots] = useState(0);

  // Horario elegido y motivo.
  const [hora, setHora] = useState('');
  const [motivo, setMotivo] = useState('');
  const [reservando, setReservando] = useState(false);

  // Turnos propios.
  const [turnos, setTurnos] = useState([]);
  const [cargandoTurnos, setCargandoTurnos] = useState(false);
  const [accionEnCurso, setAccionEnCurso] = useState(null);

  // Mensajes.
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Derivados del rol y de la ficha, usados tanto por los efectos como por el
  // render. Se calculan acá arriba para no referenciarlos antes de declararlos.
  const esPaciente = usuario?.tipo_usuario === 'paciente';
  const puedeReservar = Boolean(ficha?.vinculada);

  // ------------------------------------------------------------
  // Ficha del paciente
  // ------------------------------------------------------------
  // El login no devuelve id_paciente, así que se consulta /auth/me. Sin ese
  // vínculo el backend rechaza la reserva: sabe quién sos, pero no a qué
  // ficha clínica asignar el turno.
  useEffect(() => {
    let cancelado = false;

    async function cargarFicha() {
      if (usuario?.tipo_usuario !== 'paciente') {
        // Un médico o admin reserva para terceros desde la web. Acá solo se
        // muestra el aviso; no se inventa un selector de pacientes.
        setFicha({ vinculada: false, noPaciente: true });
        setCargandoFicha(false);
        return;
      }

      try {
        const yo = await api('/auth/me');
        const idFicha = Number(yo?.id_paciente) || null;
        if (!cancelado) {
          setFicha({ vinculada: Boolean(idFicha), id_paciente: idFicha });
        }
      } catch {
        if (!cancelado) setFicha({ vinculada: false, id_paciente: null });
      } finally {
        if (!cancelado) setCargandoFicha(false);
      }
    }

    cargarFicha();
    return () => { cancelado = true; };
  }, [usuario?.tipo_usuario]);

  // ------------------------------------------------------------
  // Catálogo de profesionales
  // ------------------------------------------------------------
  useEffect(() => {
    let cancelado = false;

    async function cargarMedicos() {
      try {
        const datos = await api('/medicos', {
          params: { activo: 1, por_pagina: 50 },
        });
        if (!cancelado) setMedicos(normalizarLista(datos));
      } catch (err) {
        if (!cancelado) setError(err.message || 'No se pudieron cargar los profesionales');
      } finally {
        if (!cancelado) setCargandoMedicos(false);
      }
    }

    cargarMedicos();
    return () => { cancelado = true; };
  }, []);

  // ------------------------------------------------------------
  // Agenda del profesional
  // ------------------------------------------------------------
  const elegirMedico = async (elegido) => {
    setMedico(elegido);
    setDiasAtencion(null);
    setFecha('');
    setSlots(null);
    setHora('');
    setMotivo('');
    setError('');
    setExito('');
    setCargandoDias(true);

    try {
      const bloques = await api('/disponibilidades', {
        params: { id_medico: elegido.id },
      });
      const lista = normalizarLista(bloques);
      const dias = unicos(lista.map((b) => Number(b.dia_semana)))
        .filter((d) => d >= 1 && d <= 7)
        .sort((a, b) => a - b);

      setDiasAtencion(dias);

      const proximos = construirDias(dias, 7);
      if (proximos.length > 0) {
        setFecha(proximos[0].fecha);
      }
    } catch (err) {
      setError(err.message || 'No se pudo cargar la agenda del profesional');
    } finally {
      setCargandoDias(false);
    }
  };

  // Se consultan los horarios cada vez que cambia el profesional o el día.
  useEffect(() => {
    if (!medico || !fecha) return undefined;

    let cancelado = false;

    async function cargarSlots() {
      setCargandoSlots(true);
      setError('');
      try {
        const datos = await api('/citas/disponibilidad', {
          params: { id_medico: medico.id, fecha },
        });
        if (!cancelado) setSlots(datos?.slots ?? []);
      } catch (err) {
        if (!cancelado) {
          setSlots([]);
          setError(err.message || 'No se pudieron cargar los horarios');
        }
      } finally {
        if (!cancelado) setCargandoSlots(false);
      }
    }

    cargarSlots();
    return () => { cancelado = true; };
  }, [medico, fecha, recargaSlots]);

  const dias = construirDias(diasAtencion, 7);

  // ------------------------------------------------------------
  // Vincular ficha
  // ------------------------------------------------------------
  const vincularFicha = async () => {
    const dni = documento.trim();
    if (!dni) {
      setError('Ingresá tu DNI para vincular la ficha');
      return;
    }

    setVinculando(true);
    setError('');
    try {
      await api('/auth/vincular', {
        method: 'POST',
        body: { tipo: 'paciente', documento: dni },
      });
      const yo = await api('/auth/me');
      const idFicha = Number(yo?.id_paciente) || null;
      setFicha({ vinculada: Boolean(idFicha), id_paciente: idFicha });
      setDocumento('');
      setExito('Ficha vinculada. Ya podés reservar tu turno.');
    } catch (err) {
      setError(err.message || 'No se pudo vincular la ficha');
    } finally {
      setVinculando(false);
    }
  };

  // ------------------------------------------------------------
  // Reservar
  // ------------------------------------------------------------
  const reservar = async () => {
    if (!medico || !fecha || !hora) {
      setError('Elegí un profesional, un día y un horario');
      return;
    }
    if (!ficha?.vinculada) {
      setError('Para reservar necesitás vincular tu ficha de paciente');
      return;
    }

    setReservando(true);
    setError('');
    try {
      await api('/citas', {
        method: 'POST',
        body: {
          id_medico: medico.id,
          fecha,
          hora,
          motivo: motivo.trim() || null,
        },
      });
      setExito(`Turno reservado para el ${formatearFechaLarga(fecha)} a las ${hora} hs.`);
      setHora('');
      setMotivo('');
      // Se recarga la agenda para que el horario recién tomado figure ocupado.
      setRecargaSlots((n) => n + 1);
      // La lista de "Mis turnos" quedó vieja: se invalida.
      setTurnos([]);
    } catch (err) {
      setError(err.message || 'No se pudo reservar el turno');
    } finally {
      setReservando(false);
    }
  };

  const reiniciarReserva = () => {
    setExito('');
    setError('');
    setMedico(null);
    setDiasAtencion(null);
    setFecha('');
    setSlots(null);
    setHora('');
    setMotivo('');
  };

  // ------------------------------------------------------------
  // Mis turnos
  // ------------------------------------------------------------
  const cargarTurnos = useCallback(async () => {
    setCargandoTurnos(true);
    setError('');
    try {
      const datos = await api('/citas', {
        params: { mias: 1, por_pagina: 50 },
      });
      setTurnos(normalizarLista(datos));
    } catch (err) {
      setError(err.message || 'No se pudieron cargar tus turnos');
    } finally {
      setCargandoTurnos(false);
    }
  }, []);

  useEffect(() => {
    if (tab !== 'turnos') return;

    // Sin ficha vinculada el backend responde 403. No tiene sentido golpear la
    // API para mostrar un error técnico: se explica qué falta y se sigue.
    if (esPaciente && !puedeReservar) {
      setTurnos([]);
      setCargandoTurnos(false);
      return;
    }

    if (turnos.length === 0 && !cargandoTurnos) {
      cargarTurnos();
    }
    // cargandoTurnos y turnos.length no van en las dependencias: se consulta
    // al entrar a la pestaña y al volver de una reserva, no cada vez que
    // cambia el spinner o la lista.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, esPaciente, puedeReservar]);

  const confirmarTurno = async (turno) => {
    setAccionEnCurso(turno.id);
    setError('');
    try {
      await api(`/citas/${turno.id}/estado`, {
        method: 'PATCH',
        body: { estado: 'confirmada' },
      });
      await cargarTurnos();
    } catch (err) {
      setError(err.message || 'No se pudo confirmar el turno');
    } finally {
      setAccionEnCurso(null);
    }
  };

  const cancelarTurno = (turno) => {
    Alert.alert(
      'Cancelar turno',
      `¿Cancelar el turno del ${turno.fecha} a las ${turno.hora}?\n\nEl horario vuelve a quedar disponible para otra persona.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            setAccionEnCurso(turno.id);
            setError('');
            try {
              await api(`/citas/${turno.id}/cancelar`, { method: 'POST' });
              await cargarTurnos();
              setExito('Turno cancelado. El horario quedó disponible.');
            } catch (err) {
              setError(err.message || 'No se pudo cancelar el turno');
            } finally {
              setAccionEnCurso(null);
            }
          },
        },
      ]
    );
  };

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.titulo}>Turnos</Text>

      {/* Pestañas */}
      <View style={styles.turnoTabs}>
        <TouchableOpacity
          style={[styles.turnoTab, tab === 'reservar' && styles.turnoTabActivo]}
          onPress={() => { setTab('reservar'); setError(''); }}
          accessibilityRole="button"
          accessibilityState={{ selected: tab === 'reservar' }}
        >
          <Text style={[styles.turnoTabTexto, tab === 'reservar' && styles.turnoTabTextoActivo]}>
            Reservar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.turnoTab, tab === 'turnos' && styles.turnoTabActivo]}
          onPress={() => { setTab('turnos'); setError(''); }}
          accessibilityRole="button"
          accessibilityState={{ selected: tab === 'turnos' }}
        >
          <Text style={[styles.turnoTabTexto, tab === 'turnos' && styles.turnoTabTextoActivo]}>
            Mis turnos
          </Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {exito ? <Text style={styles.exito}>{exito}</Text> : null}

      {tab === 'reservar' ? (
        <>
          {/* Un médico o admin no reserva para sí desde la app. */}
          {ficha?.noPaciente ? (
            <View style={styles.tarjeta}>
              <Text style={styles.texto}>
                La reserva para terceros se gestiona desde la web. Esta pantalla es para
                que un paciente pida su propio turno.
              </Text>
            </View>
          ) : null}

          {/* Sin ficha vinculada: se ofrece vincular el DNI acá mismo. */}
          {!cargandoFicha && esPaciente && !puedeReservar ? (
            <View style={styles.tarjeta}>
              <Text style={styles.subtitulo}>Vinculá tu ficha</Text>
              <Text style={styles.texto}>
                Para reservar necesitamos asociar tu cuenta con tu ficha de paciente.
                Ingresá el DNI que usás en el consultorio.
              </Text>
              <TextInput
                style={[styles.input, { marginTop: 12 }]}
                placeholder="DNI"
                keyboardType="number-pad"
                value={documento}
                onChangeText={setDocumento}
                editable={!vinculando}
              />
              <TouchableOpacity
                style={styles.botonPrimario}
                onPress={vincularFicha}
                disabled={vinculando}
              >
                {vinculando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.botonPrimarioTexto}>Vincular ficha</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Paso 1: elegir profesional */}
          {!medico ? (
            <View style={styles.tarjeta}>
              <Text style={styles.subtitulo}>Elegí un profesional</Text>

              {cargandoMedicos ? (
                <ActivityIndicator color="#5a6fd0" />
              ) : medicos.length === 0 ? (
                <Text style={styles.texto}>No hay profesionales disponibles.</Text>
              ) : (
                medicos.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={styles.opcionMedico}
                    onPress={() => elegirMedico(m)}
                    accessibilityRole="button"
                  >
                    <Text style={styles.opcionTitulo}>{m.nombre}</Text>
                    <Text style={styles.opcionMeta}>
                      {m.especialidad || 'Sin especialidad'}
                      {m.matricula ? ` · Matrícula ${m.matricula}` : ''}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          ) : (
            <View style={styles.tarjeta}>
              <View style={styles.fila}>
                <Text style={styles.subtitulo}>Dr(a). {medico.nombre}</Text>
                <TouchableOpacity onPress={reiniciarReserva} accessibilityRole="button">
                  <Text style={styles.textoAccion}>Cambiar</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.opcionMeta}>{medico.especialidad || ''}</Text>

              {/* Paso 2: elegir día */}
              {cargandoDias ? (
                <ActivityIndicator color="#5a6fd0" style={{ marginTop: 12 }} />
              ) : dias.length === 0 ? (
                <Text style={[styles.texto, { marginTop: 12 }]}>
                  Este profesional no tiene días de atención cargados.
                </Text>
              ) : (
                <>
                  <Text style={[styles.label, { marginTop: 16 }]}>Día</Text>
                  <View style={styles.chipsFila}>
                    {dias.map((d) => (
                      <TouchableOpacity
                        key={d.fecha}
                        style={[styles.chip, fecha === d.fecha && styles.chipActivo]}
                        onPress={() => { setFecha(d.fecha); setHora(''); }}
                        accessibilityRole="button"
                        accessibilityState={{ selected: fecha === d.fecha }}
                      >
                        <Text style={[styles.chipTexto, fecha === d.fecha && styles.chipTextoActivo]}>
                          {d.nombre} {d.diaDelMes}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Paso 3: elegir horario */}
                  <Text style={styles.label}>Horario</Text>
                  {cargandoSlots || !slots ? (
                    <ActivityIndicator color="#5a6fd0" />
                  ) : slots.length === 0 ? (
                    <Text style={styles.texto}>No hay horarios cargados para ese día.</Text>
                  ) : (
                    <View style={styles.slotsCuadricula}>
                      {slots.map((slot) => {
                        const activo = hora === slot.hora;
                        return (
                          <TouchableOpacity
                            key={slot.hora}
                            style={[
                              styles.slotBoton,
                              activo && styles.slotBotonActivo,
                              !slot.disponible && styles.slotOcupado,
                            ]}
                            onPress={() => slot.disponible && setHora(slot.hora)}
                            disabled={!slot.disponible}
                            accessibilityRole="button"
                            accessibilityLabel={
                              slot.disponible
                                ? `${slot.hora}, libre`
                                : `${slot.hora}, ${slot.motivo_bloqueo || 'no disponible'}`
                            }
                          >
                            <Text
                              style={[
                                styles.slotTexto,
                                activo && styles.slotTextoActivo,
                                !slot.disponible && styles.slotOcupadoTexto,
                              ]}
                            >
                              {slot.hora}
                            </Text>
                            {!slot.disponible ? (
                              <Text style={styles.slotOcupadoTexto}>No disponible</Text>
                            ) : null}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </>
              )}

              {/* Paso 4: confirmar */}
              {hora ? (
                <>
                  <View style={styles.resumen}>
                    <Text style={styles.opcionTitulo}>
                      {formatearFechaLarga(fecha)} · {hora} hs
                    </Text>
                    <Text style={styles.opcionMeta}>Dr(a). {medico.nombre}</Text>
                  </View>

                  <Text style={styles.label}>Motivo de la consulta (opcional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: control, dolor de cabeza..."
                    value={motivo}
                    onChangeText={setMotivo}
                    maxLength={255}
                    editable={!reservando}
                    multiline
                  />

                  <TouchableOpacity
                    style={[styles.botonPrimario, !puedeReservar && styles.botonPrimarioOscurecido]}
                    onPress={reservar}
                    disabled={reservando || !puedeReservar}
                  >
                    {reservando ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.botonPrimarioTexto}>Confirmar turno</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : null}
            </View>
          )}
        </>
      ) : (
        /* ---------------- Mis turnos ---------------- */
        <View style={styles.tarjeta}>
          <View style={styles.fila}>
            <Text style={styles.subtitulo}>Mis turnos</Text>
            <TouchableOpacity onPress={cargarTurnos} accessibilityRole="button">
              <Text style={styles.textoAccion}>Actualizar</Text>
            </TouchableOpacity>
          </View>

          {esPaciente && !puedeReservar ? (
            <Text style={styles.texto}>
              Vinculá tu ficha en la pestaña Reservar para poder ver tus turnos.
            </Text>
          ) : cargandoTurnos ? (
            <ActivityIndicator color="#5a6fd0" />
          ) : turnos.length === 0 ? (
            <Text style={styles.texto}>Todavía no tenés turnos reservados.</Text>
          ) : (
            turnos.map((turno) => (
              <View key={turno.id} style={styles.turnoItem}>
                <Text style={styles.turnoFecha}>
                  {turno.fecha} · {turno.hora} hs
                </Text>
                <Text style={styles.opcionMeta}>
                  Dr(a). {turno.medico_nombre || 'Profesional'}
                  {turno.especialidad ? ` — ${turno.especialidad}` : ''}
                </Text>
                {turno.motivo ? (
                  <Text style={styles.opcionMeta}>{turno.motivo}</Text>
                ) : null}
                <Text style={styles.turnoEstado}>{turno.estado}</Text>

                {turno.estado === 'pendiente' ? (
                  <View style={styles.filaBotones}>
                    <TouchableOpacity
                      style={[styles.botonPrimario, styles.botonMitad]}
                      onPress={() => confirmarTurno(turno)}
                      disabled={accionEnCurso === turno.id}
                    >
                      <Text style={styles.botonPrimarioTexto}>
                        {accionEnCurso === turno.id ? 'Guardando...' : 'Confirmar'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.botonPeligro, styles.botonMitad]}
                      onPress={() => cancelarTurno(turno)}
                      disabled={accionEnCurso === turno.id}
                    >
                      <Text style={styles.botonPeligroTexto}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {turno.estado === 'confirmada' ? (
                  <View style={styles.filaBotones}>
                    <TouchableOpacity
                      style={[styles.botonPeligro, styles.botonMitad]}
                      onPress={() => cancelarTurno(turno)}
                      disabled={accionEnCurso === turno.id}
                    >
                      <Text style={styles.botonPeligroTexto}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}
