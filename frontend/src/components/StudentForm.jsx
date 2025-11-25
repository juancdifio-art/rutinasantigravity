import { useState, useEffect } from 'react';

const StudentForm = ({ student, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (student) {
            setName(student.name);
            setEmail(student.email || '');
            setPhone(student.phone || '');
        }
    }, [student]);

    const validateEmail = (email) => {
        if (!email) return true; // Email is optional
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!name.trim()) {
            newErrors.name = 'El nombre es requerido';
        }

        if (email && !validateEmail(email)) {
            newErrors.email = 'Email inválido';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        onSave({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">
                        {student ? 'Editar Alumno' : 'Nuevo Alumno'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (errors.name) setErrors({ ...errors, name: null });
                                }}
                                className={`mt-1 block w-full border rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email (Opcional)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) setErrors({ ...errors, email: null });
                                }}
                                className={`mt-1 block w-full border rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="ejemplo@email.com"
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono (Opcional)</label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="+54 11 1234-5678"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
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
        </div>
    );
};

export default StudentForm;
