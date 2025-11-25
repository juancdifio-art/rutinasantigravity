import { useState, useEffect } from 'react';
import routineService from '../services/routineService';
import studentService from '../services/studentService';
import RoutineForm from './RoutineForm';

const RoutinesList = () => {
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoutine, setEditingRoutine] = useState(null);

    // Assign Modal State
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedRoutineId, setSelectedRoutineId] = useState(null);
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');

    const fetchRoutines = async () => {
        try {
            const data = await routineService.getRoutines();
            setRoutines(data);
        } catch (error) {
            console.error('Error al cargar rutinas:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutines();
    }, []);

    const handleCreate = () => {
        setEditingRoutine(null);
        setIsModalOpen(true);
    };

    const handleEdit = async (id) => {
        try {
            // Necesitamos cargar los detalles completos (ejercicios) antes de editar
            const fullRoutine = await routineService.getRoutineById(id);
            setEditingRoutine(fullRoutine);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error al cargar detalles de rutina', error);
            alert('Error al cargar rutina');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar rutina?')) {
            try {
                await routineService.deleteRoutine(id);
                setRoutines(routines.filter(r => r.id !== id));
            } catch (error) {
                console.error('Error al eliminar:', error);
            }
        }
    };

    const handleSave = async (routineData) => {
        try {
            if (editingRoutine) {
                await routineService.updateRoutine(editingRoutine.id, routineData);
                // Recargar lista para actualizar conteos o datos simples
                fetchRoutines();
            } else {
                await routineService.createRoutine(routineData);
                fetchRoutines();
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar la rutina');
        }
    };

    // Assignment Logic
    const openAssignModal = async (routineId) => {
        setSelectedRoutineId(routineId);
        try {
            const studentsData = await studentService.getStudents();
            setStudents(studentsData);
            if (studentsData.length > 0) setSelectedStudentId(studentsData[0].id);
            setAssignModalOpen(true);
        } catch (error) {
            console.error('Error al cargar alumnos', error);
        }
    };

    const handleAssign = async () => {
        try {
            await routineService.assignRoutine(selectedRoutineId, selectedStudentId);
            alert('Rutina asignada exitosamente');
            setAssignModalOpen(false);
        } catch (error) {
            console.error('Error al asignar', error);
            alert('Error al asignar rutina');
        }
    };

    if (loading) return <div className="p-4">Cargando rutinas...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Mis Rutinas</h2>
                <button
                    onClick={handleCreate}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Nueva Rutina
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routines.map((routine) => (
                    <div key={routine.id} className="bg-white rounded-lg shadow border border-gray-200 flex flex-col">
                        <div className="p-5 flex-1">
                            <h3 className="font-bold text-xl text-gray-800 mb-2">{routine.name}</h3>
                            <p className="text-gray-600 text-sm mb-4">{routine.description || 'Sin descripción'}</p>
                            <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded inline-block">
                                {routine.exercise_count} Ejercicios
                            </div>
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex justify-between items-center rounded-b-lg">
                            <button
                                onClick={() => openAssignModal(routine.id)}
                                className="text-sm font-medium text-green-600 hover:text-green-800"
                            >
                                Asignar a Alumno
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleEdit(routine.id)}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(routine.id)}
                                    className="text-sm text-red-600 hover:text-red-800"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <RoutineForm
                    routine={editingRoutine}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}

            {/* Assign Modal */}
            {assignModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold mb-4">Asignar Rutina</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Alumno</label>
                            <select
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2"
                            >
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setAssignModalOpen(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAssign}
                                className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
                            >
                                Asignar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoutinesList;
