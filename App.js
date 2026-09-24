// ============================================================
// App.js - Punto de entrada de la app móvil (Expo)
// ============================================================
// Monta el proveedor de autenticación y una navegación simple por
// estado (pantalla actual + barra de navegación inferior fija),
// evitando librerías externas de navegación.
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
// Proveedor de sesión: envuelve toda la app para compartir login/logout/usuario.
import { AuthProvider, useAuth } from './src/context/AuthContext';
// Barra de navegación inferior sticky (patrón Bottom Navigation de la guía).
import BottomNav from './src/components/BottomNav';
// Pantallas de la aplicación.
import Login from './src/screens/Login';
import Dashboard from './src/screens/Dashboard';
import Pacientes from './src/screens/Pacientes';
import Medicos from './src/screens/Medicos';
import Prescripciones from './src/screens/Prescripciones';

// Componente raíz: decide qué pantalla mostrar según sesión y navegación.
function ContenidoApp() {
  // Estado de la navegación: pantalla activa (dashboard por defecto).
  const [pantalla, setPantalla] = useState('dashboard');
  // Estado de sesión (autenticado, cargando, logout) desde el contexto.
  const { autenticado, cargando, logout } = useAuth();

  // Mientras se restaura la sesión guardada se muestra una pantalla vacía
  // (evita "flashes" de login para usuarios que ya tenían sesión).
  if (cargando) return <View style={{ flex: 1 }} />;

  // Sin sesión: siempre se muestra el Login (la navegación queda oculta).
  if (!autenticado) return <Login />;

  // Con sesión: devuelve la pantalla activa elegida en la barra inferior.
  const pantallaActiva = () => {
    switch (pantalla) {
      case 'pacientes':
        return <Pacientes />;         // Listado de pacientes
      case 'medicos':
        return <Medicos />;           // Listado de médicos
      case 'prescripciones':
        return <Prescripciones />;    // Listado de prescripciones
      default:
        return <Dashboard />;         // Pantalla de inicio
    }
  };

  // Cierra la sesión (Backend + local) y vuelve al punto inicial.
  const cerrarSesion = () => { logout(); setPantalla('dashboard'); };

  // Columna que ocupa toda la altura: contenido arriba + barra fija abajo.
  return (
    <View style={{ flex: 1 }}>
      {/* Pantalla activa: ocupa todo el espacio disponible sobre la barra */}
      <View style={{ flex: 1 }}>{pantallaActiva()}</View>
      {/* Bottom Navigation Bar: sticky, siempre visible con las acciones
          principales en la zona natural del pulgar (guía de adaptación) */}
      <BottomNav pantalla={pantalla} navegar={setPantalla} cerrarSesion={cerrarSesion} />
    </View>
  );
}

// Componente exportado: provee sesión y renderiza el contenido + barra de estado.
export default function App() {
  return (
    // AuthProvider entrega login/logout/usuario a toda la app.
    <AuthProvider>
      {/* Barra de estado del sistema (reloj, batería) con estilo oscuro claro */}
      <StatusBar style="dark" />
      <ContenidoApp />
    </AuthProvider>
  );
}