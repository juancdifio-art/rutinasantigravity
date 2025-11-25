const express = require('express');
const router = express.Router();
const {
    getMyExercises,
    createExercise,
    updateExercise,
    deleteExercise
} = require('../controllers/exerciseController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Proteger todas las rutas

router.get('/', getMyExercises);
router.post('/', createExercise);
router.put('/:id', updateExercise);
router.delete('/:id', deleteExercise);

module.exports = router;
