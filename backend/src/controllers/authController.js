const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Verificar si el usuario ya existe
        const userCheck = await db.query('SELECT * FROM professors WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insertar nuevo profesor
        const newUser = await db.query(
            'INSERT INTO professors (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashedPassword]
        );

        // Generar JWT
        const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });

        res.status(201).json({
            message: 'Profesor registrado exitosamente',
            user: newUser.rows[0],
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar profesor
        const userResult = await db.query('SELECT * FROM professors WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        const user = userResult.rows[0];

        // Verificar password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Generar JWT
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });

        res.json({
            message: 'Login exitoso',
            user: { id: user.id, name: user.name, email: user.email },
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = {
    register,
    login,
};
