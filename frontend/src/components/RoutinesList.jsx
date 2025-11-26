import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ClipboardList, Trash2, ChevronDown, ChevronUp, Dumbbell, Calendar, User, Save, X, Download } from 'lucide-react';
import routineService from '../services/routineService';
import studentService from '../services/studentService';
import exerciseService from '../services/exerciseService';
import pdfService from '../services/pdfService';
import { useToast, ToastContainer } from '../hooks/useToast';

const RoutinesList = () => {
    const [routines, setRoutines] = useState([]);
    const [students, setStudents] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedRoutine, setExpandedRoutine] = useState(null);
    const { toasts, success, error } = useToast();

    const getCategoryColor = (cat) => {
        const colors = {
            'Pecho': 'red',
            'Espalda': 'blue',
            'Piernas': 'green',
            'Hombros': 'orange',
            'Brazos': 'purple',
            'Core': 'yellow',
            'Cardio': 'pink',
            'Otro': 'gray',
            'Todas': 'gray'
        };
        return colors[cat] || 'gray';
    };

    const categoryStyles = {
        'Pecho': {
            badge: 'bg-red-100 text-red-600',
            badgeLight: 'bg-red-50 text-red-600'
        },
        'Espalda': {
            badge: 'bg-blue-100 text-blue-600',
            badgeLight: 'bg-blue-50 text-blue-600'
        },
        'Piernas': {
            badge: 'bg-green-100 text-green-600',
            badgeLight: 'bg-green-50 text-green-600'
        },
        'Hombros': {
            badge: 'bg-orange-100 text-orange-600',
            badgeLight: 'bg-orange-50 text-orange-600'
        },
        'Brazos': {
            badge: 'bg-purple-100 text-purple-600',
            badgeLight: 'bg-purple-50 text-purple-600'
        },
        'Core': {
            badge: 'bg-yellow-100 text-yellow-700',
            badgeLight: 'bg-yellow-50 text-yellow-700'
        },
        'Cardio': {
            badge: 'bg-pink-100 text-pink-600',
            badgeLight: 'bg-pink-50 text-pink-600'
        },
        'Otro': {
            badge: 'bg-gray-100 text-gray-600',
            badgeLight: 'bg-gray-50 text-gray-600'
        },
        'Todas': {
            badge: 'bg-gray-100 text-gray-600',
            badgeLight: 'bg-gray-50 text-gray-600'
        }
    };

    const getCategoryStyle = (cat) => categoryStyles[cat] || categoryStyles['Otro'];

    const getCategoryEmoji = (cat) => {
        const emojis = {
            'Pecho': '🏋️',
            'Espalda': '🔙',
            'Piernas': '🦵',
            'Hombros': '💪',
            'Brazos': '💪',
            'Core': '⚡',
            'Cardio': '🏃',
            'Otro': '📋',
            'Todas': '📋'
        };
        return emojis[cat] || '📋';
    };

    // Form State
    const [routineName, setRoutineName] = useState('');
    const [routineDescription, setRoutineDescription] = useState('');
    const [routineExercises, setRoutineExercises] = useState([{ exercise_id: '', sets: '', reps: '', weight: '' }]);

    const fetchData = async () => {
        try {
            const [routinesData, studentsData, exercisesData] = await Promise.all([
                routineService.getRoutines(),
                studentService.getStudents(),
                exerciseService.getExercises()
            ]);
            setRoutines(routinesData);
            setStudents(studentsData);
            setExercises(exercisesData);
        } catch (err) {
            console.error('Error al cargar datos:', err);
            error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddExerciseRow = () => {
        setRoutineExercises([...routineExercises, { exercise_id: '', sets: '', reps: '', weight: '' }]);
    };

    const handleRemoveExerciseRow = (index) => {
        const newExercises = routineExercises.filter((_, i) => i !== index);
        setRoutineExercises(newExercises);
    };

    const handleExerciseChange = (index, field, value) => {
        const newExercises = [...routineExercises];
        newExercises[index][field] = value;
        setRoutineExercises(newExercises);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const routineData = {
                name: routineName,
                description: routineDescription,
                exercises: routineExercises
            };
            const created = await routineService.createRoutine(routineData);

            // Construir el objeto de rutina con los ejercicios poblados
            const exercisesWithNames = routineExercises
                .filter(ex => ex.exercise_id) // Filtrar ejercicios vacíos
                .map((ex, index) => {
                    const exercise = exercises.find(e => e.id === parseInt(ex.exercise_id));
                    return {
                        exercise_id: ex.exercise_id,
                        exercise_name: exercise?.name || 'Ejercicio desconocido',
                        series: ex.sets,
                        repetitions: ex.reps,
                        weight: ex.weight,
                        order_index: index
                    };
                });

            const routineWithExercises = {
                ...created,
                exercises: exercisesWithNames
            };

            setRoutines([routineWithExercises, ...routines]);
            success('Rutina creada exitosamente');
            setIsModalOpen(false);
            setRoutineName('');
            setRoutineDescription('');
            setRoutineExercises([{ exercise_id: '', sets: '', reps: '', weight: '' }]);
        } catch (err) {
            console.error('Error al crear rutina:', err);
            error('Error al crear rutina');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar esta rutina?')) {
            try {
                await routineService.deleteRoutine(id);
                setRoutines(routines.filter(r => r.id !== id));
                success('Rutina eliminada exitosamente');
            } catch (err) {
                console.error('Error al eliminar:', err);
                error('Error al eliminar rutina');
            }
        }
    };

    const toggleExpand = (id) => {
        setExpandedRoutine(expandedRoutine === id ? null : id);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ToastContainer toasts={toasts} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Gestión de Rutinas</h2>
                    <p className="text-gray-500 mt-1">Asigna y administra las rutinas de tus alumnos</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    Nueva Rutina
                </button>
            </div>

            {routines.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
                >
                    <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ClipboardList size={40} className="text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No hay rutinas creadas</h3>
                    <p className="mt-2 text-gray-500">Crea la primera rutina para comenzar a entrenar a tus alumnos.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-6 btn-primary inline-flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Crear Primera Rutina
                    </button>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {routines.map((routine) => (
                            <motion.div
                                key={routine.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="card overflow-hidden"
                            >
                                <div
                                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => toggleExpand(routine.id)}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                                            <ClipboardList size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-900 text-lg">{routine.name || 'Rutina sin nombre'}</h3>
                                                {routine.student_name && (
                                                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                                        <User size={12} />
                                                        {routine.student_name}
                                                    </span>
                                                )}
                                            </div>
                                            {routine.description && (
                                                <p className="text-sm text-gray-500 line-clamp-1">{routine.description}</p>
                                            )}
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                                    <Calendar size={12} />
                                                    {new Date(routine.created_at).toLocaleDateString()}
                                                </div>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs text-gray-500 font-medium">
                                                    {routine.exercises ? routine.exercises.length : 0} ejercicios
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); pdfService.generateRoutinePDF(routine); }}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Descargar PDF"
                                        >
                                            <Download size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(routine.id); }}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        {expandedRoutine === routine.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedRoutine === routine.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-gray-100 bg-gray-50/50"
                                        >
                                            <div className="p-5">
                                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Detalle de Ejercicios</h4>
                                                <div className="grid gap-3">
                                                    {routine.exercises && routine.exercises.map((ex, idx) => (
                                                        <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-2 rounded-lg text-lg ${getCategoryStyle(ex.category || 'Otro').badgeLight}`}>
                                                                    {getCategoryEmoji(ex.category || 'Otro')}
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium text-gray-900 block">{ex.exercise_name}</span>
                                                                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${getCategoryStyle(ex.category || 'Otro').badgeLight}`}>
                                                                        {ex.category || 'Otro'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-4 text-sm text-gray-600">
                                                                <span className="bg-gray-100 px-2 py-1 rounded-md"><b>{ex.series}</b> series</span>
                                                                <span className="bg-gray-100 px-2 py-1 rounded-md"><b>{ex.repetitions}</b> reps</span>
                                                                {ex.weight && <span className="bg-gray-100 px-2 py-1 rounded-md"><b>{ex.weight}</b> kg</span>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
                                <h3 className="text-xl font-bold text-gray-900">Nueva Rutina</h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <ClipboardList size={16} /> Nombre de la Rutina *
                                        </label>
                                        <input
                                            type="text"
                                            value={routineName}
                                            onChange={(e) => setRoutineName(e.target.value)}
                                            className="input-field"
                                            placeholder="Ej: Rutina de Fuerza"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">
                                            Descripción (Opcional)
                                        </label>
                                        <textarea
                                            value={routineDescription}
                                            onChange={(e) => setRoutineDescription(e.target.value)}
                                            className="input-field resize-none"
                                            rows="2"
                                            placeholder="Descripción de la rutina..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <Dumbbell size={16} /> Ejercicios
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleAddExerciseRow}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                        >
                                            <Plus size={16} /> Agregar Ejercicio
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {routineExercises.map((row, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-gray-50 p-3 rounded-xl border border-gray-100"
                                            >
                                                <select
                                                    value={row.exercise_id}
                                                    onChange={(e) => handleExerciseChange(index, 'exercise_id', e.target.value)}
                                                    className="input-field flex-grow"
                                                    required
                                                >
                                                    <option value="">Seleccionar ejercicio...</option>
                                                    {['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Cardio', 'Otro'].map(category => {
                                                        const categoryExercises = exercises.filter(e => (e.category || 'Otro') === category);
                                                        if (categoryExercises.length === 0) return null;
                                                        return (
                                                            <optgroup key={category} label={category}>
                                                                {categoryExercises.map(ex => (
                                                                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                                                                ))}
                                                            </optgroup>
                                                        );
                                                    })}
                                                </select>

                                                <div className="flex gap-2 w-full sm:w-auto">
                                                    <input
                                                        type="number"
                                                        placeholder="Series"
                                                        value={row.sets}
                                                        onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                                                        className="input-field w-20"
                                                        required
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Reps"
                                                        value={row.reps}
                                                        onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                                                        className="input-field w-20"
                                                        required
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Kg"
                                                        value={row.weight}
                                                        onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                                                        className="input-field w-20"
                                                    />
                                                    {routineExercises.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveExerciseRow(index)}
                                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="btn-secondary"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary flex items-center gap-2"
                                    >
                                        <Save size={18} />
                                        Guardar Rutina
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div >
                )}
            </AnimatePresence >
        </div >
    );
};

export default RoutinesList;
