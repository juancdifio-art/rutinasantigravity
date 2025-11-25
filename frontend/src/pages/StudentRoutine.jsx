import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const StudentRoutine = () => {
    const { public_share_id } = useParams();
    const [data, setData] = useState(null);
    const { student, routines } = data;

    return (
        <div className="max-w-3xl mx-auto p-4 font-sans">
            <header className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-gray-800">Hola, {student.name}</h1>
                <p className="text-gray-600">Aquí tienes tus rutinas asignadas</p>
            </header>

            {routines.length === 0 ? (
                <p className="text-center text-gray-500">No tienes rutinas asignadas aún.</p>
            ) : (
                routines.map((routine) => (
                    <div key={routine.id} className="mb-8 border rounded-lg shadow-sm overflow-hidden">
                        <div className="bg-blue-600 text-white p-4">
                            <h2 className="text-xl font-bold">{routine.name}</h2>
                            {routine.description && <p className="text-sm opacity-90 mt-1">{routine.description}</p>}
                        </div>

                        <div className="divide-y">
                            {routine.exercises.map((exercise, index) => (
                                <div key={index} className="p-4 hover:bg-gray-50">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-gray-800">{exercise.name}</h3>
                                        {exercise.video_url && (
                                            <a
                                                href={exercise.video_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 text-sm hover:underline"
                                            >
                                                Ver Video
                                            </a>
                                        )}
                                    </div>

                                    {exercise.description && (
                                        <p className="text-gray-600 text-sm mb-3">{exercise.description}</p>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 text-sm bg-gray-100 p-3 rounded">
                                        {exercise.series && (
                                            <div>
                                                <span className="font-semibold text-gray-500 block">Series</span>
                                                {exercise.series}
                                            </div>
                                        )}
                                        {exercise.repetitions && (
                                            <div>
                                                <span className="font-semibold text-gray-500 block">Repeticiones</span>
                                                {exercise.repetitions}
                                            </div>
                                        )}
                                        {exercise.weight && (
                                            <div>
                                                <span className="font-semibold text-gray-500 block">Peso</span>
                                                {exercise.weight}
                                            </div>
                                        )}
                                        {exercise.rest_time && (
                                            <div>
                                                <span className="font-semibold text-gray-500 block">Descanso</span>
                                                {exercise.rest_time}
                                            </div>
                                        )}
                                    </div>

                                    {exercise.notes && (
                                        <div className="mt-3 text-sm text-amber-700 bg-amber-50 p-2 rounded border border-amber-100">
                                            <strong>Nota:</strong> {exercise.notes}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default StudentRoutine;
