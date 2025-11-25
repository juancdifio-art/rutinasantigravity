import { useState, useEffect } from 'react';
import routineService from '../services/routineService';
import studentService from '../services/studentService';
import RoutineForm from './RoutineForm';
import { useToast, ToastContainer } from '../hooks/useToast';

const RoutinesList = () => {
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoutine, setEditingRoutine] = useState(null);
    const { toasts, success, error } = useToast();

    // Assign Modal State
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedRoutineId, setSelectedRoutineId] = useState(null);
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');

    const fetchRoutines = async () => {
        try {
            const data = await routineService.getRoutines();
            setRoutines(data);
        } catch (err) {
            console.error('Error al cargar rutinas:', err);
            error('Error al cargar rutinas');
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
            const fullRoutine = await routineService.getRoutineById(id);
            setEditingRoutine(fullRoutine);
            setIsModalOpen(true);
        } catch (err) {
            console.error('Error al cargar detalles de rutina', err);
            error('Error al cargar rutina');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar rutina?')) {
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

    const handleSave = async (routineData) => {
        try {
            if (editingRoutine) {
                await routineService.updateRoutine(editingRoutine.id, routineData);
                success('Rutina actualizada exitosamente');
            } else {
                await routineService.createRoutine(routineData);
                success('Rutina creada exitosamente');
            }
            fetchRoutines();
            setIsModalOpen(false);
        } catch (err) {
            console.error('Error al guardar:', err);
            error('Error al guardar la rutina');
        }
    };

    const openAssignModal = async (routineId) => {
        setSelectedRoutineId(routineId);
        try {
            const studentsData = await studentService.getStudents();
            setStudents(studentsData);
            if (studentsData.length > 0) setSelectedStudentId(studentsData[0].id);
            setAssignModalOpen(true);
        } catch (err) {
            console.error('Error al cargar alumnos', err);
            error('Error al cargar alumnos');
        }
    };

    const handleAssign = async () => {
        try {
            await routineService.assignRoutine(selectedRoutineId, selectedStudentId);
            success('Rutina asignada exitosamente');
            setAssignModalOpen(false);
        } catch (err) {
            console.error('Error al asignar', err);
            error('Error al asignar rutina');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando rutinas...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <ToastContainer toasts={toasts} />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Mis Rutinas</h2>
                <button
                    onClick={handleCreate}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Nueva Rutina
                </button>
            </div>

            {routines.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow">
                    <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No hay rutinas creadas</h3>
                    <p className="mt-2 text-sm text-gray-500">Crea rutinas combinando ejercicios para asignar a tus alumnos.</p>
                    <button
                        onClick={handleCreate}
                        className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        + Crear Primera Rutina
                    </button>
                </div>
            ) : (
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
            )}

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
