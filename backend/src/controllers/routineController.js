const db = require('../config/db');

const getMyRoutines = async (req, res) => {
    try {
        // Obtener rutinas con información del estudiante y ejercicios
        const routinesResult = await db.query(
            `SELECT r.*, s.name as student_name
             FROM routines r
             LEFT JOIN student_routines sr ON r.id = sr.routine_id
             LEFT JOIN students s ON sr.student_id = s.id
             WHERE r.professor_id = $1
             ORDER BY r.created_at DESC`,
            [req.user.id]
        );

        // Para cada rutina, obtener sus ejercicios
        const routinesWithExercises = await Promise.all(
            routinesResult.rows.map(async (routine) => {
                const exercisesResult = await db.query(
                    `SELECT re.*, e.name as exercise_name
                     FROM routine_exercises re
                     JOIN exercises e ON re.exercise_id = e.id
                     WHERE re.routine_id = $1
                     ORDER BY re.order_index ASC`,
                    [routine.id]
                );
                return {
                    ...routine,
                    exercises: exercisesResult.rows
                };
            })
        );

        res.json(routinesWithExercises);
    } catch (error) {
        console.error('Error al obtener rutinas:', error);
        res.status(500).json({ message: 'Error al obtener rutinas' });
    }
};

const getRoutineById = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Obtener rutina
        const routineResult = await db.query(
            'SELECT * FROM routines WHERE id = $1 AND professor_id = $2',
            [id, req.user.id]
        );

        if (routineResult.rows.length === 0) {
            return res.status(404).json({ message: 'Rutina no encontrada' });
        }

        const routine = routineResult.rows[0];

        // 2. Obtener ejercicios de la rutina
        const exercisesResult = await db.query(
            `SELECT re.*, e.name, e.video_url, e.description as exercise_description
             FROM routine_exercises re
             JOIN exercises e ON re.exercise_id = e.id
             WHERE re.routine_id = $1
             ORDER BY re.order_index ASC`,
            [id]
        );

        res.json({ ...routine, exercises: exercisesResult.rows });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener rutina' });
    }
};

const createRoutine = async (req, res) => {
    const { student_id, exercises } = req.body;
    // exercises debe ser un array de objetos: { exercise_id, sets, reps, weight }

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // Verificar que el alumno pertenece al profesor
        const studentCheck = await client.query(
            'SELECT id, name FROM students WHERE id = $1 AND professor_id = $2',
            [student_id, req.user.id]
        );

        if (studentCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Alumno no encontrado' });
        }

        const studentName = studentCheck.rows[0].name;

        // 1. Crear Rutina con nombre automático basado en el alumno
        const routineName = `Rutina de ${studentName}`;
        const routineResult = await client.query(
            'INSERT INTO routines (professor_id, name, description) VALUES ($1, $2, $3) RETURNING *',
            [req.user.id, routineName, `Rutina personalizada para ${studentName}`]
        );
        const routine = routineResult.rows[0];

        // 2. Insertar Ejercicios
        if (exercises && exercises.length > 0) {
            for (let i = 0; i < exercises.length; i++) {
                const ex = exercises[i];
                await client.query(
                    `INSERT INTO routine_exercises 
                    (routine_id, exercise_id, order_index, series, repetitions, weight, rest_time, notes) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [
                        routine.id,
                        ex.exercise_id,
                        i,
                        ex.sets || ex.series || 3,
                        ex.reps || ex.repetitions || '10',
                        ex.weight || null,
                        ex.rest_time || null,
                        ex.notes || null
                    ]
                );
            }
        }

        // 3. Asignar automáticamente la rutina al alumno
        await client.query(
            'INSERT INTO student_routines (student_id, routine_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [student_id, routine.id]
        );

        await client.query('COMMIT');

        // Devolver la rutina con información del estudiante
        res.status(201).json({
            ...routine,
            student_name: studentName,
            exercises: exercises
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al crear rutina:', error);
        res.status(500).json({ message: 'Error al crear rutina', error: error.message });
    } finally {
        client.release();
    }
};

const updateRoutine = async (req, res) => {
    const { id } = req.params;
    const { name, description, exercises } = req.body;

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Verificar propiedad y actualizar Rutina
        const routineResult = await client.query(
            'UPDATE routines SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND professor_id = $4 RETURNING id',
            [name, description, id, req.user.id]
        );

        if (routineResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Rutina no encontrada' });
        }

        // 2. Actualizar ejercicios (Estrategia simple: Borrar todos y reinsertar)
        // Esto simplifica el manejo de orden y cambios.
        await client.query('DELETE FROM routine_exercises WHERE routine_id = $1', [id]);

        if (exercises && exercises.length > 0) {
            for (let i = 0; i < exercises.length; i++) {
                const ex = exercises[i];
                await client.query(
                    `INSERT INTO routine_exercises 
                    (routine_id, exercise_id, order_index, series, repetitions, weight, rest_time, notes) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [id, ex.exercise_id, i, ex.series, ex.repetitions, ex.weight, ex.rest_time, ex.notes]
                );
            }
        }

        await client.query('COMMIT');
        res.json({ message: 'Rutina actualizada' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar rutina' });
    } finally {
        client.release();
    }
};

const deleteRoutine = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            'DELETE FROM routines WHERE id = $1 AND professor_id = $2 RETURNING id',
            [id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Rutina no encontrada' });
        }
        res.json({ message: 'Rutina eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar rutina' });
    }
};

const assignRoutine = async (req, res) => {
    const { id } = req.params; // Routine ID
    const { student_id } = req.body;

    try {
        // Verificar que la rutina pertenece al profesor
        const routineCheck = await db.query('SELECT id FROM routines WHERE id = $1 AND professor_id = $2', [id, req.user.id]);
        if (routineCheck.rows.length === 0) return res.status(404).json({ message: 'Rutina no encontrada' });

        // Verificar que el alumno pertenece al profesor
        const studentCheck = await db.query('SELECT id FROM students WHERE id = $1 AND professor_id = $2', [student_id, req.user.id]);
        if (studentCheck.rows.length === 0) return res.status(404).json({ message: 'Alumno no encontrado' });

        // Asignar (Insertar o ignorar si ya existe - ON CONFLICT DO NOTHING si tuvieramos constraint unique compuesta, que la tenemos en PK)
        // La PK es (student_id, routine_id), asi que si intentamos insertar duplicado fallará.
        // Usaremos INSERT ... ON CONFLICT DO NOTHING
        await db.query(
            'INSERT INTO student_routines (student_id, routine_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [student_id, id]
        );

        res.json({ message: 'Rutina asignada exitosamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al asignar rutina' });
    }
};

module.exports = {
    getMyRoutines,
    getRoutineById,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    assignRoutine
};
