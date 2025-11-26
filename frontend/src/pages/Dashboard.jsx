import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Dumbbell, ClipboardList, LogOut } from 'lucide-react';
import StudentsList from '../components/StudentsList';
import ExerciseLibrary from '../components/ExerciseLibrary';
import RoutinesList from '../components/RoutinesList';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('students');
    const { logout, user } = useAuth();

    const tabs = [
        { id: 'students', label: 'Alumnos', icon: Users },
        { id: 'exercises', label: 'Ejercicios', icon: Dumbbell },
        { id: 'routines', label: 'Rutinas', icon: ClipboardList },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Dumbbell className="text-white h-6 w-6" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">GymManager</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                {user?.email}
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Cerrar Sesión"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200 mb-8 w-fit mx-auto sm:mx-0">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    relative flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                                    ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-blue-50 rounded-lg"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <Icon size={18} />
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'students' && <StudentsList />}
                        {activeTab === 'exercises' && <ExerciseLibrary />}
                        {activeTab === 'routines' && <RoutinesList />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Dashboard;
