-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de Profesores
CREATE TABLE professors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Alumnos
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    professor_id INTEGER REFERENCES professors(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(50),
    public_share_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Rutinas
CREATE TABLE routines (
    id SERIAL PRIMARY KEY,
    professor_id INTEGER REFERENCES professors(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Asignación de Rutinas a Alumnos
CREATE TABLE student_routines (
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    routine_id INTEGER REFERENCES routines(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, routine_id)
);

-- Tabla de Ejercicios (Catálogo global o por profesor? Asumiremos por profesor para personalización, o global. 
-- El prompt dice "Los profesores pueden crear... rutinas. Cada rutina contiene ejercicios...".
-- A menudo los ejercicios son entidades separadas reutilizables. Haremos que pertenezcan a una rutina directamente para simplificar, 
-- O mejor, una tabla de ejercicios que pertenecen a una rutina (1 a N) como items de la rutina.
-- "Cada rutina contiene ejercicios, series, repeticiones...".
-- Voy a crear una tabla `routine_exercises` que define el ejercicio dentro de la rutina.
-- Y una tabla `exercises` para el nombre/descripción si se quiere reutilizar, pero el prompt es simple.
-- Haré `exercises` como catálogo y `routine_exercises` como la instancia en la rutina.

CREATE TABLE exercises (
    id SERIAL PRIMARY KEY,
    professor_id INTEGER REFERENCES professors(id) ON DELETE CASCADE, -- Ejercicios creados por el profe
    name VARCHAR(150) NOT NULL,
    video_url VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE routine_exercises (
    id SERIAL PRIMARY KEY,
    routine_id INTEGER REFERENCES routines(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL, -- Para ordenar los ejercicios en la rutina
    series VARCHAR(50),
    repetitions VARCHAR(50),
    weight VARCHAR(50),
    rest_time VARCHAR(50),
    notes TEXT
);

-- Índices para mejorar performance
CREATE INDEX idx_students_professor_id ON students(professor_id);
CREATE INDEX idx_students_public_share_id ON students(public_share_id);
CREATE INDEX idx_routines_professor_id ON routines(professor_id);
CREATE INDEX idx_routine_exercises_routine_id ON routine_exercises(routine_id);
