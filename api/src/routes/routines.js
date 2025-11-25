const express = require('express');
const router = express.Router();
const {
    getMyRoutines,
    getRoutineById,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    assignRoutine
} = require('../controllers/routineController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getMyRoutines);
router.get('/:id', getRoutineById);
router.post('/', createRoutine);
router.put('/:id', updateRoutine);
router.delete('/:id', deleteRoutine);
router.post('/:id/assign', assignRoutine);

module.exports = router;
