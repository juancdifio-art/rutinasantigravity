import { useState, useEffect } from 'react';
import exerciseService from '../services/exerciseService';
import { useToast, ToastContainer } from '../hooks/useToast';

const ExerciseLibrary = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExercise, setEditingExercise] = useState(null);
    const { toasts, success, error } = useToast();

    // Form State
    const [name, setName] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [description, setDescription] = useState('');

    const fetchExercises = async () => {
        try {
            const data = await exerciseService.getExercises();
            setExercises(data);
        } catch (err) {
            console.error('Error al cargar ejercicios:', err);
            error('Error al cargar ejercicios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExercises();
    }, []);

    const openModal = (exercise = null) => {
        if (exercise) {
            setEditingExercise(exercise);
            setName(exercise.name);
            setVideoUrl(exercise.video_url || '');
            setDescription(exercise.description || '');
        } else {
            setEditingExercise(null);
            setName('');
            setVideoUrl('');
            setDescription('');
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const exerciseData = { name, video_url: videoUrl, description };
            if (editingExercise) {
                const updated = await exerciseService.updateExercise(editingExercise.id, exerciseData);
                setExercises(exercises.map(ex => ex.id === updated.id ? updated : ex));
                success('Ejercicio actualizado exitosamente');
            } else {
                const created = await exerciseService.createExercise(exerciseData);
                setExercises(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
                success('Ejercicio creado exitosamente');
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error('Error al guardar ejercicio:', err);
            error('Error al guardar ejercicio');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar ejercicio?')) {
            try {
                await exerciseService.deleteExercise(id);
                setExercises(exercises.filter(ex => ex.id !== id));
                success('Ejercicio eliminado exitosamente');
            } catch (err) {
                console.error('Error al eliminar:', err);
                error('Error al eliminar ejercicio');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando ejercicios...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <ToastContainer toasts={toasts} />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Biblioteca de Ejercicios</h2>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Nuevo Ejercicio
                </button>
            </div>

            {exercises.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow">
                    <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No hay ejercicios en la biblioteca</h3>
                    <p className="mt-2 text-sm text-gray-500">Crea ejercicios para poder armar rutinas personalizadas.</p>
                    <button
                        onClick={() => openModal()}
                        className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        + Crear Primer Ejercicio
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {exercises.map((exercise) => (
                        <div key={exercise.id} className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-md transition">
                            <h3 className="font-bold text-lg text-gray-800 mb-2">{exercise.name}</h3>
                            {exercise.video_url && (
                                <a
                                    href={exercise.video_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 text-sm hover:underline block mb-2"
                                >
                                    Ver Video
                                </a>
                            )}
                            {exercise.description && (
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{exercise.description}</p>
                            )}

                            <div className="flex justify-end gap-2 mt-auto">
                                <button
                                    onClick={() => openModal(exercise)}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(exercise.id)}
                                    className="text-sm text-red-600 hover:text-red-800"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">
                            {editingExercise ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Video URL (Youtube/Vimeo)</label>
                                <input
                                    type="url"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded p-2"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded p-2"
                                    rows="3"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExerciseLibrary;
