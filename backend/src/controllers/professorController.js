const db = require('../config/db');

// Obtener todos los profesores (solo para admin o debug, o quizás no se necesite expuesto públicamente)
// El prompt pide "/professors (CRUD básico)". Asumiremos que es para gestión interna o listado.
// Pero normalmente un profesor solo se gestiona a sí mismo.
// Haremos un CRUD básico genérico por ahora.

const getAllProfessors = async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, email FROM professors');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener profesores' });
    }
};

const getProfessorById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT id, name, email FROM professors WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Profesor no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener profesor' });
    }
};

// Update y Delete se harían similarmente, verificando que sea el propio profesor quien se edita (middleware de auth necesario).
// Por simplicidad inicial:

const updateProfessor = async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    try {
        const result = await db.query(
            'UPDATE professors SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email',
            [name, email, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Profesor no encontrado' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar' });
    }
};

const deleteProfessor = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM professors WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Profesor no encontrado' });
        res.json({ message: 'Profesor eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar' });
    }
};

module.exports = {
    getAllProfessors,
    getProfessorById,
    updateProfessor,
    deleteProfessor
};
