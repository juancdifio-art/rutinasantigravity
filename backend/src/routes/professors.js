const express = require('express');
const router = express.Router();
const { getAllProfessors, getProfessorById, updateProfessor, deleteProfessor } = require('../controllers/professorController');

// TODO: Agregar middleware de autenticación para proteger rutas de modificación
router.get('/', getAllProfessors);
router.get('/:id', getProfessorById);
router.put('/:id', updateProfessor);
router.delete('/:id', deleteProfessor);

module.exports = router;
