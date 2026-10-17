# Backlog por sprints

Cada tarea indica los archivos principales que toca, para que varias personas trabajen en paralelo sin conflictos.

## Sprint 1 — Video y tiempo por fotograma (mayor riesgo técnico)

| Tarea                                                                | Archivos                                          | Notas                          |
| -------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------ |
| Cargar video con `URL.createObjectURL` y leer metadatos              | `video/VideoUploader.tsx`, `useAnalysisStore`     | Aviso de MP4 H.264 recomendado |
| Reproductor y sincronización con `requestVideoFrameCallback`         | `video/VideoPlayer.tsx`, `hooks/useVideoFrame.ts` | Fallback si no hay soporte     |
| Controles ±1 / ±10 fotogramas, ir a fotograma, definir t = 0         | `video/FrameControls.tsx`                         |                                |
| FPS: estimación automática + campo editable + factor de cámara lenta | `hooks/useFps.ts`, `FrameControls.tsx`            | Marcar origen con `fpsSource`  |

## Sprint 2 — Sistema de referencia y mediciones

| Tarea                                                      | Archivos                                                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Canvas superpuesto: dibujar ejes/puntos y captura de clics | `video/VideoCanvasOverlay.tsx`, `utils/coordinates.ts`                                      |
| Panel de origen, ángulo de ejes y calibración de escala    | `analysis/ReferenceSystemPanel.tsx`                                                         |
| Registro de puntos y tabla de mediciones (px y metros)     | `analysis/MeasurementTable.tsx`, `physics/measurements.ts`                                  |
| Reglas de validación y panel de datos faltantes            | `physics/validation.ts`, `analysis/ValidationPanel.tsx`, `tests/physics/validation.test.ts` |

## Sprint 3 — Núcleo de cálculo

| Tarea                                                                | Archivos                                                    |
| -------------------------------------------------------------------- | ----------------------------------------------------------- |
| Ajuste por mínimos cuadrados: recta x(t) y parábola y(t), con R²     | `physics/projectile.ts`, `tests/physics/projectile.test.ts` |
| Velocidades v0x, v0y, ángulo y gravedad estimada a partir del ajuste | `physics/projectile.ts`                                     |
| Desplazamiento y velocidad media entre puntos                        | `physics/measurements.ts`                                   |
| Pruebas con datos sintéticos (sin ruido y con ruido ±2 px)           | `tests/physics/`                                            |

## Sprint 4 — Resultados

| Tarea                                                                | Archivos                                 |
| -------------------------------------------------------------------- | ---------------------------------------- |
| Tiempo de vuelo, altura máxima y alcance                             | `physics/projectile.ts`                  |
| Panel de resultados con unidades, ecuaciones y procedimiento         | `analysis/ResultsPanel.tsx`              |
| Insignias medido / ingresado / estimado y advertencias de fiabilidad | `ui/SourceBadge.tsx`, `ResultsPanel.tsx` |

## Sprint 5 — Gráficas

| Tarea                                                | Archivos                     |
| ---------------------------------------------------- | ---------------------------- |
| Trayectoria y vs x (puntos medidos + curva ajustada) | `charts/TrajectoryChart.tsx` |
| x(t), y(t), vx(t), vy(t)                             | `charts/TimeSeriesChart.tsx` |

## Sprint 6 — Contenido, pulido y despliegue

| Tarea                                                 | Archivos                          |
| ----------------------------------------------------- | --------------------------------- |
| Página de inicio con diseño final                     | `pages/HomePage.tsx`, `index.css` |
| Instrucciones y recomendaciones de grabación          | `pages/HowItWorksPage.tsx`        |
| Presentación del equipo                               | `pages/AboutPage.tsx`             |
| Responsive, accesibilidad y manejo de errores         | varios                            |
| Despliegue en Vercel y prueba completa con video real | `vercel.json`                     |

## Verificación de precisión (antes de la exposición)

Grabar un lanzamiento real con una distancia conocida en el plano del movimiento y comprobar que la g estimada se acerca a 9.8 m/s².
