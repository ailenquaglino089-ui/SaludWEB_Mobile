// ============================================================
// PagedList.jsx - Listado paginado y con búsqueda (reutilizable)
// ============================================================
// Componente genérico que consume una ruta paginada del backend:
//   GET /api/{url}?pagina=N&por_pagina=M&q=busqueda
// Muestra una lista con búsqueda (debounce) y controles Anterior/Siguiente.
// Se configura por props para Pacientes, Médicos y Prescripciones.
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, ScrollView
} from 'react-native';
// Estilos compartidos de la app.
import { styles } from '../styles';
// Cliente HTTP de la app.
import { api } from '../api/client';
// Cantidad de registros por página (debe coincidir con el backend).
import { POR_PAGINA } from '../config';

// Props:
//  - url: ruta de la API (ej: '/pacientes')
//  - titulo: título de la pantalla
//  - placeholder: texto de ayuda de la búsqueda
//  - campos: [{clave, etiqueta}] define qué columnas se muestran por registro
//  - renderValor: (registro, campo) => texto; personaliza el valor mostrado
//  - filtros: [{valor, etiqueta}] para filtrar por un campo (ej: estado de prescripción)
export default function PagedList({ url, titulo, placeholder, campos, renderValor, filtros = [] }) {
  // Página actual (empieza en 1).
  const [pagina, setPagina] = useState(1);
  // Registros de la página actual.
  const [datos, setDatos] = useState([]);
  // Total de registros que devuelve el backend (para saber el total de páginas).
  const [total, setTotal] = useState(0);
  // Total de páginas calculado por el backend.
  const [totalPaginas, setTotalPaginas] = useState(1);
  // Texto de búsqueda tal como escribe el usuario.
  const [busqueda, setBusqueda] = useState('');
  // Búsqueda ya "debounceada": se envía al backend recién 400 ms después de la última tecla.
  const [busquedaAplicada, setBusquedaAplicada] = useState('');
  // Filtro activo (cadena vacía = todos; se usa para el estado en prescripciones).
  const [filtro, setFiltro] = useState('');
  // Estado de carga (muestra el indicador mientras llega la API).
  const [cargando, setCargando] = useState(true);
  // Mensaje de error global (cadena vacía = sin error).
  const [error, setError] = useState('');

  // Debounce de búsqueda: espera 400 ms desde la última tecla antes de aplicar el filtro.
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagina(1);                  // Con un filtro nuevo se vuelve a la página 1
      setBusquedaAplicada(busqueda); // Se aplica el texto al backend
    }, 400);
    return () => clearTimeout(timer); // Se cancela el timer si se escribe otra tecla
  }, [busqueda]);

  // Carga la página cuando cambia la página o los filtros.
  useEffect(() => {
    cargarPagina();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina, busquedaAplicada, filtro]);

  // Función que pide la página actual al backend.
  const cargarPagina = async () => {
    setCargando(true);
    setError('');
    try {
      // GET con parámetros de paginado, búsqueda y filtro opcional (estado).
      const data = await api(url, {
        params: { pagina, por_pagina: POR_PAGINA, q: busquedaAplicada, estado: filtro }
      });
      // La respuesta paginada es { items, total, total_paginas }.
      setDatos(data.items || []);
      setTotal(data.total || 0);
      setTotalPaginas(data.total_paginas || 1);
    } catch (err) {
      // Se muestra el mensaje del backend (los 401 ya expulsan la sesión).
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setCargando(false); // En todos los casos termina el indicador de carga
    }
  };

  // Cambia de página sin pasarse de los límites.
  const cambiarPagina = (nueva) => {
    // Se ignora si la página no existe (menor a 1 o mayor al total).
    if (nueva < 1 || nueva > totalPaginas) return;
    setPagina(nueva); // Dispara la recarga vía efecto
  };

  // Renderiza el valor de un campo, usando renderValor si la pantalla lo define.
  const mostrarValor = (registro, campo) => {
    if (renderValor) return renderValor(registro, campo);
    // Por defecto se muestra el valor crudo; si es null, un guion.
    return registro[campo.clave] ?? '—';
  };

  return (
    <View style={styles.contenedor}>
      {/* Título de la pantalla */}
      <Text style={styles.titulo}>{titulo}</Text>

      {/* Buscador: cada tecla actualiza 'busqueda' (el debounce aplica 400 ms después) */}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={busqueda}
        onChangeText={setBusqueda}
      />

      {/* Filtros opcionales tipo "chip" (ej: estados de prescripción) */}
      {filtros.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filtros.map((f) => (
            // Cada chip alterna el filtro activo
            <TouchableOpacity
              key={f.valor}
              onPress={() => setFiltro(f.valor === filtro ? '' : f.valor)}
              style={{
                backgroundColor: filtro === f.valor ? '#667eea' : '#e0e0e0',
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 8,
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              {/* Texto del chip; blanco cuando está activo */}
              <Text style={{ color: filtro === f.valor ? '#fff' : '#333', fontWeight: '600' }}>
                {f.etiqueta}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Error global (si lo hay) */}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Mientras carga se muestra el indicador giratorio */}
      {cargando ? (
        <ActivityIndicator size="large" color="#667eea" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={datos}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={() => (
            // Mensaje amable cuando no hay resultados
            <View style={styles.tarjeta}>
              <Text style={styles.texto}>No hay resultados</Text>
            </View>
          )}
          renderItem={({ item }) => (
            // Tarjeta por registro: "Etiqueta: Valor" por cada campo configurado
            <View style={styles.tarjeta}>
              {campos.map((campo) => (
                <View key={campo.clave} style={styles.fila}>
                  {/* Etiqueta del campo a la izquierda */}
                  <Text style={styles.filaLabel}>{campo.etiqueta}:</Text>
                  {/* Valor del campo a la derecha (con renderValor personalizado) */}
                  <Text style={styles.filaValor}>{mostrarValor(item, campo)}</Text>
                </View>
              ))}
            </View>
          )}
        />
      )}

      {/* Barra de paginación (solo si hay más de una página) */}
      {!cargando && totalPaginas > 1 && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          {/* Botón Anterior */}
          <TouchableOpacity
            style={[styles.botonSecundario, { opacity: pagina <= 1 ? 0.4 : 1 }]}
            onPress={() => cambiarPagina(pagina - 1)}
            disabled={pagina <= 1}
          >
            <Text style={{ fontWeight: '600' }}>← Anterior</Text>
          </TouchableOpacity>

          {/* Indicador "Página X de Y" */}
          <Text style={styles.texto}>Página {pagina} de {totalPaginas}</Text>

          {/* Botón Siguiente */}
          <TouchableOpacity
            style={[styles.botonSecundario, { opacity: pagina >= totalPaginas ? 0.4 : 1 }]}
            onPress={() => cambiarPagina(pagina + 1)}
            disabled={pagina >= totalPaginas}
          >
            <Text style={{ fontWeight: '600' }}>Siguiente →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Pie: total de registros */}
      {!cargando && <Text style={[styles.texto, { textAlign: 'center', marginTop: 8 }]}>Total: {total}</Text>}
    </View>
  );
}