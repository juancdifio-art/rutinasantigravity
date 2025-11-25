const db = require('../config/db');

// Obtener rutina pública (sin auth)
const getStudentRoutineByLink = async (req, res) => {
    const { public_share_id } = req.params;

    try {
        const studentResult = await db.query(
            'SELECT id, name, professor_id FROM students WHERE public_share_id = $1',
            [public_share_id]
        );

        if (studentResult.rows.length === 0) {
            return res.status(404).json({ message: 'Enlace inválido o alumno no encontrado' });
        }

        const student = studentResult.rows[0];

        const routinesResult = await db.query(
            `SELECT r.id, r.name, r.description 
       FROM routines r
       JOIN student_routines sr ON r.id = sr.routine_id
       WHERE sr.student_id = $1`,
            [student.id]
        );

        const routines = routinesResult.rows;

        const routinesWithExercises = await Promise.all(routines.map(async (routine) => {
            const exercisesResult = await db.query(
                `SELECT e.name, e.video_url, e.description, re.series, re.repetitions, re.weight, re.rest_time, re.notes, re.order_index
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
        }));

        res.json({
            student: { name: student.name },
            routines: routinesWithExercises
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener la rutina' });
    }
};

// --- CRUD Protegido para Profesores ---

const getMyStudents = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM students WHERE professor_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener alumnos' });
    }
};

const createStudent = async (req, res) => {
    const { name, email, phone } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO students (professor_id, name, email, phone) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.user.id, name, email, phone]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear alumno' });
    }
};

const updateStudent = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    try {
        const result = await db.query(
            'UPDATE students SET name = $1, email = $2, phone = $3 WHERE id = $4 AND professor_id = $5 RETURNING *',
            [name, email, phone, id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Alumno no encontrado o no autorizado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar alumno' });
    }
};

const deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            'DELETE FROM students WHERE id = $1 AND professor_id = $2 RETURNING id',
            [id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Alumno no encontrado o no autorizado' });
        }
        res.json({ message: 'Alumno eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar alumno' });
    }
};

module.exports = {
    getStudentRoutineByLink,
    getMyStudents,
    createStudent,
    updateStudent,
    deleteStudent
};
