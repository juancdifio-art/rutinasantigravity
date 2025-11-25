const express = require('express');
const router = express.Router();
const {
    getStudentRoutineByLink,
    getMyStudents,
    createStudent,
    updateStudent,
    deleteStudent
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

// Ruta pública
router.get('/:public_share_id/routine', getStudentRoutineByLink);

// Rutas protegidas (CRUD Alumnos)
router.get('/', protect, getMyStudents);
router.post('/', protect, createStudent);
router.put('/:id', protect, updateStudent);
router.delete('/:id', protect, deleteStudent);

module.exports = router;
