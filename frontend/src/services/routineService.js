import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/routines`;

const getRoutines = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

const getRoutineById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

const createRoutine = async (routineData) => {
    const response = await axios.post(API_URL, routineData);
    return response.data;
};

const updateRoutine = async (id, routineData) => {
    const response = await axios.put(`${API_URL}/${id}`, routineData);
    return response.data;
};

const deleteRoutine = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

const assignRoutine = async (routineId, studentId) => {
    const response = await axios.post(`${API_URL}/${routineId}/assign`, { student_id: studentId });
    return response.data;
};

export default {
    getRoutines,
    getRoutineById,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    assignRoutine,
};
