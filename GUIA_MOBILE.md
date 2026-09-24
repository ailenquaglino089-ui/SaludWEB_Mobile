# Guía aplicada — Adaptar el sistema a mobile: De escritorio a la palma de la mano

> **Repositorio destino:** `SaludWEB_Mobile` (app móvil Expo / React Native)
>
> **Estudiante:** Equipo SaludWEB (Ailen Quaglino) — Programación IV
>
> **Formato:** a continuación está la guía original del docente, comentada **línea por línea**
> con bloques `<!-- Comentario (aplicación) -->` que explican **cómo** y **dónde** se aplicó cada
> punto en este repositorio. Al final hay una tabla de correspondencia archivo → línea de código.

---

## Mobile-First

### Objetivo: la estrategia Mobile-First

Adoptar una filosofía Mobile-First significa diseñar y desarrollar pensando primero en el dispositivo más restrictivo — la pantalla pequeña — y luego escalar hacia experiencias más amplias. Este enfoque no solo mejora la experiencia del usuario móvil, sino que también disciplina el diseño en general, eliminando elementos superfluos y priorizando lo verdaderamente importante.

<!-- Comentario (aplicación):
Como este repositorio ES una app nativa (React Native/Expo), ya nace desde la pantalla
móvil. La guía se aplicó subiendo la base mínima de calidad: targets táctiles de 44px,
tipografía de 16px y contraste AA, y priorizando solo 4 módulos críticos.
Archivos: src/styles.js, src/components/BottomNav.jsx.
-->

#### Usabilidad prioritaria

Diseñar desde el dispositivo más restrictivo garantiza que cada elemento tenga un propósito claro. Si funciona en mobile, funciona en todas partes. La restricción de espacio obliga a tomar decisiones de diseño más inteligentes y centradas en el usuario real.

<!-- Comentario (aplicación):
Se simplificó el Dashboard: en lugar de repetir los accesos a módulos como botones,
quedó el saludo + rol y la navegación pasó a una barra inferior fija.
Archivo: src/screens/Dashboard.jsx.
-->

#### Experiencia táctil fluida

Transformar una navegación compleja basada en hover y clics de precisión en una experiencia táctil fluida requiere repensar cada interacción. Los gestos de deslizamiento, el tap y el pinch deben ser naturales e intuitivos para el usuario final.

<!-- Comentario (aplicación):
Todo el listado se recorre con deslizamiento vertical (FlatList) y el listado cierra el
teclado al hacer scroll (keyboardDismissMode="on-drag").
Archivo: src/screens/PagedList.jsx.
-->

#### Paridad funcional total

La meta final no es crear una versión reducida del sistema, sino alcanzar una paridad funcional completa con la versión desktop. El usuario móvil debe poder realizar exactamente las mismas tareas críticas sin fricciones ni limitaciones artificiales.

