import { useState, useEffect } from 'react';
import exerciseService from '../services/exerciseService';

const RoutineForm = ({ routine, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedExercises, setSelectedExercises] = useState([]);

    // Library state
    const [availableExercises, setAvailableExercises] = useState([]);
    const [showExerciseSelector, setShowExerciseSelector] = useState(false);

    useEffect(() => {
        const loadExercises = async () => {
            try {
                const data = await exerciseService.getExercises();
                setAvailableExercises(data);
            } catch (error) {
                console.error('Error loading exercises', error);
            }
        };
        loadExercises();

        if (routine) {
            setName(routine.name);
            setDescription(routine.description || '');
            // Mapear ejercicios de la rutina al formato del estado
            // La API devuelve exercises como array de objetos con datos de la tabla routine_exercises + info del ejercicio
            setSelectedExercises(routine.exercises.map(ex => ({
                exercise_id: ex.exercise_id || ex.id, // Depende de si viene del join o raw
                name: ex.name,
                series: ex.series || '',
                repetitions: ex.repetitions || '',
                weight: ex.weight || '',
                rest_time: ex.rest_time || '',
                notes: ex.notes || ''
            })));
        }
    }, [routine]);

    const handleAddExercise = (exercise) => {
        setSelectedExercises([
            ...selectedExercises,
            {
                exercise_id: exercise.id,
                name: exercise.name,
                series: '4',
                repetitions: '10',
                weight: '',
                rest_time: '60s',
                notes: ''
            }
        ]);
        setShowExerciseSelector(false);
    };

    const handleRemoveExercise = (index) => {
        const newExercises = [...selectedExercises];
        newExercises.splice(index, 1);
        setSelectedExercises(newExercises);
    };

    const handleExerciseChange = (index, field, value) => {
        const newExercises = [...selectedExercises];
        newExercises[index][field] = value;
        setSelectedExercises(newExercises);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            name,
            description,
            exercises: selectedExercises
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-bold text-gray-800">
                        {routine ? 'Editar Rutina' : 'Nueva Rutina'}
                    </h3>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <form id="routine-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre de la Rutina</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded p-2"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-semibold text-gray-700">Ejercicios</h4>
                                <button
                                    type="button"
                                    onClick={() => setShowExerciseSelector(true)}
                                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                                >
                                    + Agregar Ejercicio
                                </button>
                            </div>

                            {selectedExercises.length === 0 ? (
                                <p className="text-gray-500 text-center py-4 border-2 border-dashed rounded">
                                    No hay ejercicios en esta rutina. Agrega uno desde la biblioteca.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {selectedExercises.map((ex, index) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded border border-gray-200 relative">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExercise(index)}
                                                className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold"
                                            >
                                                &times;
                                            </button>
                                            <h5 className="font-bold text-gray-800 mb-3">{index + 1}. {ex.name}</h5>

                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500">Series</label>
                                                    <input
                                                        type="text"
                                                        value={ex.series}
                                                        onChange={(e) => handleExerciseChange(index, 'series', e.target.value)}
                                                        className="w-full border rounded p-1 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500">Reps</label>
                                                    <input
                                                        type="text"
                                                        value={ex.repetitions}
                                                        onChange={(e) => handleExerciseChange(index, 'repetitions', e.target.value)}
                                                        className="w-full border rounded p-1 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500">Peso</label>
                                                    <input
                                                        type="text"
                                                        value={ex.weight}
                                                        onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                                                        className="w-full border rounded p-1 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500">Descanso</label>
                                                    <input
                                                        type="text"
                                                        value={ex.rest_time}
                                                        onChange={(e) => handleExerciseChange(index, 'rest_time', e.target.value)}
                                                        className="w-full border rounded p-1 text-sm"
                                                    />
                                                </div>
                                                <div className="col-span-2 md:col-span-1">
                                                    <label className="block text-xs font-medium text-gray-500">Notas</label>
                                                    <input
                                                        type="text"
                                                        value={ex.notes}
                                                        onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                                                        className="w-full border rounded p-1 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t bg-gray-50 rounded-b-lg flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="routine-form"
                        className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                        Guardar Rutina
                    </button>
                </div>
            </div>

            {/* Selector de Ejercicios Modal */}
            {showExerciseSelector && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] flex flex-col">
                        <h4 className="text-lg font-bold mb-4">Seleccionar Ejercicio</h4>
                        <div className="overflow-y-auto flex-1 space-y-2">
                            {availableExercises.map(ex => (
                                <div
                                    key={ex.id}
                                    onClick={() => handleAddExercise(ex)}
                                    className="p-3 border rounded hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                                >
                                    <span className="font-medium">{ex.name}</span>
                                    <span className="text-blue-600 text-sm">+ Agregar</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowExerciseSelector(false)}
                            className="mt-4 w-full py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoutineForm;
