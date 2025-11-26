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
        <div className="min-h-screen font-sans">
            {/* Navbar */}
            <nav className="glass-nav">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-blue-600 to-blue-500 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                                <Dumbbell className="text-white h-6 w-6" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">GymManager</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100/50 px-4 py-2 rounded-full border border-slate-200/50">
                                <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                {user?.email}
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
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
                <div className="flex p-1.5 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 mb-8 w-fit mx-auto sm:mx-0">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    relative flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-300
                                    ${isActive ? 'text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-100"
                                        initial={false}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <Icon size={18} className={isActive ? "stroke-[2.5px]" : "stroke-[2px]"} />
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
