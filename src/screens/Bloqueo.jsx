// ============================================================
// Bloqueo.jsx - Candado biométrico de la sesión guardada
// ============================================================
// Se muestra cuando la app reabre con una sesión restaurada pero el
// usuario activó "Proteger con huella" (AuthContext.desbloqueado=false).
// Pide validar la identidad del dueño del teléfono con huella/Face ID
// antes de dejar entrar; si se cancela, se puede cambiar de cuenta.
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
// Estilos compartidos de la app.
import { styles } from '../styles';
// Contexto: usuario de la sesión + métodos desbloquear/logout.
import { useAuth } from '../context/AuthContext';
// Utilidades: abre el diálogo nativo de biometría y lee el tipo de sensor.
import { autenticarBiometria, soporteBiometria } from '../utils/biometria';

// Pantalla de candado: recibe todo del contexto (no usa props).
export default function Bloqueo() {
  // Usuario de la sesión ya restaurada (nombre para el saludo del candado).
  const { usuario, desbloquear, logout } = useAuth();
  // True mientras el diálogo de huella está abierto (evita dobles toques).
  const [validando, setValidando] = useState(false);
  // Mensaje de error si se cancela o la huella no matchea.
  const [error, setError] = useState('');
  // Etiqueta del sensor del teléfono: "huella dactilar" o "Face ID".
  const [etiqueta, setEtiqueta] = useState('biometría');

  // Al montar: se consulta qué sensor tiene el dispositivo para el mensaje.
  useEffect(() => {
    soporteBiometria().then((s) => setEtiqueta(s.etiqueta));
  }, []);

  // Abre el diálogo nativo de biometría; si valida, desbloquea la sesión.
  const intentarDesbloquear = async () => {
    // Evita abrir dos diálogos a la vez y limpia el error anterior.
    setValidando(true);
    setError('');
    // El SO compara la huella/rostro del dueño del teléfono con la sesión.
    const ok = await autenticarBiometria(`Desbloqueá SaludWEB, ${usuario?.nombre || ''}`.trim());
    // Éxito: la sesión queda desbloqueada y la app pasa al Dashboard.
    if (ok) {
      desbloquear();
      return;
    }
    // Fallo/cancelación: se informa y se permite reintentar.
    setError(`No se pudo validar tu ${etiqueta}. Volvé a intentar o usá tu email y contraseña.`);
    setValidando(false);
  };

  // Cambia de cuenta: cierra la sesión y vuelve al Login (pide credenciales).
  const usarOtraCuenta = async () => {
    await logout();
  };

  return (
    <View style={styles.contenedor}>
      {/* Tarjeta central: saludo + botón grande de desbloqueo */}
      <View style={styles.tarjeta}>
        {/* Título del candado */}
        <Text style={styles.titulo}>🔐 Sesión bloqueada</Text>
        {/* Explicación breve de por qué aparece la pantalla */}
        <Text style={styles.texto}>
          Hola <Text style={styles.filaLabel}>{usuario?.nombre || 'Usuario'}</Text>. Para entrar
          validá tu {etiqueta} en este teléfono.
        </Text>

        {/* Botón principal: abre el diálogo nativo de huella / Face ID */}
        <TouchableOpacity
          style={[styles.botonPrimario, validando && styles.botonPrimarioOscurecido]}
          onPress={intentarDesbloquear}
          disabled={validando}
          accessibilityLabel={`Desbloquear con ${etiqueta}`}
        >
          {/* Mientras valida se muestra un indicador de espera */}
          {validando ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.botonPrimarioTexto}>🔓 Desbloquear</Text>
          )}
        </TouchableOpacity>

        {/* Mensaje de error si la validación no fue exitosa */}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      {/* Alternativa para salir del candado: cerrar sesión y usar email+clave */}
      <TouchableOpacity style={styles.botonSecundario} onPress={usarOtraCuenta}>
        <Text style={styles.textoAccion}>Usar otra cuenta</Text>
      </TouchableOpacity>
    </View>
  );
}