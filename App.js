// ============================================================
// App.js - Punto de entrada de la app móvil (Expo)
// ============================================================
// Monta el proveedor de autenticación y una navegación simple por
// estado (pantalla actual + datos), evitando librerías externas.
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
// Proveedor de sesión: envuelve toda la app para compartir login/logout/usuario.
import { AuthProvider, useAuth } from './src/context/AuthContext';
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

  // Sin sesión: siempre se muestra el Login (navegación queda oculta).
  if (!autenticado) return <Login />;

  // Con sesión: se muestra la pantalla activa elegida en el menú.
  switch (pantalla) {
    case 'medicos':
      // Listado de médicos con botón para volver al dashboard.
      return <Medicos volver={() => setPantalla('dashboard')} />;
    case 'pacientes':
      // Listado de pacientes con botón para volver.
      return <Pacientes volver={() => setPantalla('dashboard')} />;
    case 'prescripciones':
      // Listado de prescripciones con botón para volver.
      return <Prescripciones volver={() => setPantalla('dashboard')} />;
    default:
      // Dashboard: núcleo de navegación (cambia la pantalla y cierra sesión).
      return (
        <Dashboard
          navegar={(destino) => setPantalla(destino)}   // Cambia de pantalla
          cerrarSesion={() => { logout(); setPantalla('dashboard'); }} // Logout + reset
        />
      );
  }
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