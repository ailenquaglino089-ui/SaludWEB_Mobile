// ============================================================
// AuthContext.jsx - Sesión (login/logout) con persistencia local
// ============================================================
// Equivalente móvil del AuthContext del Web: guarda el token JWT,
// lo restaura al abrir la app y permite iniciar/cerrar sesión.
// Además maneja el "desbloqueo biométrico": si el usuario activa
// "Proteger con huella", al reabrir la app la sesión se restaura
// pero queda BLOQUEADA hasta validar la huella/Face ID del teléfono.
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// El cliente HTTP de la app (se le inyecta el token y el callback de 401).
import { api, setToken, setUnauthorizedCallback } from '../api/client';
// Utilidad para saber si el dispositivo tiene lector biométrico disponible.
import { soporteBiometria } from '../utils/biometria';

// Clave con la que se guarda el token en el almacenamiento local del teléfono.
const TOKEN_KEY = 'saludweb_token';
// Clave de la preferencia "Proteger con huella" (valores guardados 'si' / 'no').
const BIO_KEY = 'saludweb_biometria';

// Contexto de autenticación (se importa en las pantallas con useContext).
export const AuthContext = createContext(null);

// Proveedor que envuelve toda la app y entrega { usuario, autenticado, cargando, login, logout }.
export function AuthProvider({ children }) {
  // Token JWT vigente (null mientras no haya sesión).
  const [token, setTokenState] = useState(null);
  // Datos del usuario logueado (id, email, nombre, tipo_usuario) o null.
  const [usuario, setUsuario] = useState(null);
  // True mientras se restaura la sesión guardada (evita pantallas parpadeando).
  const [cargando, setCargando] = useState(true);
  // ¿El usuario pidió "Proteger con huella"? (preferencia persistida).
  const [bioPreferido, setBioPreferido] = useState(false);
  // ¿La sesión actual ya fue desbloqueada? false => se muestra el candado
  // (Bloqueo.jsx) hasta validar la biometría o volver a entrar con email+clave.
  const [desbloqueado, setDesbloqueado] = useState(true);

  // Al montar la app: se lee la preferencia de huella, se restaura la sesión
  // guardada y se conecta el callback de 401 (corte automático de sesión).
  useEffect(() => {
    (async () => {
      // Por defecto NO se bloquea: solo si el usuario lo activó explícitamente.
      const preferido = (await AsyncStorage.getItem(BIO_KEY)) === 'si';
      setBioPreferido(preferido);
      // Se intenta restaurar el token guardado en el teléfono.
      await restablecerSesion(preferido);
      // Se conecta el callback: ante un 401 de la API la sesión se corta sola.
      setUnauthorizedCallback(cerrarSesionLocal);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restaura el token desde AsyncStorage y valida que siga siendo válido.
  // Si el usuario pidió huella, la sesión queda bloqueada (desbloqueado false).
  const restablecerSesion = async (preferBio) => {
    try {
      // Lee el token previamente guardado (null si no existe).
      const guardado = await AsyncStorage.getItem(TOKEN_KEY);
      // Sin token guardado: no hay sesión, se termina el estado de carga.
      if (!guardado) {
        setDesbloqueado(true);
        setCargando(false);
        return;
      }
      // Se inyecta el token restaurado al cliente HTTP.
      setToken(guardado);
      // GET /api/auth/me: consulta al backend si el token es válido y devuelve el usuario.
      const datosUsuario = await api('/auth/me');
      // Token válido: se activa la sesión con los datos del usuario.
      setTokenState(guardado);
      setUsuario(datosUsuario);
      // ¿Cuándo bloquear? Solo si el usuario lo pidió Y el dispositivo cuenta
      // con lector biométrico (evita dejar afuera un celular sin huella/Face ID).
      const bio = preferBio ? await soporteBiometria() : { disponible: false };
      setDesbloqueado(!(preferBio && bio.disponible));
    } catch {
      // Token inválido/expirado: se borra y la app queda sin sesión.
      await AsyncStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUsuario(null);
      setDesbloqueado(true);
    } finally {
      // En todos los casos termina el estado de carga inicial.
      setCargando(false);
    }
  };

  // Borra la sesión local (token en memoria y en almacenamiento) sin llamar la API.
  const cerrarSesionLocal = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setTokenState(null);
    setUsuario(null);
    // Al cortarse la sesión también se libera el candado (evita estados colgados).
    setDesbloqueado(true);
  };

  // Inicia sesión con email y contraseña.
  const login = async (email, password) => {
    // POST /api/auth/login con las credenciales; el backend responde con token y usuario.
    const datos = await api('/auth/login', { method: 'POST', body: { email, password } });
    // Se guarda el token en memoria (cliente HTTP) y en el teléfono (persistencia).
    setToken(datos.token);
    await AsyncStorage.setItem(TOKEN_KEY, datos.token);
    // Se activa el estado de sesión con los datos del usuario.
    setTokenState(datos.token);
    setUsuario({ email: datos.email, nombre: datos.nombre, tipo_usuario: datos.tipo_usuario, id: datos.id });
    // Entrar tecleando email+clave SIEMPRE desbloquea la sesión actual.
    setDesbloqueado(true);
  };

  // Activa/desactiva la preferencia "Proteger con huella" (persistida).
  const toggleBioPreferido = async (nuevo) => {
    // Se persiste la preferencia en el teléfono para la próxima apertura.
    await AsyncStorage.setItem(BIO_KEY, nuevo ? 'si' : 'no');
    setBioPreferido(nuevo);
    // Si se desactiva, la sesión actual queda desbloqueada de inmediato.
    if (!nuevo) setDesbloqueado(true);
  };

  // Marca la sesión como desbloqueada (tras validar huella/Face ID).
  const desbloquear = () => setDesbloqueado(true);

  // Cierra sesión: avisa al backend (invalida el token) y limpia el estado local.
  const logout = async () => {
    try {
      // POST /api/auth/logout (best effort: si falla, igual se cierra localmente).
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // Se ignora el error: la sesión se cierra igualmente del lado del cliente.
    }
    await cerrarSesionLocal();
  };

  // Valor entregado a toda la app mediante el contexto.
  const valor = {
    usuario,
    autenticado: !!token,
    cargando,
    // Estado de la preferencia de huella y del candado de sesión.
    bioPreferido,
    desbloqueado,
    login,
    logout,
    desbloquear, //     Marca la sesión como desbloqueada (tras validar biometría).
    toggleBioPreferido, // Cambia la preferencia "Proteger con huella".
  };
  // <AuthContext.Provider> hace disponible el valor a todos los descendientes.
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// Hook de conveniencia: lee el contexto de autenticación en cualquier pantalla.
export const useAuth = () => useContext(AuthContext);