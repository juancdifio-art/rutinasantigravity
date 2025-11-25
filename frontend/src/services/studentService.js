import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/students`;

const getStudents = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

const createStudent = async (studentData) => {
    const response = await axios.post(API_URL, studentData);
    return response.data;
};

const updateStudent = async (id, studentData) => {
    const response = await axios.put(`${API_URL}/${id}`, studentData);
    return response.data;
};

const deleteStudent = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

export default {
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent,
};
