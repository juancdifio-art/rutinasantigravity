const { Client } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const initNeon = async () => {
    console.log('Conectando a Neon DB...');
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Conectado exitosamente.');

        console.log('Leyendo esquema...');
        const schemaPath = path.join(__dirname, 'src', 'db', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Aplicando esquema en Neon...');
        await client.query(schemaSql);
        console.log('¡Tablas creadas exitosamente en Neon!');

    } catch (err) {
        console.error('Error al inicializar Neon:', err);
    } finally {
        await client.end();
    }
};

initNeon();
