// ============================================================
// utils/biometria.js - Soporte y autenticación biométrica
// ============================================================
// Envuelve a expo-local-authentication para centralizar en un solo
// lugar: (1) si el dispositivo tiene lector biométrico (hardware) y
// huella/rostro inscriptos, y (2) la autenticación en sí (mostrar el
// diálogo del sistema y devolver true/false según el resultado).
import * as LocalAuthentication from 'expo-local-authentication';

// Devuelve si la biometría está disponible en este dispositivo.
// Salida: { disponible, etiqueta } donde "etiqueta" es el texto a
// mostrar ("huella dactilar" o "Face ID") según los sensores.
export const soporteBiometria = async () => {
  try {
    // ¿El hardware tiene algún lector (huella o rostro)?
    const hardware = await LocalAuthentication.hasHardwareAsync();
    // ¿El dueño del equipo tiene configurada al menos una huella/rostro?
    const inscrito = await LocalAuthentication.isEnrolledAsync();
    // Tipos de sensores disponibles: fingerprint, facial o iris.
    const tipos = await LocalAuthentication.supportedAuthenticationTypesAsync();
    // Autenticación facial (Face ID / rostro) o, por defecto, huella dactilar.
    const esFacial = tipos.includes(LocalAuthentication.AuthenticationType.FACIAL);
    // La biometría solo sirve si hay hardware Y una identidad registrada.
    return {
      disponible: hardware && inscrito,
      etiqueta: esFacial ? 'Face ID' : 'huella dactilar',
    };
  } catch {
    // Ante cualquier error interno se asume que NO hay biometría
    // (la app sigue funcionando con el login normal de email+clave).
    return { disponible: false, etiqueta: 'biometría' };
  }
};

// Pide al sistema que valide la identidad del dueño del teléfono.
// Devuelve true solo si el usuario se autenticó con éxito (huella/rostro).
export const autenticarBiometria = async (mensaje) => {
  try {
    // authenticateAsync abre el diálogo nativo del SO; si el usuario
    // cancela o falla, success = false (sin cruzar datos sensibles).
    const resultado = await LocalAuthentication.authenticateAsync({
      promptMessage: mensaje || 'Desbloqueá SaludWEB', // Texto que ve el usuario
      cancelLabel: 'Cancelar',                         // Botón para salir (iOS)
    });
    // Solo el resultado del SO decide: true = identidad confirmada.
    return resultado.success;
  } catch {
    // Si la llamada lanza un error (sin diálogo), se trata como fallo.
    return false;
  }
};