<!-- Comentario (aplicación):
La app consume la MISMA API REST del backend con JWT y roles, por lo que autenticación,
consultas y operaciones de alta/edición/baja son idénticas a la web: pacientes y
médicos los gestiona el admin, las prescripciones solo las crea/edita el médico, el
cambio de estado lo puede hacer cualquier rol y el borrado siempre lo ejecuta el admin
(mismas reglas que routes.php del backend).
Archivos: src/api/client.js, src/context/AuthContext.jsx, src/screens/*.jsx,
src/components/formularios/*.jsx.
-->

> El 53% de los usuarios abandona un sitio si tarda más de 3 segundos en cargar en mobile. La velocidad y la usabilidad van de la mano.

<!-- Comentario (aplicación):
Aplicado: paginado server-side (POR_PAGINA en src/config.js), FlatList virtualizada,
timeout de peticiones y expulsión automática ante 401. Ver src/screens/PagedList.jsx.
-->

---

## Probar el sistema en modo dispositivo móvil

Antes de realizar cualquier modificación, es fundamental llevar a cabo una auditoría exhaustiva del estado actual del sistema en dispositivos móviles. Esta fase de diagnóstico establece la línea base desde la cual mediremos el progreso y nos permite priorizar los problemas de mayor impacto para el usuario.

<!-- Comentario (aplicación):
La auditoría se realizó con Expo Go en Android/iOS + emuladores. Documentamos los
hallazgos en este mismo archivo (sección "Hallazgos de la auditoría" al final).
-->

#### Herramientas de simulación

Chrome DevTools es la herramienta principal para simular una amplia variedad de dispositivos y resoluciones de pantalla. Permite emular las condiciones exactas de cada dispositivo, incluyendo la densidad de píxeles, el ancho de pantalla y las limitaciones de red. Complementar con Firefox Responsive Design Mode ofrece una perspectiva adicional.

- Simulación de más de 50 dispositivos populares
- Emulación de condiciones de red lentas (3G, 2G)
- Vista de puntos de quiebre en tiempo real
- Auditoría automática con Lighthouse

<!-- Comentario (aplicación):
Para la SPA web estas herramientas aplican en navegador; en la app móvil se probó con
Expo Go (Android/iOS) y emuladores. En mobile la métrica equivalente es el tiempo hasta
la interactividad y el tamaño del bundle JS (ver "Optimización de rendimiento").
-->

#### Testeo en condiciones reales

La simulación en escritorio no reemplaza el testeo con dispositivos físicos reales. Es fundamental validar cómo los usuarios interactúan con el sistema bajo condiciones auténticas: con luz solar directa sobre la pantalla, en movimiento, con distracciones ambientales y con un solo pulgar como herramienta de navegación principal.

- Pruebas con iOS Safari y Android Chrome
- Validación de legibilidad bajo luz solar directa
- Navegación con una sola mano (regla del pulgar)
- Identificación de puntos de quiebre en layouts responsivos

<!-- Comentario (aplicación):
La regla del pulgar motivó el patrón Bottom Navigation Bar: los accesos principales
quedan fijos en la zona inferior de la pantalla.
Archivo: src/components/BottomNav.jsx.
-->

#### Registro y documentación

Cada problema detectado debe documentarse con capturas de pantalla, el dispositivo en el que se reproduce y el impacto estimado en la experiencia del usuario. Esta documentación estructurada facilitará la priorización y el seguimiento durante el desarrollo.

<!-- Comentario (aplicación):
Cada problema detectado quedó registrado y priorizado en "Registro de problemas"
(al final) con su impacto y el archivo donde se corrigió.
-->

---

## Detectar problemas de uso

Una vez completada la auditoría inicial, el siguiente paso es categorizar y priorizar los problemas identificados según su impacto en la experiencia del usuario. No todos los problemas tienen el mismo peso: un botón demasiado pequeño puede costar conversiones enteras, mientras que un margen desalineado es meramente estético.

<!-- Comentario (aplicación):
Los problemas priorizados fueron: targets táctiles menores a 44px, tipografía menor a
16px y contrastes bajos. Todos son "peso alto" porque afectan la usabilidad real.
Archivo: src/styles.js.
-->

#### Análisis de fricción y puntos de abandono

El análisis de fricción consiste en mapear el recorrido del usuario en pantallas pequeñas e identificar exactamente dónde se pierde o frustra. Las herramientas de mapas de calor táctil como Hotjar revelan patrones de comportamiento impredecibles: zonas muertas donde los usuarios tocan sin respuesta, flujos truncados donde abandonan la tarea. Cada punto de fricción identificado es una oportunidad de mejora directa sobre la tasa de conversión.

<!-- Comentario (aplicación):
La fricción mayor detectada fue la doble vía de navegación (botones en Dashboard +
botón "Volver" en cada listado). Se unificó en un único punto: la barra inferior.
Archivos: App.js, src/components/BottomNav.jsx.
-->

#### Elementos no táctiles: el problema del tamaño

Uno de los errores más comunes al portar sistemas desktop a mobile es mantener elementos interactivos diseñados para la precisión del cursor del ratón. Las directrices de accesibilidad de Apple y Google establecen un tamaño mínimo de 44x44 píxeles para cualquier elemento táctil interactivo. Botones demasiado pequeños, enlaces muy juntos entre sí y checkboxes diminutos son fuentes constantes de errores de pulsación que generan frustración inmediata en el usuario.

<!-- Comentario (aplicación):
SE APLICÓ: todos los botones usan minHeight: 44px (48px en el primario), los inputs
tienen minHeight: 44px y los ítems de la barra inferior idem.
Archivo: src/styles.js → botonPrimario, botonSecundario, botonPeligro, input, navItem.
-->

#### Legibilidad y contraste: la base de la accesibilidad

La legibilidad en móvil se ve afectada por múltiples factores simultáneos: fuentes demasiado pequeñas (el mínimo recomendado es 16px para texto de cuerpo), contraste insuficiente entre texto y fondo, líneas de texto demasiado largas que dificultan el seguimiento visual, y interlineado comprimido que hace el texto denso e ilegible. Las WCAG 2.1 exigen un ratio de contraste mínimo de 4.5:1 para texto normal y 3:1 para texto grande.

<!-- Comentario (aplicación):
SE APLICÓ: cuerpo de texto, etiquetas, inputs y filas pasaron de 14px a 16px.
La etiqueta de las filas pasó de #888 (ratio ~3.6:1, NO cumple) a #555 (ratio ~7:1,
cumple WCAG AA). Ver src/styles.js → texto, label, input, fila, filaLabel, filaValor.
-->

---

## Convertir tablas en cards

Las tablas de datos son uno de los elementos más problemáticos al adaptar sistemas a mobile. Diseñadas para pantallas anchas con múltiples columnas visibles simultáneamente, las tablas colapsan completamente en pantallas estrechas, requiriendo scroll horizontal que rompe la experiencia de usuario. La solución es transformar filas de tabla en tarjetas (cards) verticalmente apilables, un patrón probado y altamente efectivo para la visualización de datos en móvil.

<!-- Comentario (aplicación):
La app móvil NO usa tablas: cada registro se renderiza como una tarjeta vertical
apilable dentro de un FlatList. Es el mismo patrón de la guía, ya aplicado desde el
primer commit. Archivo: src/screens/PagedList.jsx (renderItem → styles.tarjeta).
-->

#### Del formato fila a bloques apilables

Cada fila de la tabla original se convierte en una card independiente que presenta la información de forma vertical y jerárquica. El elemento más importante ocupa la posición superior prominente, seguido de los datos secundarios en menor tamaño. Este patrón permite al usuario escanear rápidamente los registros con un simple deslizamiento vertical, el movimiento más natural en un dispositivo móvil.

#### Priorización de información esencial

No toda la información de una tabla tiene el mismo peso. Al convertir a cards, es necesario definir una jerarquía clara: qué datos son imprescindibles a primera vista y cuáles pueden ocultarse en un panel expandible o en una vista de detalle. Esta selección deliberada reduce la carga cognitiva y permite al usuario tomar decisiones más rápidas con menos información visible simultáneamente.

<!-- Comentario (aplicación):
Cada pantalla configura únicamente los campos esenciales y en el orden jerárquico
correcto: nombre primero, datos secundarios después. Las prescripciones recortan el
detalle de medicamentos a un resumen y usan badges de color por estado.
Archivos: src/screens/Pacientes.jsx, Medicos.jsx, Prescripciones.jsx.
-->

#### Overflow horizontal controlado

Para tablas con datos verdaderamente complejos donde la conversión a cards no es viable, se puede implementar un overflow horizontal controlado: la tabla mantiene su estructura pero puede desplazarse lateralmente dentro de un contenedor bien delimitado. Es fundamental señalizar visualmente esta posibilidad al usuario con indicadores de scroll y sombras que sugieran contenido oculto a la derecha.

<!-- Comentario (aplicación):
En la app no hay tablas anchas; el único scroll horizontal permitido es el de los chips
de filtro de estado en Prescripciones (ScrollView horizontal) con indicadores de scroll
activados en Android. Ver src/screens/PagedList.jsx (filtros).
-->

---

## Ajustar formularios

Los formularios son el punto de mayor fricción en cualquier experiencia mobile. Escribir en una pantalla pequeña es inherentemente más costoso que hacerlo en un teclado físico, por lo que cada campo innecesario es un obstáculo que aumenta la tasa de abandono. El principio rector es: cada campo que eliminamos es una victoria para el usuario y para la tasa de conversión del sistema.

<!-- Comentario (aplicación):
Cuando se creó esta documentación el único formulario era el Login, reducido a los 2
campos esenciales (email + contraseña) en una sola pantalla sin scroll
(src/screens/Login.jsx). Con el CRUD completo se agregaron los formularios de
pacientes, médicos y prescripciones con solo los campos indispensables de cada
entidad; los campos opcionales quedan marcados y los catálogos (obra social,
pacientes) se eligen con un Selector en lugar de teclearlos.
Archivos: src/screens/Login.jsx, src/components/CampoInput.jsx,
src/components/Selector.jsx, src/components/formularios/*.jsx.
-->

#### Minimización de campos

Realizar una auditoría crítica de cada campo del formulario con una pregunta fundamental: ¿Es absolutamente imprescindible este dato ahora mismo? Los campos opcionales deben ocultarse por defecto, los datos que pueden obtenerse de otra fuente deben eliminarse, y los campos complejos deben simplificarse. Un formulario de registro que pide 12 datos puede reducirse a 3 campos esenciales con el resto recopilado progresivamente.

- Eliminar campos opcionales o diferirlos
- Combinar campos cuando sea posible (ej: nombre completo)
- Utilizar valores por defecto inteligentes
- Implementar autocompletado del navegador

<!-- Comentario (aplicación):
Se aplicó "autocompletado del sistema": los campos usan autoComplete + textContentType
para que el SO complete email y contraseña sin teclearlos. Ver src/screens/Login.jsx.
-->

#### Inputs táctiles optimizados

Cada tipo de campo debe activar el teclado más apropiado para su contenido. Los atributos HTML type e inputmode son aliados fundamentales: type="email" activa el teclado con @ visible, type="tel" muestra el teclado numérico, type="number" con inputmode="decimal" facilita la entrada de montos. Las etiquetas flotantes (floating labels) mantienen el contexto visible mientras el usuario escribe, eliminando la confusión de los placeholders que desaparecen.

<!-- Comentario (aplicación):
El equivalente en React Native es keyboardType: el email usa "email-address" (teclado
con @ y .) y la contraseña usa secureTextEntry. Las etiquetas están SIEMPRE visibles
(no solo placeholders), tal como recomienda la guía.

Aplicado también en los formularios del CRUD: el DNI y la fecha de vencimiento usan
teclados numéricos (number-pad / numbers-and-punctuation), las indicaciones usan
multiline, y los selects (obra social, paciente) abren una lista modal (Selector) en
vez de pedir escribir a mano. Archivos: FormularioPaciente.jsx, FormularioMedico.jsx,
FormularioPrescripcion.jsx, src/components/Selector.jsx.
-->

#### Validación en tiempo real

La validación debe ocurrir en el momento preciso: no antes de que el usuario haya tenido oportunidad de completar el campo, pero tampoco solo al intentar enviar el formulario. El feedback inline inmediato tras perder el foco del campo (onBlur) reduce drásticamente los errores de envío. Los mensajes de error deben ser específicos y accionables, no genéricos ni intimidantes.

<!-- Comentario (aplicación):
SE APLICÓ: validación onBlur por campo con mensajes específicos y accionables
("El email es obligatorio", "Ingresá un email válido"), más validación completa al
enviar. El error se muestra inline, bajo el campo correspondiente.
Archivo: src/screens/Login.jsx → validarCampoAlSalir / validarFormulario / erroresCampo.
-->

---

## Mejorar menú y navegación

La navegación es el esqueleto de cualquier sistema. En mobile, el espacio en pantalla es un recurso extremadamente escaso, y la arquitectura de la información debe adaptarse radicalmente. El objetivo no es trasladar el menú de escritorio a un formato compacto, sino repensar completamente la jerarquía de acciones según las necesidades reales del usuario móvil.

#### Simplificación radical del menú principal

La regla de oro es clara: máximo 5 elementos críticos en el menú principal visible. Más opciones no significa más poder para el usuario; significa parálisis por análisis y mayor tiempo hasta la acción deseada. Cada elemento del menú actual debe pasar por un filtro riguroso: ¿Con qué frecuencia lo usa un usuario móvil? ¿Es una acción primaria o secundaria? Las opciones secundarias, de configuración o de uso infrecuente deben quedar fuera del menú principal.

<!-- Comentario (aplicación):
SE APLICÓ: el menú principal quedó con exactamente 5 elementos críticos
(Inicio, Pacientes, Médicos, Recetas, Salir), fijos en la barra inferior.
Todo lo secundario (roles, config) quedó fuera del menú principal.
Archivo: src/components/BottomNav.jsx → const ELEMENTOS.
-->

#### Implementación del patrón Hamburger Menu

El Hamburger Menu (≡) es el patrón estándar consolidado para la navegación secundaria en mobile. Al colapsar el menú completo tras un icono discreto, libera espacio valioso en la pantalla para el contenido principal. Si bien su descubrimiento es ligeramente inferior a la navegación visible, sigue siendo el equilibrio óptimo entre eficiencia de espacio y accesibilidad para navegación secundaria y opciones de configuración del sistema.

<!-- Comentario (aplicación):
Con solo 4 pantallas y la barra inferior fija, no hace falta un menú hamburguesa:
todos los destinos primarios quedan visibles. Si en el futuro se agregan opciones
de configuración, se colapsarían tras un ícono "≡" siguiendo este patrón (pendiente).
-->

#### Bottom Navigation Bar y sticky positioning

Para las acciones más frecuentes e importantes, el sticky bottom bar es el patrón más eficaz en mobile. Posicionado en la parte inferior de la pantalla, coincide perfectamente con la zona de alcance natural del pulgar derecho en el 90% de los usuarios. Este patrón, popularizado por apps como Instagram y Twitter, sitúa las acciones principales — inicio, búsqueda, crear, notificaciones, perfil — exactamente donde el usuario espera encontrarlas, eliminando la necesidad de desplazarse hacia arriba para navegar.

<!-- Comentario (aplicación):
SE APLICÓ — patrón central de esta adaptación. La barra inferior es SIEMPRE visible
(sticky) sobre las 4 pantallas autenticadas, con el ítem activo resaltado.
Archivo: src/components/BottomNav.jsx (nuevo) + App.js (integración).
-->

#### Breadcrumbs y orientación contextual

En flujos de múltiples pasos o estructuras jerárquicas profundas, el usuario móvil puede desorientarse fácilmente. Implementar indicadores de progreso claros, breadcrumbs simplificados (máximo 2 niveles visibles) y botones de "atrás" consistentes garantiza que el usuario siempre sepa dónde está y cómo volver, reduciendo la ansiedad de navegación y las tasas de abandono en mitad de un flujo crítico.

<!-- Comentario (aplicación):
Cada la pantalla de listado muestra su título ("👤 Pacientes", "👨‍⚕️ Médicos",
"💊 Prescripciones") y la barra inferior resalta dónde está el usuario. El "volver"
consistente lo garantiza el ítem "Inicio" siempre visible.
-->

---

## Validar Login, Listado y CRUD en mobile

Los tres flujos más críticos de cualquier sistema de gestión — autenticación, visualización de registros y operaciones CRUD — requieren una validación exhaustiva y específica en mobile. Estos flujos representan el núcleo funcional del sistema; si fallan en móvil, todo lo demás pierde relevancia.

#### Autenticación mobile-optimizada

La pantalla de login debe ser la más simple y rápida del sistema. Implementar autenticación biométrica (huella dactilar y Face ID) como método principal elimina la necesidad de teclear credenciales repetidamente. Los botones de acceso rápido con Google o Microsoft SSO reducen la fricción al mínimo. El campo de contraseña debe incluir la opción de mostrar/ocultar para evitar errores de tipeo en teclados táctiles, y el formulario debe completarse en una sola pantalla sin scroll.

<!-- Comentario (aplicación):
SE APLICÓ: login en una sola pantalla sin scroll, contraseña con botón
mostrar/ocultar, validación onBlur y autocompletado del SO.

SE APLICÓ (biometría): "Proteger con huella" (expo-local-authentication).
Al activarlo en el Dashboard, la próxima apertura de la app restaura la
sesión pero queda BLOQUEADA y pide huella/Face ID antes de entrar
(pantalla src/screens/Bloqueo.jsx). Entrar con email+clave siempre
desbloquea; sin sensor disponible la opción se oculta y nada cambia.
Archivos: src/utils/biometria.js, src/context/AuthContext.jsx,
src/screens/Bloqueo.jsx, src/screens/Dashboard.jsx, App.js.

SE APLICÓ (SSO): botones "Continuar con Google" y "Continuar con
Microsoft" en el Login (src/screens/Login.jsx). Cada botón se muestra
SOLO si el proveedor está configurado en src/config.js (SSO). El flujo
saca un id_token con expo-auth-session (cliente público/PKCE, sin
secret en el dispositivo) y lo envía a POST /api/auth/sso, que valida
la firma contra las claves públicas del proveedor y emite el JWT propio.
Regla de negocio: solo habilita cuentas locales existentes (email debe
coincidir). Sin credenciales en el backend, la API responde 501.
Archivos: src/config.js, src/context/AuthContext.jsx, src/screens/Login.jsx;
Backend: services/AuthService.php, controllers/AuthController.php, routes.php.
-->

#### Listados y gestión de registros

Los listados en mobile deben implementar carga progresiva (infinite scroll o paginación) para evitar tiempos de carga largos. Cada registro debe mostrar únicamente los campos más relevantes con opción de ver el detalle completo. Las acciones rápidas — editar, eliminar, cambiar estado — deben ser accesibles mediante swipe lateral sobre el item, siguiendo el patrón establecido por aplicaciones de gestión nativas. La búsqueda y filtrado deben ser accesibles con un solo tap desde la parte superior del listado.

<!-- Comentario (aplicación):
SE APLICÓ: paginación server-side (Anterior/Siguiente) + búsqueda con debounce de
400ms + filtros tipo chip con un tap, todos desde la parte superior del listado.
Cards con solo los campos relevantes por registro.
Archivo: src/screens/PagedList.jsx.

PENDIENTE: swipe lateral para acciones (editar/eliminar) requiere un gesto nativo
adicional; documentado como siguiente paso.
-->

#### CRUD intuitivo en flujo único

Las operaciones de creación y edición no deben romper el layout ni generar ventanas modales que ocupen toda la pantalla sin posibilidad de scroll. El objetivo es que el flujo completo de crear, leer, actualizar y eliminar sea ejecutable de forma intuitiva dentro de un scroll vertical sin necesidad de navegar entre múltiples pantallas. Los botones de confirmación y cancelación deben ser siempre visibles, especialmente en formularios largos, usando un footer fijo en la parte inferior del formulario.

> **Criterio de aceptación:** un usuario nuevo debe poder completar cada operación CRUD en menos de 60 segundos sin instrucciones previas.

<!-- Comentario (aplicación):
SE APLICÓ por completo: el CRUD funciona en flujo único dentro de cada módulo.
Al tocar "Nuevo", "Editar" o "Eliminar", la pantalla muestra el formulario (alta/
edición) o el diálogo de confirmación sin abandonar el módulo ni abrir vistas modales
a pantalla completa. Cada formulario mantiene un pie FIJO con los botones
Confirmar/Cancelar siempre visibles (styles.pieFormulario), tal como pide la guía.
El alta/edición valida en el cliente con las mismas reglas que el backend, se añaden
medicamentos de forma dinámica (lista de filas con agregar/quitar) y el borrado exige
confirmación explícita antes de enviar el DELETE.
Archivos: src/screens/Pacientes.jsx, Medicos.jsx, Prescripciones.jsx,
src/components/formularios/*.jsx, src/components/ConfirmarModal.jsx.
-->

---

## Optimización de rendimiento

Un sistema visualmente perfecto pero lento es un sistema fallido en mobile. Las redes móviles son inherentemente más lentas e inestables que las conexiones fijas, y los procesadores de los smartphones tienen recursos más limitados que los equipos de escritorio. La optimización del rendimiento no es un extra opcional: es una parte esencial de la experiencia mobile y tiene impacto directo y medible en las tasas de retención y conversión.

#### Abandono por lentitud

> Porcentaje de usuarios que abandonan un sitio móvil si tarda más de 3 segundos en cargar, según datos de Google. Cada segundo adicional de carga aumenta la tasa de rebote en un 32%.

#### Reducción de peso con WebP

> Reducción promedio del tamaño de imágenes al migrar de JPEG/PNG a formato WebP moderno, sin pérdida perceptible de calidad visual para el usuario final.

#### LCP objetivo

> El Largest Contentful Paint debe ser inferior a 2.5 segundos según Core Web Vitals de Google para ser considerado "bueno" y no penalizar el posicionamiento SEO del sistema.

<!-- Comentario (aplicación):
(LCP/SEO corresponden a la web; en la app los equivalentes son el tamaño del bundle
JS y el TTI.) En mobile se optimizó: listados virtualizados (FlatList), paginado
server-side (no se transfieren miles de filas), búsqueda con debounce y el cliente
HTTP con timeout de 15s y export del bundle estructurado.
Archivos: src/screens/PagedList.jsx, src/config.js, src/api/client.js.
-->

#### Carga asíncrona y diferida

La carga asíncrona de recursos no críticos permite que el contenido principal sea visible y funcional mucho antes de que la página esté completamente cargada. Implementar lazy loading para imágenes y módulos JavaScript que están fuera del viewport inicial puede reducir el tiempo hasta la interactividad en un 40-60%. Los recursos críticos — CSS above-the-fold, fuentes principales, JavaScript del framework — deben priorizarse con preload y prefetch.

#### Minimización y optimización de assets

La minimización de archivos CSS y JavaScript elimina espacios, comentarios y código redundante, reduciendo el tamaño de transferencia hasta un 30%. Combinar con compresión Gzip o Brotli en el servidor puede reducir el tamaño total transferido hasta un 70%. El uso de service workers para cacheo inteligente permite que visitas recurrentes carguen el sistema casi instantáneamente, incluso con conectividad intermitente.

<!-- Comentario (aplicación):
En React Native el bundle lo arma Metro en build (se exportó a ./dist). La sesión se
persiste con AsyncStorage, por lo que al reabrir la app NO se vuelve a pedir
credenciales y el login se salta (equivalente a "visit-as recurrentes instantáneas").
Archivo: src/context/AuthContext.jsx.
-->

---

## Entregable: versión mobile funcional

Al completar todas las fases del proceso de adaptación, el entregable final es mucho más que una versión reducida del sistema original: es una interfaz adaptativa, performante y centrada en el usuario móvil que mantiene la paridad funcional completa con la versión desktop. Este hito representa una transformación profunda de la experiencia de usuario y sienta las bases para el crecimiento futuro del sistema.

#### Transformación completada

De una estructura rígida y orientada a escritorio a una interfaz adaptativa y fluida. Tablas convertidas en cards, formularios optimizados, navegación rediseñada y flujos CRUD intuitivos que funcionan perfectamente en pantallas desde 320px.

#### Impacto esperado en métricas

Mejora medible en la tasa de retención de usuarios móviles, reducción del tiempo hasta completar tareas clave, aumento de la tasa de conversión en flujos críticos y disminución de tickets de soporte relacionados con problemas de usabilidad en dispositivos móviles.

#### Siguientes pasos y monitoreo

Implementar monitoreo continuo con métricas específicas de tráfico móvil: Core Web Vitals, tasa de rebote por tipo de dispositivo, mapas de calor táctil y grabaciones de sesiones. Establecer un ciclo de mejora iterativa basado en datos reales de comportamiento de usuarios móviles reales.

---

## Registro de problemas (auditoría)

| # | Problema detectado | Prioridad | Dispositivo | Solución aplicada |
| --- | --- | --- | --- | --- |
| 1 | Botones y elementos táctiles con altura < 44px | Alta | Todos | `minHeight: 44/48` en todos los controles (`src/styles.js`) |
| 2 | Tipografía de 14px menor a la recomendación (16px) | Alta | Todos | Subida a 16px en cuerpo, etiquetas, inputs y filas (`src/styles.js`) |
| 3 | Etiquetas de listado con contraste insuficiente (#888, ~3.6:1) | Alta | LCD/AMOLED | Cambiado a `#555` (~7:1, WCAG AA) (`src/styles.js`) |
| 4 | Doble vía de navegación (Dashboard + botón Volver) | Media | Todos | Navegación unificada en barra inferior sticky (`src/components/BottomNav.jsx`) |
| 5 | Login sin feedback en tiempo real | Media | Todos | Validación onBlur + errores por campo (`src/screens/Login.jsx`) |
| 6 | Contraseña escrita a ciegas en teclados táctiles | Media | Todos | Botón mostrar/ocultar (`src/screens/Login.jsx`) |
| 7 | Sin autocompletado de credenciales | Media | Todos | `autoComplete` + `textContentType` (`src/screens/Login.jsx`) |
| 8 | Listados pesados en redes lentas | Media | 3G/4G | Paginado server-side + FlatList virtualizada (`src/screens/PagedList.jsx`) |
| 9 | CRUD de solo lectura (sin alta/edición/baja desde mobile) | Alta | Todos | Formularios de alta/edición con footer fijo, confirmación de borrado, cambio de estado y gating por rol (`src/components/formularios/*.jsx`, `src/screens/*.jsx`, `src/components/ConfirmarModal.jsx`) |

## Checklist de entregable (guía)

| Ítem de la guía | Estado | Dónde se aplicó |
| --- | --- | --- |
| ✓ Auditoría completada | ✔ Hecho | Este documento (Registro de problemas) |
| ✓ UI adaptada (tarjetas, 44px, 16px, contraste) | ✔ Hecho | `src/styles.js`, `src/screens/PagedList.jsx` |
| ✓ Navegación rediseñada (Bottom Nav, 5 ítems) | ✔ Hecho | `src/components/BottomNav.jsx`, `App.js` |
| ✓ Login validado (onBlur, mostrar/ocultar, autocompletado) | ✔ Hecho | `src/screens/Login.jsx` |
| ✓ CRUD validado en los listados | ✔ Hecho | Login y Listados contra la API real |
| ✓ CRUD completo (alta/edición/baja) | ✔ Hecho | Formularios de pacientes/médicos/prescripciones + confirmación de baja + cambio de estado con gating por rol (`src/components/formularios/*.jsx`, `src/screens/*.jsx`, `src/components/ConfirmarModal.jsx`) |
| ✓ Performance: carga < 3s, listas livianas | ✔ Hecho | FlatList + paginado + timeout (`src/screens/PagedList.jsx`, `src/config.js`) |
| ✓ Biometría (huella / Face ID) | ✔ Hecho | Desbloqueo de la sesión guardada con `expo-local-authentication` (`src/utils/biometria.js`, `src/screens/Bloqueo.jsx`, `src/screens/Dashboard.jsx`) |
| ✓ SSO (Google / Microsoft) | ✔ Hecho (requiere credenciales) | Botones en el Login con `expo-auth-session` + validación del `id_token` en el backend (`src/screens/Login.jsx`, `src/config.js`, `POST /api/auth/sso`) — funcionan al completar las credenciales OAuth en `config.js` y `.env` |

---

*Guía del docente aplicada y comentada línea por línea. El código completo (con comentarios en cada archivo) vive en la rama `dev` de `SaludWEB_Mobile`.*