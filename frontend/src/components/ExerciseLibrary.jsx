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
    const [category, setCategory] = useState('Otro');
    const [selectedCategory, setSelectedCategory] = useState('Todas');

    const categories = ['Todas', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Cardio', 'Otro'];

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
            active: 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/20',
            inactive: 'bg-slate-900 text-slate-400 border-slate-800 hover:border-red-500/50 hover:bg-red-950/30 hover:text-red-400',
            badge: 'bg-red-500/10 text-red-400 border border-red-500/20',
            badgeLight: 'bg-red-500/10 text-red-400 border border-red-500/20'
        },
        'Espalda': {
            active: 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/20',
            inactive: 'bg-slate-900 text-slate-400 border-slate-800 hover:border-blue-500/50 hover:bg-blue-950/30 hover:text-blue-400',
            badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
            badgeLight: 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
        },
        'Piernas': {
            active: 'bg-green-600 text-white border-green-500 shadow-lg shadow-green-900/20',
            inactive: 'bg-slate-900 text-slate-400 border-slate-800 hover:border-green-500/50 hover:bg-green-950/30 hover:text-green-400',
            badge: 'bg-green-500/10 text-green-400 border border-green-500/20',
            badgeLight: 'bg-green-500/10 text-green-400 border border-green-500/20'
        },
        'Hombros': {
            active: 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-900/20',
            inactive: 'bg-slate-900 text-slate-400 border-slate-800 hover:border-orange-500/50 hover:bg-orange-950/30 hover:text-orange-400',
            badge: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
            badgeLight: 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
        },
        'Brazos': {
            active: 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/20',
            inactive: 'bg-slate-900 text-slate-400 border-slate-800 hover:border-purple-500/50 hover:bg-purple-950/30 hover:text-purple-400',
            badge: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
            badgeLight: 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
        },
        'Core': {
            active: 'bg-yellow-500 text-white border-yellow-400 shadow-lg shadow-yellow-900/20',
            inactive: 'bg-slate-900 text-slate-400 border-slate-800 hover:border-yellow-500/50 hover:bg-yellow-950/30 hover:text-yellow-400',
            badge: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
            badgeLight: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
        },
        'Cardio': {
            active: 'bg-pink-600 text-white border-pink-500 shadow-lg shadow-pink-900/20',
            inactive: 'bg-slate-900 text-slate-400 border-slate-800 hover:border-pink-500/50 hover:bg-pink-950/30 hover:text-pink-400',
            badge: 'bg-pink-500/10 text-pink-400 border border-pink-500/20',
            badgeLight: 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
        },
        'Otro': {
            active: 'bg-slate-600 text-white border-slate-500 shadow-lg shadow-slate-900/20',
            inactive: 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-500/50 hover:bg-slate-800 hover:text-slate-300',
            badge: 'bg-slate-700/50 text-slate-300 border border-slate-600/30',
            badgeLight: 'bg-slate-700/50 text-slate-300 border border-slate-600/30'
        },
        'Todas': {
            active: 'bg-slate-700 text-white border-slate-600 shadow-lg shadow-slate-900/20',
            inactive: 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600 hover:bg-slate-800 hover:text-slate-200',
            badge: 'bg-slate-700/50 text-slate-300',
            badgeLight: 'bg-slate-700/50 text-slate-300'
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
        let filtered = exercises;

        // Filter by category
        if (selectedCategory !== 'Todas') {
            filtered = filtered.filter(ex => ex.category === selectedCategory);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(ex =>
                ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (ex.description && ex.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredExercises(filtered);
    }, [searchTerm, exercises, selectedCategory]);

    const handleCreate = () => {
        setEditingExercise(null);
        setName('');
        setDescription('');
        setVideoUrl('');
        setCategory('Otro');
        setIsModalOpen(true);
    };

    const handleEdit = (exercise) => {
        setEditingExercise(exercise);
        setName(exercise.name);
        setDescription(exercise.description || '');
        setVideoUrl(exercise.video_url || '');
        setCategory(exercise.category || 'Otro');
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
            const exerciseData = { name, description, video_url: videoUrl, category };

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
                    <h2 className="text-3xl font-bold text-white">Biblioteca de Ejercicios</h2>
                    <p className="text-slate-400 mt-1">Administra los ejercicios disponibles para las rutinas</p>
                </div>
                <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
                    <Plus size={20} />
                    Nuevo Ejercicio
                </button>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                    const styles = getCategoryStyle(cat);
                    const isSelected = selectedCategory === cat;
                    return (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all border ${isSelected ? styles.active : styles.inactive}`}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar ejercicios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10 pr-10"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                )}
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
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${getCategoryStyle(exercise.category || 'Otro').badge}`}>
                                                        {getCategoryEmoji(exercise.category || 'Otro')}
                                                    </div>
                                                    <h3 className="font-bold text-white line-clamp-1">{exercise.name}</h3>
                                                </div>
                                                <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${getCategoryStyle(exercise.category || 'Otro').badgeLight}`}>
                                                    {exercise.category || 'Otro'}
                                                </span>
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

                                        <p className="text-sm text-slate-400 line-clamp-2 min-h-[2.5rem]">
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
                                    <label className="text-sm font-medium text-gray-700">Categoría *</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="input-field"
                                        required
                                    >
                                        {categories.filter(cat => cat !== 'Todas').map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
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
