import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/exercises`;

const getExercises = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

const createExercise = async (exerciseData) => {
    const response = await axios.post(API_URL, exerciseData);
    return response.data;
};

const updateExercise = async (id, exerciseData) => {
    const response = await axios.put(`${API_URL}/${id}`, exerciseData);
    return response.data;
};

const deleteExercise = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

export default {
    getExercises,
    createExercise,
    updateExercise,
    deleteExercise,
};
