require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

const exercises = [
    {
        name: "Press de Banca",
        description: "El press de banca con barra es un ejercicio fantástico para el crecimiento muscular de la parte superior del cuerpo. Trabaja el pecho, los deltoides frontales y los tríceps de manera efectiva, permitiendo el uso de pesos pesados para una máxima intensidad. Se realiza acostado en un banco, bajando la barra al pecho y empujándola hacia arriba."
    },
    {
        name: "Press Inclinado con Mancuernas",
        description: "Este ejercicio complementa el press de banca para un desarrollo completo del pecho, especialmente la parte superior. Proporciona un rango de movimiento completo para construir masa muscular. Se hace en un banco inclinado, presionando las mancuernas hacia arriba desde el nivel del pecho."
    },
    {
        name: "Jalón al Pecho (Lat Pulldown)",
        description: "Excelente para la espalda superior, ayuda a construir una espalda más ancha y también trabaja los bíceps. Usa un agarre ancho por encima de la cabeza en una máquina de polea. Tira la barra hacia el pecho manteniendo la forma correcta."
    },
    {
        name: "Remo con Barra",
        description: "Apunta a toda la espalda, ayudando a construir grosor y tamaño en la parte superior del cuerpo. Se realiza inclinado hacia adelante, tirando de la barra hacia el abdomen. Varía el ángulo del cuerpo para enfocarte en diferentes partes de la espalda."
    },
    {
        name: "Press Overhead (Press Militar)",
        description: "Un clásico para construir masa en los hombros. Se puede hacer con barra o mancuernas de pie o sentado, presionando el peso por encima de la cabeza. La versión con mancuernas de pie activa mejor los músculos."
    },
    {
        name: "Elevaciones Laterales con Mancuernas",
        description: "Trabaja la cabeza externa de los deltoides para hombros redondos y completos. Levanta las mancuernas hacia los lados hasta que los brazos estén horizontales, manteniendo una ligera flexión en los codos."
    },
    {
        name: "Pájaros Inversos con Mancuernas",
        description: "Enfocado en los deltoides posteriores para equilibrar los hombros y mejorar la apariencia de la espalda superior. Inclínate hacia adelante y levanta los brazos hacia los lados como si abrieras alas."
    },
    {
        name: "Extensiones de Tríceps Acostado con Barra",
        description: "Un constructor completo de masa para los tríceps, apuntando a las tres cabezas. Acostado en un banco, baja la barra hacia la frente y extiende los brazos hacia arriba para un estiramiento completo."
    },
    {
        name: "Extensiones de Tríceps Overhead con Cable",
        description: "Enfatiza la cabeza larga de los tríceps con tensión constante. Usa una máquina de cable por encima de la cabeza, extendiendo los brazos hacia abajo."
    },
    {
        name: "Curl de Bíceps con Barra",
        description: "El número uno para construir masa en los bíceps. Permite sobrecarga con pesos pesados. De pie, curla la barra hacia los hombros con forma estricta, sin balancear el cuerpo."
    },
    {
        name: "Curl Martillo",
        description: "Una variación del curl de bíceps que desarrolla la cabeza larga, antebrazos y braquial. Usa un agarre neutral (palmas enfrentadas) para añadir tamaño a los brazos superiores."
    },
    {
        name: "Sentadilla con Barra",
        description: "El mejor ejercicio general para la parte inferior del cuerpo, mejorando el rendimiento atlético y construyendo cuádriceps. Coloca los pies estrechos para un rango de movimiento extendido; baja hasta que los muslos estén paralelos al suelo."
    },
    {
        name: "Extensión de Piernas",
        description: "Aísla los cuádriceps, activando el recto femoral más que las sentadillas. En una máquina, extiende las rodillas para levantar la parte acolchada."
    },
    {
        name: "Curl de Piernas",
        description: "Aísla los isquiotibiales mediante la flexión de rodillas. Puede ser acostado o sentado; la versión sentada es ligeramente más efectiva para el crecimiento muscular con forma estricta."
    },
    {
        name: "Peso Muerto Rumano",
        description: "Fortalece la cadena posterior mediante la extensión de cadera, activando isquiotibiales y glúteos. Baja la barra manteniendo las piernas casi rectas para un rango completo."
    },
    {
        name: "Elevación de Talones de Pie",
        description: "El mejor para pantorrillas más grandes, trabajando gastrocnemio y sóleo. De pie, eleva los talones sin rebote, usando una máquina o barra."
    },
    {
        name: "Elevación de Talones Sentado",
        description: "Apunta al sóleo al debilitar el gastrocnemio. Sentado en una máquina, eleva los talones para un desarrollo equilibrado de las pantorrillas."
    },
    {
        name: "Crunch con Cable",
        description: "Permite pesos ajustables para repeticiones en rango de hipertrofia. Contrae los abdominales para doblar el torso hacia adelante en una máquina de cable."
    },
    {
        name: "Elevación de Rodillas Colgando",
        description: "Enfatiza los abdominales inferiores. Colgado de una barra, levanta las rodillas sin balanceo, usando abdominales y flexores de cadera."
    },
    {
        name: "Golpes de Leñador (Wood Chops)",
        description: "Trabaja los oblicuos para desarrollar los abdominales laterales. Usa una banda o cable en movimientos de alto a bajo o horizontales para mejorar la rotación del torso."
    }
];

async function loadExercises() {
    const client = await pool.connect();

    try {
        console.log('Conectando a la base de datos...');

        // Primero, obtener el ID del profesor (asumiendo que hay al menos uno)
        const professorResult = await client.query('SELECT id FROM professors LIMIT 1');

        if (professorResult.rows.length === 0) {
            console.error('No hay profesores en la base de datos. Crea un profesor primero.');
            return;
        }

        const professorId = professorResult.rows[0].id;
        console.log(`Usando profesor ID: ${professorId}`);

        let inserted = 0;
        let skipped = 0;

        for (const exercise of exercises) {
            // Verificar si el ejercicio ya existe
            const existingExercise = await client.query(
                'SELECT id FROM exercises WHERE name = $1 AND professor_id = $2',
                [exercise.name, professorId]
            );

            if (existingExercise.rows.length > 0) {
                console.log(`⏭️  Ejercicio ya existe: ${exercise.name}`);
                skipped++;
                continue;
            }

            // Insertar el ejercicio
            await client.query(
                'INSERT INTO exercises (name, description, professor_id) VALUES ($1, $2, $3)',
                [exercise.name, exercise.description, professorId]
            );

            console.log(`✅ Insertado: ${exercise.name}`);
            inserted++;
        }

        console.log('\n=== Resumen ===');
        console.log(`✅ Ejercicios insertados: ${inserted}`);
        console.log(`⏭️  Ejercicios omitidos (ya existían): ${skipped}`);
        console.log(`📊 Total procesados: ${exercises.length}`);

    } catch (error) {
        console.error('Error al cargar ejercicios:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

loadExercises();
