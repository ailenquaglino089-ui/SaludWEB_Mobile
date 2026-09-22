// ============================================================
// Login.jsx - Pantalla de inicio de sesión
// ============================================================
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
// Estilos compartidos de la app.
import { styles } from '../styles';
// Contexto de autenticación (provee la función login).
import { useAuth } from '../context/AuthContext';

// Pantalla de login: valida credenciales contra POST /api/auth/login.
export default function Login() {
  // Función login del contexto de autenticación.
  const { login } = useAuth();
  // Email ingresado por el usuario.
  const [email, setEmail] = useState('');
  // Contraseña ingresada por el usuario.
  const [password, setPassword] = useState('');
  // Estado de carga: bloquea el botón mientras se valida el login.
  const [cargando, setCargando] = useState(false);
  // Mensaje de error a mostrar (cadena vacía = sin error).
  const [error, setError] = useState('');

  // Envía el formulario de login.
  const handleLogin = async () => {
    // Validación rápida: ambos campos son obligatorios.
    if (!email || !password) {
      setError('Ingresá email y contraseña');
      return; // Sale sin llamar la API
    }
    // Se activa el estado de carga (bloquea el botón).
    setCargando(true);
    setError('');
    try {
      // Se delega el login al contexto; si el backend responde 4xx, se lanza un Error.
      await login(email, password);
      // En éxito no se navega acá: la app detecta 'autenticado' y muestra el Dashboard solo.
    } catch (err) {
      // Se muestra el mensaje del backend (ej: "Credenciales incorrectas").
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      // Se termina el estado de carga siempre (éxito o error).
      setCargando(false);
    }
  };

  // KeyboardAvoidingView evita que el teclado tape el formulario en iOS/Android.
  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Cabecera de bienvenida con la marca de la app */}
      <View style={styles.tituloWrapper}>
        <Text style={{ fontSize: 28, fontWeight: '700', textAlign: 'center', color: '#667eea' }}>
          🏥 SaludWEB
        </Text>
        <Text style={[styles.texto, { textAlign: 'center' }]}>Sistema de Gestión de Salud</Text>
      </View>

      {/* Tarjeta blanca con el formulario */}
      <View style={styles.tarjeta}>
        {/* Error del login (si lo hay) */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Campo de email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="tu@email.com"
          value={email}
          onChangeText={setEmail}          // Cada tecla actualiza el estado
          keyboardType="email-address"     // Teclado con "@" y "."
          autoCapitalize="none"            // Email en minúscula
          editable={!cargando}             // Deshabilitado mientras carga
        />

        {/* Campo de contraseña */}
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}           // Los caracteres se ven como puntos
          editable={!cargando}
        />

        {/* Botón de envío: muestra ActivityIndicator mientras procesa */}
        <TouchableOpacity style={styles.botonPrimario} onPress={handleLogin} disabled={cargando}>
          {cargando ? (
            <ActivityIndicator color="#fff" /> // Ruleta giratoria en rosa/azul del Web
          ) : (
            <Text style={styles.botonPrimarioTexto}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}