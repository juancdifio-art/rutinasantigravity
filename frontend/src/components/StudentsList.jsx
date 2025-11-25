import { useState, useEffect } from 'react';
import studentService from '../services/studentService';
import StudentForm from './StudentForm';
import { useToast, ToastContainer } from '../hooks/useToast';

const StudentsList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const { toasts, success, error } = useToast();

    const fetchStudents = async () => {
        try {
            const data = await studentService.getStudents();
            setStudents(data);
        } catch (err) {
            console.error('Error al cargar alumnos:', err);
            error('Error al cargar alumnos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleCreate = () => {
        setEditingStudent(null);
        setIsModalOpen(true);
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este alumno?')) {
            try {
                await studentService.deleteStudent(id);
                setStudents(students.filter(s => s.id !== id));
                success('Alumno eliminado exitosamente');
            } catch (err) {
                console.error('Error al eliminar:', err);
                error('Error al eliminar alumno');
            }
        }
    };

    const handleSave = async (studentData) => {
        try {
            if (editingStudent) {
                const updated = await studentService.updateStudent(editingStudent.id, studentData);
                setStudents(students.map(s => s.id === updated.id ? updated : s));
                success('Alumno actualizado exitosamente');
            } else {
                const created = await studentService.createStudent(studentData);
                setStudents([created, ...students]);
                success('Alumno creado exitosamente');
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error('Error al guardar:', err);
            error('Error al guardar el alumno');
        }
    };

    const copyLink = (publicId) => {
        const link = `${window.location.origin}/routine/${publicId}`;
        navigator.clipboard.writeText(link);
        success('Link copiado al portapapeles');
    };

    if (loading) return <div className="p-4">Cargando alumnos...</div>;

    return (
        <div>
            <ToastContainer toasts={toasts} />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Mis Alumnos</h2>
                <button
                    onClick={handleCreate}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                >
                    + Nuevo Alumno
                </button>
            </div>

            {students.length === 0 ? (
                <div className="text-center py-10 bg-white rounded shadow">
                    <p className="text-gray-500">No tienes alumnos registrados.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link Rutina</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{student.email}</div>
                                        <div className="text-sm text-gray-500">{student.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => copyLink(student.public_share_id)}
                                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                        >
                                            Copiar Link
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(student)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(student.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <StudentForm
                    student={editingStudent}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default StudentsList;
