/** Origen de cada valor: el README exige diferenciarlos en los resultados. */
export type DataSource = 'measured' | 'user' | 'estimated';

/** Punto en píxeles del VIDEO ORIGINAL (no de la pantalla). */
export interface PixelPoint {
  x: number;
  y: number;
}

/** Punto en unidades físicas (metros) respecto al sistema de referencia. */
export interface PhysicalPoint {
  x: number;
  y: number;
}

export interface VideoInfo {
  fileName: string;
  objectUrl: string;
  width: number; // videoWidth
  height: number; // videoHeight
  duration: number; // segundos
  /** FPS con que se reproduce/analiza (ingresado o estimado). */
  fps: number;
  /** FPS reales de grabación si es cámara lenta (opcional). */
  captureFps?: number;
  fpsSource: DataSource;
}

export interface ReferenceSystem {
  origin: PixelPoint;
  /** Ángulo del eje X en radianes respecto a la horizontal de la imagen. Eje Y positivo hacia arriba. */
  axisAngle: number;
  scale: {
    pointA: PixelPoint;
    pointB: PixelPoint;
    realDistanceMeters: number;
  } | null;
}

export interface Measurement {
  id: string;
  /** Segundos desde el fotograma t = 0 elegido por el usuario. */
  time: number;
  frameIndex: number;
  pixel: PixelPoint;
  /** Se calcula al tener sistema de referencia + escala. */
  physical?: PhysicalPoint;
}

export type ResultKey =
  'position' | 'velocity' | 'acceleration' | 'trajectory' | 'flightTime' | 'maxHeight' | 'range';

export interface ValidationIssue {
  code: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export interface ValidationResult {
  canCompute: Record<ResultKey, boolean>;
  issues: ValidationIssue[];
}

export interface ResultValue {
  value: number;
  unit: string;
  source: DataSource;
  /** Ecuación en texto, ej. "y = y0 + v0y·t − ½·g·t²" */
  equation?: string;
}

/** x(t) = m·t + n  y  y(t) = a·t² + b·t + c, con su R². */
export interface FitResult {
  yOfT: { a: number; b: number; c: number; r2: number };
  xOfT: { m: number; n: number; r2: number };
}

export interface ProjectileResults {
  fit: FitResult;
  v0x: ResultValue;
  v0y: ResultValue;
  v0: ResultValue;
  launchAngleDeg: ResultValue;
  gravity: ResultValue;
  flightTime?: ResultValue;
  maxHeight?: ResultValue;
  range?: ResultValue;
}
