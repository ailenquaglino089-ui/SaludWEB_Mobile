// ============================================================
// App.js - Punto de entrada de la app móvil (Expo)
// ============================================================
// Monta el proveedor de autenticación y una navegación simple por
// estado (pantalla actual + barra de navegación inferior fija),
// evitando librerías externas de navegación.
//
// La decisión de NO usar react-navigation es deliberada y conviene
// entenderla antes de tocar este archivo:
//
//   - La app tiene 4 secciones y una barra inferior fija. Con
//     react-navigation habría que declarar un navigator por tab, un
//     stack anidado y configuración de transiciones, para navegación que en
//     total son 4 pantallas y un useState.
//   - Sin librería, el flujo de la sesión es legible de punta a punta en
//     este archivo: se entra, se ve si hay sesión, se desbloquea o no, y
//     se elige la pantalla. Con un navigator, ese mismo flujo quedaría
//     repartido entre el navigator, los headers y las pantallas.
//
// El costo es que no hay historial de navegación: el botón "atrás" del
// sistema operativo no funciona dentro de la app, porque no hay stack que
// la app pueda popear. Con 4 secciones planas no se nota. Si alguna vez se
// agrega un flujo de varios pasos (por ejemplo, agendar un turno yendo por
// paciente > médico > horario > confirmar), SÍ va a hacer falta
// react-navigation, y en ese momento conviene migrar en vez de seguir
// encadenando estados.
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
// SafeAreaView, no View: en iPhone con notch, un View a pantalla completa
// mete el contenido debajo de la muesca y el status bar. Las pantallas
// necesitan SafeAreaView para que el título no quede cortado arriba.
import { View, SafeAreaView } from 'react-native';
// Proveedor de sesión: envuelve toda la app para compartir login/logout/usuario.
import { AuthProvider, useAuth } from './src/context/AuthContext';
// Barra de navegación inferior sticky (patrón Bottom Navigation de la guía).
import BottomNav from './src/components/BottomNav';
// Pantallas de la aplicación.
import Login from './src/screens/Login';
import Bloqueo from './src/screens/Bloqueo';
import Dashboard from './src/screens/Dashboard';
import Pacientes from './src/screens/Pacientes';
import Medicos from './src/screens/Medicos';
import Prescripciones from './src/screens/Prescripciones';

// Componente raíz: decide qué pantalla mostrar según sesión y navegación.
function ContenidoApp() {
  // Estado de la navegación: pantalla activa (dashboard por defecto).
  const [pantalla, setPantalla] = useState('dashboard');
  // Estado de sesión (autenticado, cargando, desbloqueado, logout) desde el contexto.
  const { autenticado, cargando, desbloqueado, logout } = useAuth();

   // Estos tres return temprano son deliberados y estan en este orden exacto.
  //
  // While cargando: mientras se restaura la sesión guardada se muestra una
  // pantalla vacía, sin spinner. La razón es que un spinner parpadea en
   // cada arranque y a quien ya tiene sesion le parece un error de carga
  // que no existe; el vacío dura lo que dura la lectura del token.
  //
  // El ORDEN importa: primero cargando, después autenticado, después
  // desbloqueado. Invertir el primero y el segundo produce el fallo clásico
  // de "la app pide la contraseña a quien ya entró": durante el primer
  // render cargando es true y autenticado todavía false, así que si se
  // evaluara !autenticado antes, se pintaría el Login un instante.
  if (cargando) return <View style={{ flex: 1 }} />;

  // Sin sesión: siempre se muestra el Login (la navegación queda oculta).
  if (!autenticado) return <Login />;

  // Sesión restaurada pero bloqueada por "Proteger con huella": solo el
  // candado es visible; se prohibe la navegación hasta validar biometría.
  //
  // Esto es una decisión de seguridad, no de navegación. La sesión puede
  // estar vigente en el servidor y aun así no dejar pasar: el token existe
  // pero la app no lo considera autenticado hasta que la biometría dice
  // que es el mismo dueño. Por eso el chequeo va acá y no adentro de
  // AuthContext: acá es donde se decide qué se puede VER.
  if (!desbloqueado) return <Bloqueo />;

  // Con sesión: devuelve la pantalla activa elegida en la barra inferior.
  const pantallaActiva = () => {
    // Un switch y no un objeto de componentes: con un mapa de componentes
    // se importarían todos aunque solo se use uno, y el "default" dejaría
    // de ser un error visible para pasarse a otra sección.
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
  //
  // El reset de 'dashboard' es parte del cierre y no un detalle: si se
  // cierra sesión estando en Prescripciones, al volver a entrar la app
  // abriría en la pantalla anterior, y con otro usuario esa pantalla puede
  // no tener sentido (o pedir datos que el usuario nuevo no puede ver).
  const cerrarSesion = () => { logout(); setPantalla('dashboard'); };

  // Columna que ocupa toda la altura: contenido arriba + barra fija abajo.
  //
  // SafeAreaView envuelve TODO el contenido y no solo la barra, porque el
  // problema del notch es arriba: sin él, el título de la pantalla queda
  // debajo de la muesca en los iPhone con notch, que es la mayoría de los
  // equipos que se usan.
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Pantalla activa: ocupa todo el espacio disponible sobre la barra */}
      <View style={{ flex: 1 }}>{pantallaActiva()}</View>
      {/* Bottom Navigation Bar: fija, siempre visible con las acciones
          principales en la zona natural del pulgar (guía de adaptación) */}
      <BottomNav pantalla={pantalla} navegar={setPantalla} cerrarSesion={cerrarSesion} />
    </SafeAreaView>
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
