import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Video, Dumbbell, X, Save } from 'lucide-react';
import exerciseService from '../services/exerciseService';
import { useToast, ToastContainer } from '../hooks/useToast';

const ExerciseLibrary = () => {
    const [exercises, setExercises] = useState([]);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExercise, setEditingExercise] = useState(null);

    // Form states
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [videoUrl, setVideoUrl] = useState('');

    const { toasts, success, error } = useToast();

    const fetchExercises = async () => {
        try {
            const data = await exerciseService.getExercises();
            setExercises(data);
            setFilteredExercises(data);
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

    useEffect(() => {
        const filtered = exercises.filter(ex =>
            ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ex.description && ex.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredExercises(filtered);
    }, [searchTerm, exercises]);

    const handleCreate = () => {
        setEditingExercise(null);
        setName('');
        setDescription('');
        setVideoUrl('');
        setIsModalOpen(true);
    };

    const handleEdit = (exercise) => {
        setEditingExercise(exercise);
        setName(exercise.name);
        setDescription(exercise.description || '');
        setVideoUrl(exercise.video_url || '');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este ejercicio?')) {
            try {
                await exerciseService.deleteExercise(id);
                setExercises(exercises.filter(e => e.id !== id));
                success('Ejercicio eliminado exitosamente');
            } catch (err) {
                console.error('Error al eliminar:', err);
                error('Error al eliminar ejercicio');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const exerciseData = { name, description, video_url: videoUrl };

            if (editingExercise) {
                const updated = await exerciseService.updateExercise(editingExercise.id, exerciseData);
                setExercises(exercises.map(e => e.id === updated.id ? updated : e));
                success('Ejercicio actualizado exitosamente');
            } else {
                const created = await exerciseService.createExercise(exerciseData);
                setExercises([created, ...exercises]);
                success('Ejercicio creado exitosamente');
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error('Error al guardar:', err);
            error('Error al guardar ejercicio');
        }
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
                    <h2 className="text-3xl font-bold text-gray-900">Biblioteca de Ejercicios</h2>
                    <p className="text-gray-500 mt-1">Administra los ejercicios disponibles para las rutinas</p>
                </div>
                <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
                    <Plus size={20} />
                    Nuevo Ejercicio
                </button>
            </div>

            {exercises.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
                >
                    <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Dumbbell size={40} className="text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No hay ejercicios en la biblioteca</h3>
                    <p className="mt-2 text-gray-500">Agrega ejercicios para poder usarlos en las rutinas de tus alumnos.</p>
                    <button onClick={handleCreate} className="mt-6 btn-primary inline-flex items-center gap-2">
                        <Plus size={20} />
                        Crear Primer Ejercicio
                    </button>
                </motion.div>
            ) : (
                <>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar ejercicio..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {filteredExercises.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No se encontraron ejercicios con esa búsqueda.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AnimatePresence>
                                {filteredExercises.map((exercise) => (
                                    <motion.div
                                        key={exercise.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="card p-5 flex flex-col gap-3 group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                                                    <Dumbbell size={20} />
                                                </div>
                                                <h3 className="font-bold text-gray-900 line-clamp-1">{exercise.name}</h3>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(exercise)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(exercise.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
                                            {exercise.description || 'Sin descripción'}
                                        </p>

                                        {exercise.video_url && (
                                            <a
                                                href={exercise.video_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-auto flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium p-2 bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Video size={16} />
                                                Ver Video
                                            </a>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </>
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
                            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {editingExercise ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Nombre *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="input-field"
                                        required
                                        placeholder="Ej: Press de Banca"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Descripción</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="input-field min-h-[100px] py-3 resize-none"
                                        placeholder="Describe la técnica correcta..."
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Video size={16} /> URL del Video (Opcional)
                                    </label>
                                    <input
                                        type="url"
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                        className="input-field"
                                        placeholder="https://youtube.com/..."
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
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
                                        Guardar
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExerciseLibrary;
