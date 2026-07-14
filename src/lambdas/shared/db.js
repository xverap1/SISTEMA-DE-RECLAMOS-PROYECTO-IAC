'use strict';

/**
 * Conexion compartida a MariaDB (RDS) para todas las Lambdas del sistema
 * de reclamos. Usa un pool "cacheado" a nivel de contenedor de ejecucion
 * de Lambda para reutilizar conexiones entre invocaciones (warm starts).
 */
const mysql = require('mysql2/promise');

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_POOL_SIZE || 3),
      queueLimit: 0,
      connectTimeout: 10000,
    });
  }
  return pool;
}

async function query(sql, params = []) {
  const conn = getPool();
  const [rows] = await conn.execute(sql, params);
  return rows;
}

module.exports = { getPool, query };
