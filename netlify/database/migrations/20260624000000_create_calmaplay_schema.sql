-- =====================================================================
-- CALMAPLAY — Migración inicial
-- Netlify Database aplica este archivo automáticamente en el próximo
-- deploy (no necesitas ejecutarlo a mano).
-- =====================================================================

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT,
  correo TEXT NOT NULL UNIQUE,
  contrasena_hash TEXT NOT NULL,
  edad INTEGER,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE minijuegos (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  dificultad TEXT,
  puntos_recompensa INTEGER NOT NULL,
  jugable BOOLEAN DEFAULT TRUE
);

CREATE TABLE ejercicios (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  duracion_minutos INTEGER NOT NULL
);

CREATE TABLE musica (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  tipo TEXT,
  duracion_segundos INTEGER,
  archivo_audio_url TEXT,
  disponible BOOLEAN DEFAULT TRUE
);

CREATE TABLE recompensas (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  puntos_necesarios INTEGER NOT NULL,
  icono TEXT
);

CREATE TABLE progreso_usuario (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  minijuego_id INTEGER NOT NULL REFERENCES minijuegos(id),
  puntos_obtenidos INTEGER NOT NULL,
  completado_en TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_progreso_usuario_id ON progreso_usuario(usuario_id);
CREATE INDEX idx_progreso_minijuego_id ON progreso_usuario(minijuego_id);

CREATE TABLE recompensas_desbloqueadas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  recompensa_id INTEGER NOT NULL REFERENCES recompensas(id),
  desbloqueada_en TIMESTAMP DEFAULT NOW(),
  UNIQUE(usuario_id, recompensa_id)
);
CREATE INDEX idx_recompensas_desbloqueadas_usuario_id ON recompensas_desbloqueadas(usuario_id);

CREATE TABLE ejercicios_completados (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  ejercicio_id INTEGER NOT NULL REFERENCES ejercicios(id),
  completado_en TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_ejercicios_completados_usuario_id ON ejercicios_completados(usuario_id);

CREATE TABLE sesiones (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  token TEXT NOT NULL UNIQUE,
  creado_en TIMESTAMP DEFAULT NOW(),
  expira_en TIMESTAMP NOT NULL
);
CREATE INDEX idx_sesiones_usuario_id ON sesiones(usuario_id);
CREATE INDEX idx_sesiones_token ON sesiones(token);

-- ---------------------------------------------------------------------
-- Catálogos (contenido fijo de la app, no datos de usuarios)
-- ---------------------------------------------------------------------
INSERT INTO minijuegos (slug, nombre, descripcion, dificultad, puntos_recompensa, jugable) VALUES
('respiracion','Respira y Gana','Sigue el círculo y respira en 4 tiempos para soltar tensión.','facil',50,true),
('memoria','Memoria Zen','Encuentra las parejas de íconos antes de que se acabe el tiempo.','media',70,true),
('encuentra','Encuentra la Calma','Detecta los íconos tranquilos entre el ruido visual.','facil',40,true),
('laberinto','Laberinto Relax','Juego de concentración para guiar al personaje sin prisa.','dificil',100,false),
('colores','Colores Calmantes','Relajación visual combinando tonos suaves.','facil',30,false),
('sonidos','Sonidos Naturales','Juego auditivo para identificar paisajes sonoros.','media',60,false),
('ritmo','Ritmo Mental','Sigue un patrón musical relajante.','media',80,false),
('puzzle','Puzzle Tranquilo','Rompecabezas pensado para bajar revoluciones.','media',75,false),
('meditacion','Meditación Guiada','Actividad interactiva de atención plena.','facil',45,false),
('respiracion-profunda','Respiración Profunda','Variante extendida del ejercicio de respiración.','facil',55,false);

INSERT INTO ejercicios (nombre, descripcion, duracion_minutos) VALUES
('Respiración 4-7-8','Ejercicio respiratorio para soltar tensión rápido.',5),
('Relajación Muscular','Tensiona y suelta cada grupo muscular para relajar el cuerpo.',10),
('Meditación Básica','Relajación mental guiada, ideal antes de estudiar.',15),
('Visualización Positiva','Imaginación guiada hacia un lugar tranquilo.',8),
('Estiramiento','Relajación física suave para aflojar el cuerpo.',12),
('Respiración Profunda','Control emocional a través de respiraciones largas.',6),
('Mindfulness','Atención plena al momento presente.',20),
('Control de Ansiedad','Relajación emocional para momentos de presión.',9),
('Concentración Mental','Mejora la atención antes de una tarea exigente.',7),
('Pausa Activa','Descanso saludable entre sesiones de estudio.',5);

INSERT INTO musica (titulo, tipo, duracion_segundos, disponible) VALUES
('Bosque Tranquilo','Naturaleza',300,true),
('Lluvia Suave','Relajante',240,true),
('Mar Pacífico','Naturaleza',360,true),
('Piano Relax','Instrumental',420,true),
('Noche Serena','Ambiental',300,false),
('Meditación Zen','Meditación',600,false),
('Viento Calmante','Naturaleza',240,false),
('Río Relajante','Ambiental',360,false),
('Sonidos del Bosque','Naturaleza',480,false),
('Calma Interior','Meditación',540,false);

INSERT INTO recompensas (nombre, descripcion, puntos_necesarios, icono) VALUES
('Tema Azul','Nuevo tema visual',100,'🎨'),
('Fondo Relajante','Nuevo fondo de pantalla',120,'🖼️'),
('Tema Morado','Tema relajante',150,'🟣'),
('Insignia Calm','Insignia especial',180,'🎖️'),
('Avatar Zen','Avatar especial',200,'🧘'),
('Sonido Premium','Música exclusiva',250,'🎧'),
('MiniJuego Secreto','Juego oculto',300,'🗝️'),
('Perfil Dorado','Decoración premium',350,'👑'),
('Música VIP','Sonidos exclusivos',400,'🎼'),
('Nivel Maestro','Reconocimiento especial',500,'🌟');
