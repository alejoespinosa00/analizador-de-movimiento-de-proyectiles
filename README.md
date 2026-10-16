# PhysMotion — Analizador de movimiento de proyectiles

## 1. Descripción del proyecto

PhysMotion será una aplicación web educativa que permitirá analizar el movimiento de proyectiles a partir de videos. El propósito es relacionar los conceptos de física estudiados en clase con herramientas de software que permitan realizar mediciones, cálculos y representaciones gráficas de manera interactiva.

Un caso de uso será el lanzamiento de un balón de baloncesto hacia una canasta. El usuario podrá cargar un video del lanzamiento, examinarlo fotograma por fotograma, seleccionar puntos relevantes de la trayectoria y establecer un sistema de referencia para estudiar el movimiento.

A partir de los datos proporcionados por el usuario, el sistema realizará los cálculos físicos que sean posibles, identificará la información que falte y explicará los resultados obtenidos, incluyendo las ecuaciones utilizadas.

## 2. Problema que buscamos resolver

Resolver ejercicios de movimiento de proyectiles suele requerir identificar los datos conocidos, establecer un sistema de referencia, seleccionar las ecuaciones apropiadas y realizar los cálculos correspondientes. Cuando se analiza un movimiento real, además, es necesario medir posiciones y relacionarlas con el tiempo.

PhysMotion busca facilitar este proceso mediante una interfaz visual en la que el estudiante pueda analizar el movimiento directamente sobre un video, obtener mediciones y comprender cómo se aplican los conceptos de cinemática.

## 3. Objetivo general

Desarrollar una aplicación web que permita analizar el movimiento de proyectiles mediante la selección de posiciones en videos, el establecimiento de un sistema de referencia y el cálculo de variables cinemáticas, presentando resultados numéricos, gráficos y explicaciones físicas.

## 4. Funcionamiento principal

1. **Página de inicio:** presenta el propósito de la herramienta, sus beneficios y un botón para comenzar el análisis.
2. **Carga de archivo:** permite seleccionar un video compatible desde el dispositivo.
3. **Espacio de análisis:** muestra el video y ofrece controles para reproducirlo, pausarlo, avanzar o retroceder fotograma por fotograma y seleccionar posiciones relevantes.
4. **Configuración del sistema de referencia:** permite definir el origen de coordenadas, la orientación de los ejes y una distancia real conocida para convertir píxeles en unidades físicas.
5. **Registro de mediciones:** permite seleccionar la posición del proyectil en diferentes instantes y relacionarla con el tiempo.
6. **Validación de datos:** verifica qué información está disponible, qué datos faltan y qué cálculos pueden realizarse con suficiente información.
7. **Resultados:** presenta las variables calculadas, las ecuaciones aplicadas, el procedimiento, las unidades y las gráficas correspondientes.
8. **Secciones informativas:** incluye una página de instrucciones y una sección de presentación del equipo desarrollador.

## 5. Variables físicas

La primera versión se centrará en la cinemática del movimiento de proyectiles:

- Posición horizontal y vertical.
- Desplazamiento.
- Tiempo transcurrido.
- Componentes horizontal y vertical de la velocidad.
- Aceleración.
- Trayectoria y ecuación del movimiento.
- Tiempo de vuelo, altura máxima y alcance horizontal, cuando los datos permitan calcularlos.

Los resultados deben diferenciar entre datos medidos, datos introducidos por el usuario y valores estimados por el sistema.

## 6. Alcance de la primera versión

La aplicación permitirá cargar videos, analizar fotogramas manualmente, configurar un sistema de referencia, registrar puntos de trayectoria, validar los datos disponibles y calcular variables físicas.

No se requiere que el sistema detecte automáticamente el proyectil mediante inteligencia artificial. La selección manual de puntos será suficiente para la primera versión.

El sistema deberá comunicar claramente las limitaciones de las mediciones y evitar presentar como exactos resultados que dependan de estimaciones o de datos insuficientes.

## 7. Resultado esperado

Al finalizar el desarrollo, el equipo deberá contar con una aplicación web funcional, accesible mediante un enlace, que permita realizar un análisis de movimiento de principio a fin y que pueda utilizarse durante la exposición académica.

El proyecto deberá demostrar la integración entre desarrollo de software, visualización de datos y conceptos de física, priorizando la precisión de los cálculos, la facilidad de uso y la claridad de los resultados.
