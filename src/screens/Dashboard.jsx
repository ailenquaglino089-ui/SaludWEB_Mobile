// ============================================================
// Dashboard.jsx - Panel inicial con datos del usuario
// ============================================================
// Aplicando el punto "Simplificación radical del menú principal"
// de la guía: la navegación a Módulos se movió a la barra inferior
// (BottomNav) y en el Dashboard solo queda el saludo, el rol y un
// atajo de seguridad: activar/desactivar "Proteger con huella".
import React, { useEffect, useState } from 'react';
import { View, Text, Switch } from 'react-native';
// Estilos compartidos de la app.
import { styles } from '../styles';
// Contexto de autenticación (usuario logueado + preferencia de huella).
import { useAuth } from '../context/AuthContext';
// Utilidades para saber si el sensor existe y pedir confirmación con él.
import { soporteBiometria, autenticarBiometria } from '../utils/biometria';

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

// Pantalla principal: saluda al usuario y resume su contexto.
// No recibe props: la navegación la resuelve BottomNav en App.js.
export default function Dashboard() {
  // Datos del usuario logueado (nombre y rol) + preferencia de huella.
  const { usuario, bioPreferido, toggleBioPreferido } = useAuth();
  // ¿El teléfono tiene huella/Face ID? (se consulta una vez al montar).
  const [soporte, setSoporte] = useState({ disponible: false, etiqueta: 'biometría' });

  // Al montar: se consulta si el dispositivo tiene lector biométrico para
  // mostrar u ocultar el switch de "Proteger con huella".
  useEffect(() => {
    soporteBiometria().then(setSoporte);
  }, []);

  // Cambia la preferencia de huella con confirmación biométrica al activar.
  const cambiarPreferencia = async (nuevo) => {
    // Desactivar: se persiste de inmediato (sin pedir nada).
    if (!nuevo) {
      await toggleBioPreferido(false);
      return;
    }
    // Activar: el SO pide una validación previa para confirmar que es el
    // dueño del teléfono quien enciende la protección (patrón de Expo).
    const ok = await autenticarBiometria('Confirmá tu identidad para activar la huella');
    if (ok) await toggleBioPreferido(true);
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

      {/* Seguridad: switch de "Proteger con huella" (solo si hay sensor) */}
      <View style={styles.tarjeta}>
        {/* Fila con el título y el switch (target táctil nativo del SO) */}
        <View style={styles.fila}>
          <Text style={styles.filaLabel}>🔐 Proteger con {soporte.etiqueta}</Text>
          <Switch
            value={bioPreferido}
            onValueChange={cambiarPreferencia}
            // Colores del interruptor encendido/apagado (contraste visible)
            trackColor={{ false: '#d0d0d0', true: '#667eea' }}
            thumbColor="#ffffff"
          />
        </View>
        {/* Explicación del comportamiento: la próxima apertura pedirá la huella */}
        <Text style={styles.ayuda}>
          Al activarla, la próxima vez que abrís la app se pedirá tu {soporte.etiqueta} para entrar.
        </Text>
        {/* Si el teléfono no tiene sensor, se avisa que la opción no aplica */}
        {!soporte.disponible ? (
          <Text style={styles.error}>Este dispositivo no tiene {soporte.etiqueta} configurada.</Text>
        ) : null}
      </View>

      {/* Aviso de navegación: las opciones críticas están en la barra inferior */}
      <View style={styles.tarjeta}>
        <Text style={styles.texto}>
          📱 Usá la barra inferior para acceder a Pacientes, Médicos, Recetas y Salir.
        </Text>
      </View>
    </View>
  );
}