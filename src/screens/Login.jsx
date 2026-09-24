// ============================================================
// Login.jsx - Pantalla de inicio de sesión (optimizada para mobile)
// ============================================================
// Aplica la guía "Adaptar el sistema a mobile" en los puntos:
//  - "Ajustar formularios": teclados apropiados por tipo de campo
//    (keyboardType), validación en tiempo real (onBlur) con mensajes
//    específicos y accionables, y autocompletado del navegador/SO.
//  - "Validar Login": campo de contraseña con botón mostrar/ocultar
//    (evita errores de tipeo en teclados táctiles) y firma completa
//    en una sola pantalla sin scroll.
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
// Estilos compartidos de la app.
import { styles } from '../styles';
// Contexto de autenticación (provee la función login).
import { useAuth } from '../context/AuthContext';

// Expresión regular básica para validar un email (formato usuario@dominio).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Pantalla de login: valida credenciales contra POST /api/auth/login.
export default function Login() {
  // Función login del contexto de autenticación.
  const { login } = useAuth();
  // Email ingresado por el usuario.
  const [email, setEmail] = useState('');
  // Contraseña ingresada por el usuario.
  const [password, setPassword] = useState('');
  // True mientras se muestran los caracteres (toggle mostrar/ocultar).
  const [verPassword, setVerPassword] = useState(false);
  // Estado de carga: bloquea el botón mientras se valida el login.
  const [cargando, setCargando] = useState(false);
  // Mensaje de error a mostrar (cadena vacía = sin error).
  const [error, setError] = useState('');
  // Errores por campo: {email, password} con mensajes específicos (onBlur).
  const [erroresCampo, setErroresCampo] = useState({});

  // Valida el email y devuelve un mensaje específico (o '' si es válido).
  const validarEmail = (valor) => {
    if (!valor) return 'El email es obligatorio';                    // Campo vacío
    if (!EMAIL_REGEX.test(valor)) return 'Ingresá un email válido';  // Formato incorrecto
    return ''; // Sin errores
  };

  // Valida la contraseña y devuelve un mensaje específico (o '' si es válida).
  const validarPassword = (valor) => {
    // Solo se exige que no esté vacía: la longitud la valida el backend.
    if (!valor) return 'La contraseña es obligatoria';
    return ''; // Sin errores
  };

  // Validación en tiempo real: al perder el foco (onBlur) se valida ESE
  // campo con mensaje accionable, sin esperar al envío (guía de formularios).
  const validarCampoAlSalir = (campo, valor) => {
    const mensaje = campo === 'email' ? validarEmail(valor) : validarPassword(valor);
    // Se actualiza solo el error de ese campo y se limpia el error general.
    setErroresCampo((prev) => ({ ...prev, [campo]: mensaje }));
  };

  // Valida todos los campos en el envío y devuelve el primer mensaje (o '').
  const validarFormulario = () => {
    const nuevoError = {
      email: validarEmail(email),
      password: validarPassword(password),
    };
    setErroresCampo(nuevoError);
    // Devuelve el primer mensaje de error que exista ('' si todos son válidos).
    return nuevoError.email || nuevoError.password;
  };

  // Envía el formulario de login.
  const handleLogin = async () => {
    // 1) Validación en el cliente: si hay errores no se llama a la API.
    const primerError = validarFormulario();
    if (primerError) {
      setError(primerError);
      return; // Sale sin llamar el backend
    }
    // 2) Se activa el estado de carga (bloquea el botón y los campos).
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

      {/* Tarjeta blanca con el formulario (una sola pantalla, sin scroll) */}
      <View style={styles.tarjeta}>
        {/* Error general del login (si lo hay) */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Campo de email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="tu@email.com"
          value={email}
          onChangeText={setEmail}                 // Cada tecla actualiza el estado
          onBlur={() => validarCampoAlSalir('email', email)} // Validación en tiempo real
          keyboardType="email-address"            // Teclado con "@" y "."
          autoCapitalize="none"                   // Email en minúscula
          autoCorrect={false}                     // Sin autocorrección del teclado
          autoComplete="email"                    // Autocompletado del SO (guía)
          textContentType="emailAddress"          // iOS sugiere el mail guardado
          editable={!cargando}                    // Deshabilitado mientras carga
        />
        {/* Error específico del campo email (mensaje accionable) */}
        {erroresCampo.email ? <Text style={styles.errorCampo}>{erroresCampo.email}</Text> : null}

        {/* Campo de contraseña con botón mostrar/ocultar */}
        <Text style={styles.label}>Contraseña</Text>
        {/* Contenedor en fila: input + botón ocular */}
        <View style={styles.contrasenaWrapper}>
          <TextInput
            style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0 }]}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            onBlur={() => validarCampoAlSalir('password', password)} // Validación onBlur
            secureTextEntry={!verPassword}        // Puntos mientras "verPassword" sea false
            autoComplete="password"               // Autocompletado del SO (guía)
            textContentType="password"            // iOS sugiere contraseñas guardadas
            editable={!cargando}
          />
          {/* Botón táctil (>= 44px) que alterna mostrar/ocultar la contraseña */}
          <TouchableOpacity
            onPress={() => setVerPassword(!verPassword)}
            style={styles.botonMostrar}
            accessibilityRole="button"
            accessibilityLabel={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <Text style={styles.botonMostrarTexto}>{verPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
        {/* Error específico del campo contraseña */}
        {erroresCampo.password ? <Text style={styles.errorCampo}>{erroresCampo.password}</Text> : null}

        {/* Botón de envío: muestra ActivityIndicator mientras procesa */}
        <TouchableOpacity style={styles.botonPrimario} onPress={handleLogin} disabled={cargando}>
          {cargando ? (
            <ActivityIndicator color="#fff" /> // Ruleta giratoria mientras valida
          ) : (
            <Text style={styles.botonPrimarioTexto}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}