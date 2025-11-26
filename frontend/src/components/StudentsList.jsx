import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, User, Mail, Phone, Link as LinkIcon, Edit2, Trash2, X, Users } from 'lucide-react';
import studentService from '../services/studentService';
import StudentForm from './StudentForm';
import { useToast, ToastContainer } from '../hooks/useToast';

const StudentsList = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const { toasts, success, error } = useToast();

    const fetchStudents = async () => {
        try {
            const data = await studentService.getStudents();
            setStudents(data);
            setFilteredStudents(data);
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

    useEffect(() => {
        const filtered = students.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (student.phone && student.phone.includes(searchTerm))
        );
        setFilteredStudents(filtered);
    }, [searchTerm, students]);

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
                    <h2 className="text-3xl font-bold text-gray-900">Mis Alumnos</h2>
                    <p className="text-gray-500 mt-1">Gestiona tus alumnos y sus rutinas</p>
                </div>
                <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
                    <Plus size={20} />
                    Nuevo Alumno
                </button>
            </div>

            {students.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
                >
                    <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users size={40} className="text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No hay alumnos registrados</h3>
                    <p className="mt-2 text-gray-500">Comienza agregando tu primer alumno para asignarle rutinas.</p>
                    <button onClick={handleCreate} className="mt-6 btn-primary inline-flex items-center gap-2">
                        <Plus size={20} />
                        Crear Primer Alumno
                    </button>
                </motion.div>
            ) : (
                <>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email o teléfono..."
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

                    {filteredStudents.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No se encontraron alumnos con esa búsqueda.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AnimatePresence>
                                {filteredStudents.map((student) => (
                                    <motion.div
                                        key={student.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="card p-5 flex flex-col gap-4 group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                    {student.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{student.name}</h3>
                                                    <p className="text-xs text-gray-500">ID: {student.id}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(student)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm text-gray-600">
                                            {student.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail size={16} className="text-gray-400" />
                                                    {student.email}
                                                </div>
                                            )}
                                            {student.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone size={16} className="text-gray-400" />
                                                    {student.phone}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => copyLink(student.public_share_id)}
                                            className="mt-auto w-full py-2 px-3 bg-gray-50 hover:bg-blue-50 text-blue-600 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors border border-gray-100 hover:border-blue-100"
                                        >
                                            <LinkIcon size={16} />
                                            Copiar Link Rutina
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </>
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
