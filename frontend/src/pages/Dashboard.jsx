import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StudentsList from '../components/StudentsList';
import ExerciseLibrary from '../components/ExerciseLibrary';
import RoutinesList from '../components/RoutinesList';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('students');

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-800">Gym Routines Manager</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-600">Hola, {user?.name}</span>
                            <button
                                onClick={logout}
                                className="text-sm text-red-600 hover:text-red-800 font-medium"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Tabs Navigation */}
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'students'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab('students')}
                        >
                            Alumnos
                        </button>
                        <button
                            className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'exercises'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab('exercises')}
                        >
                            Ejercicios
                        </button>
                        <button
                            className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'routines'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab('routines')}
                        >
                            Rutinas
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'students' && <StudentsList />}
                    {activeTab === 'exercises' && <ExerciseLibrary />}
                    {activeTab === 'routines' && <RoutinesList />}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
