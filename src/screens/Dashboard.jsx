// ============================================================
// Dashboard.jsx - Panel inicial con accesos y datos del usuario
// ============================================================
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
// Estilos compartidos de la app.
import { styles } from '../styles';
// Contexto de autenticación (usuario logueado y cierre de sesión).
import { useAuth } from '../context/AuthContext';

// Pantalla principal: saluda al usuario y ofrece accesos a los módulos.
// Recibe 'navegar(destino)' para moverse entre pantallas sin librerías de navegación.
export default function Dashboard({ navegar, cerrarSesion }) {
  // Datos del usuario logueado (nombre y rol).
  const { usuario } = useAuth();

  // Devuelve el emoji del rol para el saludo.
  const emojiRol = (rol) => {
    if (rol === 'medico') return '👨‍⚕️';  // Médico
    if (rol === 'admin') return '🛡️';      // Administrador
    return '👤';                            // Paciente (por defecto)
  };

  // Devuelve la etiqueta en español del rol.
  const textoRol = (rol) => {
    if (rol === 'medico') return 'Médico';
    if (rol === 'admin') return 'Administrador';
    return 'Paciente';
  };

  return (
    <View style={styles.contenedor}>
      {/* Saludo con el nombre y el rol del usuario */}
      <View style={styles.tarjeta}>
        <Text style={styles.titulo}>
          👋 Hola, {usuario?.nombre || 'Usuario'}
        </Text>
        <Text style={styles.texto}>
          {emojiRol(usuario?.tipo_usuario)} Rol: {textoRol(usuario?.tipo_usuario)}
        </Text>
      </View>

      {/* Módulos disponibles: cada botón navega a su listado */}
      <View style={styles.tarjeta}>
        <Text style={styles.titulo}>Módulos</Text>

        {/* Acceso a Pacientes */}
        <TouchableOpacity style={styles.botonPrimario} onPress={() => navegar('pacientes')}>
          <Text style={styles.botonPrimarioTexto}>👤 Pacientes</Text>
        </TouchableOpacity>

        {/* Acceso a Médicos */}
        <TouchableOpacity style={styles.botonPrimario} onPress={() => navegar('medicos')}>
          <Text style={styles.botonPrimarioTexto}>👨‍⚕️ Médicos</Text>
        </TouchableOpacity>

        {/* Acceso a Prescripciones */}
        <TouchableOpacity style={styles.botonPrimario} onPress={() => navegar('prescripciones')}>
          <Text style={styles.botonPrimarioTexto}>💊 Prescripciones</Text>
        </TouchableOpacity>
      </View>

      {/* Botón de cierre de sesión */}
      <TouchableOpacity style={styles.botonPeligro} onPress={cerrarSesion}>
        <Text style={[styles.botonPrimarioTexto, { textAlign: 'center' }]}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}