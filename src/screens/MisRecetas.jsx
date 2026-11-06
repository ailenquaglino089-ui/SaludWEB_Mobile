import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { styles } from '../styles';

const etiquetaEstado = (estado) => {
  if (estado === 'activa') return '✓ Activa';
  if (estado === 'vencida') return '⚠ Vencida';
  if (estado === 'dispensada') return '✓ Dispensada';
  if (estado === 'cancelada') return '✗ Cancelada';
  return estado;
};

const colorEstado = (estado) => {
  if (estado === 'activa') return '#12883e';
  if (estado === 'vencida') return '#ad6500';
  if (estado === 'dispensada') return '#197ac7';
  if (estado === 'cancelada') return '#b3261e';
  return '#495057';
};

export default function MisRecetas() {
  const { usuario } = useAuth();
  const [idPaciente, setIdPaciente] = useState(usuario?.id_paciente ?? null);
  const [prescripciones, setPrescripciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        setCargando(true);
        const pacienteId = idPaciente ?? (await api('/auth/me'))?.id_paciente ?? null;

        if (!activo) return;

        if (!pacienteId) {
          setIdPaciente(null);
          setPrescripciones([]);
          setError('Tu cuenta todavía no está vinculada a una ficha de paciente.');
          return;
        }

        setIdPaciente(pacienteId);
        const datos = await api(`/prescripciones/paciente/${pacienteId}`);

        if (activo) {
          setPrescripciones(Array.isArray(datos) ? datos : []);
          setError('');
        }
      } catch (err) {
        if (activo) setError(err.message || 'No se pudieron cargar tus recetas');
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [idPaciente]);

  if (cargando) {
    return (
      <View style={styles.contenedor}>
        <ActivityIndicator size="large" />
        <Text style={styles.texto}>Cargando recetas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>💊 Mis recetas</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={prescripciones}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          error ? null : <Text style={styles.texto}>No tenés recetas registradas.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.tarjeta}>
            <Text style={styles.texto}>
              {(item.medicamentos || [])
                .map((m) => `${m.nombre}${m.dosis ? ` (${m.dosis})` : ''}`)
                .join(', ')}
            </Text>
            <Text style={styles.texto}>Médico: {item.nombre_medico || '—'}</Text>
            <Text style={styles.texto}>Fecha de Emisión: {item.fecha_emision || '—'}</Text>
            <Text style={[styles.texto, { color: colorEstado(item.estado), fontWeight: '700' }]}>
              {etiquetaEstado(item.estado)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
