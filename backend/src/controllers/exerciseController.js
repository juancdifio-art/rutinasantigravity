const db = require('../config/db');

const getMyExercises = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM exercises WHERE professor_id = $1 ORDER BY name ASC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener ejercicios' });
    }
};

const createExercise = async (req, res) => {
    const { name, video_url, description, category } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO exercises (professor_id, name, video_url, description, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.user.id, name, video_url, description, category || 'Otro']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear ejercicio' });
    }
};

const updateExercise = async (req, res) => {
    const { id } = req.params;
    const { name, video_url, description, category } = req.body;
    try {
        const result = await db.query(
            'UPDATE exercises SET name = $1, video_url = $2, description = $3, category = $4 WHERE id = $5 AND professor_id = $6 RETURNING *',
            [name, video_url, description, category || 'Otro', id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Ejercicio no encontrado o no autorizado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar ejercicio' });
    }
};

const deleteExercise = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            'DELETE FROM exercises WHERE id = $1 AND professor_id = $2 RETURNING id',
            [id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Ejercicio no encontrado o no autorizado' });
        }
        res.json({ message: 'Ejercicio eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar ejercicio' });
    }
};

module.exports = {
    getMyExercises,
    createExercise,
    updateExercise,
    deleteExercise
};
