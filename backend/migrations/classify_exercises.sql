-- Migration: Classify existing exercises
-- Run this script on your Neon database to update categories for the initial 20 exercises

-- Pecho
UPDATE exercises SET category = 'Pecho' WHERE name IN (
    'Press de Banca',
    'Press Inclinado con Mancuernas'
);

-- Espalda
UPDATE exercises SET category = 'Espalda' WHERE name IN (
    'Jalón al Pecho (Lat Pulldown)',
    'Remo con Barra'
);

-- Hombros
UPDATE exercises SET category = 'Hombros' WHERE name IN (
    'Press Overhead (Press Militar)',
    'Elevaciones Laterales con Mancuernas',
    'Pájaros Inversos con Mancuernas'
);

-- Brazos
UPDATE exercises SET category = 'Brazos' WHERE name IN (
    'Extensiones de Tríceps Acostado con Barra',
    'Extensiones de Tríceps Overhead con Cable',
    'Curl de Bíceps con Barra',
    'Curl Martillo'
);

-- Piernas
UPDATE exercises SET category = 'Piernas' WHERE name IN (
    'Sentadilla con Barra',
    'Extensión de Piernas',
    'Curl de Piernas',
    'Peso Muerto Rumano',
    'Elevación de Talones de Pie',
    'Elevación de Talones Sentado'
);

-- Core
UPDATE exercises SET category = 'Core' WHERE name IN (
    'Crunch con Cable',
    'Elevación de Rodillas Colgando',
    'Golpes de Leñador (Wood Chops)'
);

-- Verify updates
SELECT category, COUNT(*) FROM exercises GROUP BY category;
