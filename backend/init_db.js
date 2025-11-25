const { Client } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const createDatabase = async () => {
    // 1. Conectar a la base de datos 'postgres' por defecto para crear la nueva
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: 'postgres', // Conectamos a postgres para poder crear otra DB
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

    try {
        await client.connect();
        console.log('Conectado a postgres...');

        // Verificar si la base de datos ya existe
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'`);

        if (res.rowCount === 0) {
            console.log(`Creando base de datos ${process.env.DB_NAME}...`);
            await client.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
            console.log('Base de datos creada exitosamente.');
        } else {
            console.log('La base de datos ya existe.');
        }

        await client.end();

        // 2. Conectar a la nueva base de datos para aplicar el esquema
        console.log('Aplicando esquema...');
        const pool = new Client({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        });

        await pool.connect();

        const schemaPath = path.join(__dirname, 'src', 'db', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        await pool.query(schemaSql);
        console.log('Esquema aplicado exitosamente.');
        await pool.end();

    } catch (err) {
        console.error('Error al inicializar la base de datos:', err);
    }
};

createDatabase();
